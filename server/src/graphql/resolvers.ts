
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

import User from "../models/User.js";
import Bug from "../models/Bug.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import cloudinary from "../config/cloudinary.js";

import type { AuthContext } from "./context.js";
import type {
    BugPriority,
    BugSeverity,
    BugStatus,
} from "../models/Bug.js";

import {
    generateVerificationCode,
    hashVerificationCode,
    verifyCodeHash,
} from "../utils/verification.js";

import { sendVerificationEmail } from "../utils/email.js";

import type { VerificationPurpose } from "../models/User.js";

// VERIFICATION SETTINGS
const CODE_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// AVATAR UPLOAD SETTINGS
const AVATAR_FOLDER = "bugdesk/avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
];

// STRONG PASSWORD VALIDATION
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// CREATE AUTHENTICATION TOKEN
const createAuthToken = (user: {
    _id: mongoose.Types.ObjectId;
    role: string;
    tokenVersion: number;
}) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
        secret,
        { expiresIn: "1d" }
    );
};

// CLEAR VERIFICATION DETAILS
const clearVerificationDetails = (
    user: InstanceType<typeof User>
) => {
    user.verificationCodeHash = undefined;
    user.verificationCodePurpose = undefined;
    user.verificationCodeExpiresAt = undefined;
    user.verificationCodeAttempts = 0;
    user.verificationCodeLastSentAt = undefined;
};

// GENERATE, SAVE AND SEND VERIFICATION CODE
const issueVerificationCode = async (
    user: InstanceType<typeof User>,
    purpose: VerificationPurpose
) => {
    const code = generateVerificationCode();

    user.verificationCodeHash = hashVerificationCode(code);
    user.verificationCodePurpose = purpose;
    user.verificationCodeExpiresAt = new Date(
        Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000
    );
    user.verificationCodeAttempts = 0;
    user.verificationCodeLastSentAt = new Date();

    await user.save();

    try {
        await sendVerificationEmail({
            email: user.email,
            code,
            purpose,
        });
    } catch {
        clearVerificationDetails(user);
        await user.save();

        throw new GraphQLError(
            "Unable to send the verification email. Please try again later."
        );
    }
};

// VERIFY A SUBMITTED CODE
const validateVerificationCode = async (
    user: InstanceType<typeof User>,
    code: string,
    purpose: VerificationPurpose
) => {
    if (
        user.verificationCodePurpose !== purpose ||
        !user.verificationCodeHash ||
        !user.verificationCodeExpiresAt
    ) {
        throw new GraphQLError(
            "No valid verification code was found. Please request a new one."
        );
    }

    if (user.verificationCodeExpiresAt.getTime() <= Date.now()) {
        clearVerificationDetails(user);
        await user.save();

        throw new GraphQLError(
            "Your verification code has expired. Please request a new one."
        );
    }

    if (
        user.verificationCodeAttempts >= MAX_VERIFICATION_ATTEMPTS
    ) {
        clearVerificationDetails(user);
        await user.save();

        throw new GraphQLError(
            "Too many incorrect attempts. Please request a new verification code."
        );
    }

    const isValid = verifyCodeHash(
        code,
        user.verificationCodeHash
    );

    if (!isValid) {
        user.verificationCodeAttempts += 1;

        const remainingAttempts =
            MAX_VERIFICATION_ATTEMPTS -
            user.verificationCodeAttempts;

        await user.save();

        if (remainingAttempts <= 0) {
            clearVerificationDetails(user);
            await user.save();

            throw new GraphQLError(
                "Too many incorrect attempts. Please request a new verification code."
            );
        }

        throw new GraphQLError(
            `Incorrect verification code. ${remainingAttempts} attempts remaining.`
        );
    }
};

// SEND ANOTHER CODE AFTER COOLDOWN
const resendCode = async (
    user: InstanceType<typeof User>,
    purpose: VerificationPurpose
) => {
    const lastSentAt = user.verificationCodeLastSentAt;

    if (lastSentAt) {
        const elapsedSeconds =
            (Date.now() - lastSentAt.getTime()) / 1000;

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
            const remainingSeconds = Math.ceil(
                RESEND_COOLDOWN_SECONDS - elapsedSeconds
            );

            throw new GraphQLError(
                `Please wait ${remainingSeconds} seconds before requesting another code.`
            );
        }
    }

    await issueVerificationCode(user, purpose);
};

// COMMON VERIFICATION RESPONSE
const verificationResponse = (
    email: string,
    message: string,
    purpose: VerificationPurpose
) => ({
    email,
    message,
    purpose,
});

// VERIFY CLOUDINARY AVATAR RESOURCE
const getAvatarResource = async (
    publicId: string,
    userId: string
) => {
    if (!publicId || publicId.length > 300) {
        throw new GraphQLError("Invalid avatar public ID.");
    }

    let resource;

    try {
        resource = await cloudinary.api.resource(
            publicId,
            {
                resource_type: "image",
            }
        );
    } catch {
        throw new GraphQLError(
            "Uploaded avatar could not be found. Please upload the image again."
        );
    }

    if (resource.public_id !== publicId) {
        throw new GraphQLError(
            "You are not authorized to use this image."
        );
    }

    const publicIdParts = String(resource.public_id).split("/");
    const imageFileName =
        publicIdParts[publicIdParts.length - 1];

    const belongsToUser = imageFileName.startsWith(
        `${userId}_`
    );

    const belongsToFolder =
        resource.asset_folder === AVATAR_FOLDER ||
        String(resource.public_id).startsWith(
            `${AVATAR_FOLDER}/`
        );

    if (!belongsToUser || !belongsToFolder) {
        throw new GraphQLError(
            "You are not authorized to use this image."
        );
    }

    if (resource.resource_type !== "image") {
        throw new GraphQLError(
            "Only image uploads are allowed."
        );
    }

    if (
        !ALLOWED_AVATAR_FORMATS.includes(
            String(resource.format).toLowerCase()
        )
    ) {
        await cloudinary.uploader.destroy(
            resource.public_id,
            {
                resource_type: "image",
            }
        );

        throw new GraphQLError(
            "Only JPG, JPEG, PNG and WebP images are allowed."
        );
    }

    if (resource.bytes > MAX_AVATAR_SIZE) {
        await cloudinary.uploader.destroy(
            resource.public_id,
            {
                resource_type: "image",
            }
        );

        throw new GraphQLError(
            "Avatar image cannot exceed 5 MB."
        );
    }

    if (!resource.secure_url) {
        throw new GraphQLError(
            "Could not retrieve the uploaded image URL."
        );
    }

    return resource;
};

const resolvers = {
    Query: {
        // TEST QUERY
        hello: () => {
            return "Hello from Bugdesk GraphQL API!";
        },

        // GET LOGGED-IN USER
        me: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const user = await User.findById(context.user.userId);

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            return user;
        },

        // GET ALL BUGS
        bugs: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            return await Bug.find()
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort({ createdAt: -1 });
        },

        // GET BUGS ASSIGNED TO THE LOGGED-IN DEVELOPER
        myAssignedBugs: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            if (context.user.role !== "developer") {
                throw new GraphQLError(
                    "Only developers can view their assigned bugs."
                );
            }

            return await Bug.find({
                assignedTo: context.user.userId,
            })
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort({ createdAt: -1 });
        },

        // GET ONE BUG
        bug: async (
            _: unknown,
            args: { id: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            if (!mongoose.isValidObjectId(args.id)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const bug = await Bug.findById(args.id)
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email");

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            return bug;
        },

        // GET ACTIVE DEVELOPERS (ADMIN ONLY)
        developers: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            if (context.user.role !== "admin") {
                throw new GraphQLError(
                    "Only admins can view developers."
                );
            }

            return await User.find({
                role: "developer",
                isActive: true,
            });
        },

        // GET COMMENTS FOR A BUG
        comments: async (
            _: unknown,
            args: { bugId: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const { bugId } = args;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            return await Comment.find({ bug: bugId })
                .populate("author", "name email")
                .populate({
                    path: "bug",
                    populate: [
                        {
                            path: "createdBy",
                            select: "name email",
                        },
                        {
                            path: "assignedTo",
                            select: "name email",
                        },
                    ],
                })
                .sort({ createdAt: 1 });
        },

        // GET ACTIVITY HISTORY FOR A BUG
        activities: async (
            _: unknown,
            args: { bugId: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const { bugId } = args;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            return await Activity.find({
                bug: bugId,
            })
                .populate("performedBy", "name email")
                .populate({
                    path: "bug",
                    populate: [
                        {
                            path: "createdBy",
                            select: "name email",
                        },
                        {
                            path: "assignedTo",
                            select: "name email",
                        },
                    ],
                })
                .sort({ createdAt: -1 });
        },

        // GET RECENT ACTIVITIES ACROSS ALL BUGS
        recentActivities: async (
            _: unknown,
            args: { limit?: number },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const limit = Math.min(
                Math.max(args.limit ?? 10, 1),
                50
            );

            const activities = await Activity.find()
                .populate("performedBy", "name email")
                .populate({
                    path: "bug",
                    populate: [
                        {
                            path: "createdBy",
                            select: "name email",
                        },
                        {
                            path: "assignedTo",
                            select: "name email",
                        },
                    ],
                })
                .sort({ createdAt: -1 });

            return activities
                .filter((activity) => activity.bug)
                .slice(0, limit);
        },
    },

    Mutation: {
        // UPDATE USER PROFILE
        updateProfile: async (
            _: unknown,
            args: { name: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to update your profile."
                );
            }

            const name = args.name.trim();

            if (!name) {
                throw new GraphQLError(
                    "Your name cannot be empty."
                );
            }

            if (name.length < 2) {
                throw new GraphQLError(
                    "Your name must contain at least 2 characters."
                );
            }

            if (name.length > 50) {
                throw new GraphQLError(
                    "Your name cannot exceed 50 characters."
                );
            }

            const user = await User.findById(
                context.user.userId
            );

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            user.name = name;

            await user.save();

            return user;
        },

        // CHANGE PASSWORD
        changePassword: async (
            _: unknown,
            args: {
                currentPassword: string;
                newPassword: string;
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to change your password."
                );
            }

            const { currentPassword, newPassword } = args;

            if (!currentPassword || !newPassword) {
                throw new GraphQLError(
                    "Both current and new passwords are required."
                );
            }

            if (!passwordRegex.test(newPassword)) {
                throw new GraphQLError(
                    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
                );
            }

            const user = await User.findById(
                context.user.userId
            ).select("+password");

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            const passwordMatches = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!passwordMatches) {
                throw new GraphQLError(
                    "Your current password is incorrect."
                );
            }

            const isSamePassword = await bcrypt.compare(
                newPassword,
                user.password
            );

            if (isSamePassword) {
                throw new GraphQLError(
                    "Your new password must be different from your current password."
                );
            }

            user.password = await bcrypt.hash(
                newPassword,
                12
            );

            user.tokenVersion = (user.tokenVersion ?? 0) + 1;

            clearVerificationDetails(user);

            await user.save();

            return true;
        },

        // GENERATE CLOUDINARY AVATAR UPLOAD SIGNATURE
        createAvatarUploadSignature: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to upload an avatar."
                );
            }

            const user = await User.findById(
                context.user.userId
            );

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            const cloudName =
                process.env.CLOUDINARY_CLOUD_NAME;

            const apiKey =
                process.env.CLOUDINARY_API_KEY;

            const apiSecret =
                process.env.CLOUDINARY_API_SECRET;

            if (!cloudName || !apiKey || !apiSecret) {
                throw new GraphQLError(
                    "Cloudinary configuration is incomplete."
                );
            }

            const timestamp = Math.floor(Date.now() / 1000);
            const folder = AVATAR_FOLDER;

            const publicId =
                `${user._id.toString()}_${randomUUID()}`;

            const uploadParams = {
                timestamp,
                folder,
                public_id: publicId,
            };

            const signature =
                cloudinary.utils.api_sign_request(
                    uploadParams,
                    apiSecret
                );

            return {
                cloudName,
                apiKey,
                timestamp,
                signature,
                folder,
                publicId,
            };
        },

        // SAVE UPLOADED AVATAR
        saveAvatar: async (
            _: unknown,
            args: { publicId: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to save an avatar."
                );
            }

            const { publicId } = args;

            if (!publicId || publicId.length > 300) {
                throw new GraphQLError(
                    "Invalid avatar public ID."
                );
            }

            const user = await User.findById(
                context.user.userId
            );

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            const resource = await getAvatarResource(
                publicId,
                user._id.toString()
            );

            const previousPublicId = user.avatarPublicId;

            user.avatar = resource.secure_url;
            user.avatarPublicId = resource.public_id;

            await user.save();

            if (
                previousPublicId &&
                previousPublicId !== resource.public_id
            ) {
                try {
                    await cloudinary.uploader.destroy(
                        previousPublicId,
                        {
                            resource_type: "image",
                            invalidate: true,
                        }
                    );
                } catch (error) {
                    console.error(
                        "Previous avatar cleanup failed:",
                        error
                    );
                }
            }

            return user;
        },

        // REMOVE PROFILE AVATAR
        removeAvatar: async (
            _: unknown,
            __: unknown,
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to remove your avatar."
                );
            }

            const user = await User.findById(
                context.user.userId
            );

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            if (user.avatarPublicId) {
                try {
                    const result =
                        await cloudinary.uploader.destroy(
                            user.avatarPublicId,
                            {
                                resource_type: "image",
                                invalidate: true,
                            }
                        );

                    if (
                        result.result !== "ok" &&
                        result.result !== "not found"
                    ) {
                        throw new Error(
                            "Cloudinary could not delete the avatar."
                        );
                    }
                } catch {
                    throw new GraphQLError(
                        "Unable to remove your avatar. Please try again."
                    );
                }
            }

            user.avatar = "";
            user.avatarPublicId = "";

            await user.save();

            return user;
        },

        // DELETE ACCOUNT
        deleteAccount: async (
            _: unknown,
            args: { currentPassword: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to delete your account."
                );
            }

            if (!args.currentPassword) {
                throw new GraphQLError(
                    "Your current password is required."
                );
            }

            // Retrieve the account and its password.
            const user = await User.findById(
                context.user.userId
            ).select("+password");

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            // Verify the current password.
            const passwordMatches = await bcrypt.compare(
                args.currentPassword,
                user.password
            );

            if (!passwordMatches) {
                throw new GraphQLError(
                    "Your current password is incorrect."
                );
            }

            // Prevent deletion of the last active administrator.
            if (user.role === "admin") {
                const otherActiveAdmins =
                    await User.countDocuments({
                        role: "admin",
                        isActive: true,
                        _id: { $ne: user._id },
                    });

                if (otherActiveAdmins === 0) {
                    throw new GraphQLError(
                        "You cannot delete the last active administrator account."
                    );
                }
            }

            // Remove the avatar from Cloudinary.
            if (user.avatarPublicId) {
                try {
                    const result =
                        await cloudinary.uploader.destroy(
                            user.avatarPublicId,
                            {
                                resource_type: "image",
                                invalidate: true,
                            }
                        );

                    if (
                        result.result !== "ok" &&
                        result.result !== "not found"
                    ) {
                        throw new Error(
                            "Cloudinary could not delete the avatar."
                        );
                    }
                } catch {
                    throw new GraphQLError(
                        "Unable to delete your avatar. Your account has not been deleted. Please try again."
                    );
                }
            }

            // Anonymize personal information.
            user.name = "Deleted User";
            user.email =
                `deleted-${user._id.toString()}@deleted.invalid`;

            // Replace the password with a random password.
            user.password = await bcrypt.hash(
                randomUUID(),
                12
            );

            // Clear avatar information.
            user.avatar = "";
            user.avatarPublicId = "";

            // Deactivate the account.
            user.isActive = false;
            user.emailVerified = false;

            // Revoke existing authentication tokens.
            user.tokenVersion = (user.tokenVersion ?? 0) + 1;

            // Clear pending verification information.
            clearVerificationDetails(user);

            await user.save();

            return true;
        },

        // REGISTER
        register: async (
            _: unknown,
            args: {
                name: string;
                email: string;
                password: string;
                role: string;
            }
        ) => {
            const { name, email, password, role } = args;

            if (
                !name.trim() ||
                !email.trim() ||
                !password ||
                !role
            ) {
                throw new GraphQLError("All fields are required.");
            }

            if (!passwordRegex.test(password)) {
                throw new GraphQLError(
                    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
                );
            }

            if (role !== "tester" && role !== "developer") {
                throw new GraphQLError(
                    "Invalid role. Choose either tester or developer."
                );
            }

            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail,
            });

            if (existingUser) {
                throw new GraphQLError(
                    "An account with this email already exists."
                );
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role,
                emailVerified: false,
            });

            await issueVerificationCode(user, "registration");

            return verificationResponse(
                user.email,
                "Your registration code has been sent to your email address.",
                "registration"
            );
        },

        // VERIFY REGISTRATION EMAIL
        verifyRegistration: async (
            _: unknown,
            args: {
                email: string;
                code: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            const user = await User.findOne({
                email: normalizedEmail,
            }).select("+verificationCodeHash");

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "Invalid verification request."
                );
            }

            if (user.emailVerified) {
                throw new GraphQLError(
                    "This email address has already been verified."
                );
            }

            await validateVerificationCode(
                user,
                args.code.trim(),
                "registration"
            );

            user.emailVerified = true;
            clearVerificationDetails(user);

            await user.save();

            const token = createAuthToken(user);

            return {
                token,
                user,
            };
        },

        // LOGIN
        login: async (
            _: unknown,
            args: {
                email: string;
                password: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            const user = await User.findOne({
                email: normalizedEmail,
            }).select("+password");

            if (!user) {
                throw new GraphQLError("Invalid email or password.");
            }

            const passwordMatches = await bcrypt.compare(
                args.password,
                user.password
            );

            if (!passwordMatches) {
                throw new GraphQLError("Invalid email or password.");
            }

            if (!user.isActive) {
                throw new GraphQLError(
                    "This account has been deactivated."
                );
            }

            if (!user.emailVerified) {
                await issueVerificationCode(user, "registration");

                return verificationResponse(
                    user.email,
                    "Your email must be verified before logging in. A verification code has been sent.",
                    "registration"
                );
            }

            await issueVerificationCode(user, "login");

            return verificationResponse(
                user.email,
                "Your login verification code has been sent to your email address.",
                "login"
            );
        },

        // VERIFY LOGIN EMAIL
        verifyLogin: async (
            _: unknown,
            args: {
                email: string;
                code: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            const user = await User.findOne({
                email: normalizedEmail,
            }).select("+verificationCodeHash");

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "Invalid verification request."
                );
            }

            if (!user.emailVerified) {
                throw new GraphQLError(
                    "Please verify your email address first."
                );
            }

            await validateVerificationCode(
                user,
                args.code.trim(),
                "login"
            );

            clearVerificationDetails(user);
            await user.save();

            const token = createAuthToken(user);

            return {
                token,
                user,
            };
        },

        // RESEND VERIFICATION CODE
        resendVerificationCode: async (
            _: unknown,
            args: {
                email: string;
                purpose: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            const allowedPurposes: VerificationPurpose[] = [
                "registration",
                "login",
                "password-reset",
            ];

            if (
                !allowedPurposes.includes(
                    args.purpose as VerificationPurpose
                )
            ) {
                throw new GraphQLError(
                    "Invalid verification purpose."
                );
            }

            const purpose = args.purpose as VerificationPurpose;

            const user = await User.findOne({
                email: normalizedEmail,
            });

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "Unable to process this verification request."
                );
            }

            if (purpose === "registration" && user.emailVerified) {
                throw new GraphQLError(
                    "This email address is already verified."
                );
            }

            if (purpose === "login" && !user.emailVerified) {
                throw new GraphQLError(
                    "Please verify your email address first."
                );
            }

            await resendCode(user, purpose);

            return verificationResponse(
                user.email,
                "A new verification code has been sent.",
                purpose
            );
        },

        // FORGOT PASSWORD
        forgotPassword: async (
            _: unknown,
            args: {
                email: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            const user = await User.findOne({
                email: normalizedEmail,
                isActive: true,
            });

            if (!user) {
                return verificationResponse(
                    normalizedEmail,
                    "If an account exists with this email, a password-reset code will be sent.",
                    "password-reset"
                );
            }

            await issueVerificationCode(
                user,
                "password-reset"
            );

            return verificationResponse(
                normalizedEmail,
                "If an account exists with this email, a password-reset code will be sent.",
                "password-reset"
            );
        },

        // RESET PASSWORD
        resetPassword: async (
            _: unknown,
            args: {
                email: string;
                code: string;
                newPassword: string;
            }
        ) => {
            const normalizedEmail = args.email.trim().toLowerCase();

            if (!passwordRegex.test(args.newPassword)) {
                throw new GraphQLError(
                    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
                );
            }

            const user = await User.findOne({
                email: normalizedEmail,
                isActive: true,
            }).select("+verificationCodeHash +password");

            if (!user) {
                throw new GraphQLError(
                    "Invalid or expired password-reset code."
                );
            }

            await validateVerificationCode(
                user,
                args.code.trim(),
                "password-reset"
            );

            const isSamePassword = await bcrypt.compare(
                args.newPassword,
                user.password
            );

            if (isSamePassword) {
                throw new GraphQLError(
                    "Your new password must be different from your current password."
                );
            }

            user.password = await bcrypt.hash(
                args.newPassword,
                12
            );

            user.tokenVersion = (user.tokenVersion ?? 0) + 1;

            clearVerificationDetails(user);

            await user.save();

            return true;
        },

        // CREATE BUG
        createBug: async (
            _: unknown,
            args: {
                input: {
                    title: string;
                    description: string;
                    priority?: BugPriority;
                    severity?: BugSeverity;
                };
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const {
                title,
                description,
                priority,
                severity,
            } = args.input;

            if (!title.trim() || !description.trim()) {
                throw new GraphQLError(
                    "Bug title and description are required."
                );
            }

            const bug = await Bug.create({
                title: title.trim(),
                description: description.trim(),
                priority: priority ?? "medium",
                severity: severity ?? "minor",
                createdBy: context.user.userId,
            });

            await Activity.create({
                bug: bug._id,
                performedBy: context.user.userId,
                action: "bug_created",
                description: "Created this bug.",
            });

            const populatedBug = await Bug.findById(bug._id)
                .populate("createdBy", "name email");

            if (!populatedBug) {
                throw new GraphQLError(
                    "Could not retrieve the created bug."
                );
            }

            return populatedBug;
        },

        // UPDATE BUG DETAILS (ADMIN OR BUG REPORTER)
        updateBug: async (
            _: unknown,
            args: {
                bugId: string;
                input: {
                    title: string;
                    description: string;
                    priority: BugPriority;
                    severity: BugSeverity;
                };
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to update a bug."
                );
            }

            const { bugId, input } = args;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const title = input.title.trim();
            const description = input.description.trim();

            if (!title || !description) {
                throw new GraphQLError(
                    "Bug title and description are required."
                );
            }

            const allowedPriorities: BugPriority[] = [
                "low",
                "medium",
                "high",
                "critical",
            ];

            const allowedSeverities: BugSeverity[] = [
                "minor",
                "major",
                "critical",
                "blocker",
            ];

            if (!allowedPriorities.includes(input.priority)) {
                throw new GraphQLError("Invalid bug priority.");
            }

            if (!allowedSeverities.includes(input.severity)) {
                throw new GraphQLError("Invalid bug severity.");
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            const isAdmin = context.user.role === "admin";

            const isReporter =
                bug.createdBy.toString() === context.user.userId;

            if (!isAdmin && !isReporter) {
                throw new GraphQLError(
                    "You are not authorized to edit this bug."
                );
            }

            const previousValues = {
                title: bug.title,
                description: bug.description,
                priority: bug.priority,
                severity: bug.severity,
            };

            bug.title = title;
            bug.description = description;
            bug.priority = input.priority;
            bug.severity = input.severity;

            await bug.save();

            const changes: Record<string, {
                previous: string;
                new: string;
            }> = {};

            if (previousValues.title !== title) {
                changes.title = {
                    previous: previousValues.title,
                    new: title,
                };
            }

            if (previousValues.description !== description) {
                changes.description = {
                    previous: previousValues.description,
                    new: description,
                };
            }

            if (previousValues.priority !== input.priority) {
                changes.priority = {
                    previous: previousValues.priority,
                    new: input.priority,
                };
            }

            if (previousValues.severity !== input.severity) {
                changes.severity = {
                    previous: previousValues.severity,
                    new: input.severity,
                };
            }

            if (Object.keys(changes).length > 0) {
                await Activity.create({
                    bug: bug._id,
                    performedBy: context.user.userId,
                    action: "bug_updated",
                    description: "Updated bug details.",
                    metadata: {
                        changes,
                    },
                });
            }

            const updatedBug = await Bug.findById(bugId)
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email");

            if (!updatedBug) {
                throw new GraphQLError(
                    "Could not retrieve the updated bug."
                );
            }

            return updatedBug;
        },

        // ASSIGN BUG TO DEVELOPER
        assignBug: async (
            _: unknown,
            args: {
                bugId: string;
                developerId: string;
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            if (context.user.role !== "admin") {
                throw new GraphQLError(
                    "Only administrators can assign bugs."
                );
            }

            const { bugId, developerId } = args;

            if (
                !mongoose.isValidObjectId(bugId) ||
                !mongoose.isValidObjectId(developerId)
            ) {
                throw new GraphQLError(
                    "Invalid bug or developer ID."
                );
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            const developer = await User.findById(developerId);

            if (!developer || !developer.isActive) {
                throw new GraphQLError(
                    "Developer not found or account is inactive."
                );
            }

            if (developer.role !== "developer") {
                throw new GraphQLError(
                    "You can only assign bugs to developers."
                );
            }

            const previousAssignee = bug.assignedTo
                ? bug.assignedTo.toString()
                : null;

            bug.assignedTo = developer._id;

            await bug.save();

            await Activity.create({
                bug: bug._id,
                performedBy: context.user.userId,
                action: "bug_assigned",
                description: `Assigned this bug to ${developer.name}.`,
                metadata: {
                    previousAssignee,
                    newAssignee: developer._id.toString(),
                },
            });

            const updatedBug = await Bug.findById(bugId)
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email");

            if (!updatedBug) {
                throw new GraphQLError(
                    "Could not update bug assignment."
                );
            }

            return updatedBug;
        },

        // UPDATE BUG STATUS
        updateBugStatus: async (
            _: unknown,
            args: {
                bugId: string;
                status: BugStatus;
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const { bugId, status } = args;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const allowedStatuses: BugStatus[] = [
                "open",
                "in-progress",
                "resolved",
                "closed",
            ];

            if (!allowedStatuses.includes(status)) {
                throw new GraphQLError("Invalid bug status.");
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            const isAdmin = context.user.role === "admin";

            const isAssignedDeveloper =
                bug.assignedTo?.toString() === context.user.userId &&
                context.user.role === "developer";

            if (!isAdmin && !isAssignedDeveloper) {
                throw new GraphQLError(
                    "You are not authorized to update this bug's status."
                );
            }

            const previousStatus = bug.status;

            if (previousStatus === status) {
                throw new GraphQLError(
                    "The bug already has this status."
                );
            }

            bug.status = status;

            await bug.save();

            await Activity.create({
                bug: bug._id,
                performedBy: context.user.userId,
                action: "status_changed",
                description: `Changed status from ${previousStatus} to ${status}.`,
                metadata: {
                    previousStatus,
                    newStatus: status,
                },
            });

            const updatedBug = await Bug.findById(bugId)
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email");

            if (!updatedBug) {
                throw new GraphQLError(
                    "Could not retrieve the updated bug."
                );
            }

            return updatedBug;
        },

        // DELETE BUG (ADMIN ONLY)
        deleteBug: async (
            _: unknown,
            args: { bugId: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            if (context.user.role !== "admin") {
                throw new GraphQLError(
                    "Only administrators can delete bugs."
                );
            }

            const { bugId } = args;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            await Comment.deleteMany({ bug: bugId });
            await Activity.deleteMany({ bug: bugId });
            await Bug.findByIdAndDelete(bugId);

            return true;
        },

        // CREATE COMMENT
        createComment: async (
            _: unknown,
            args: {
                input: {
                    bugId: string;
                    content: string;
                };
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const { bugId, content } = args.input;

            if (!mongoose.isValidObjectId(bugId)) {
                throw new GraphQLError("Invalid bug ID.");
            }

            if (!content.trim()) {
                throw new GraphQLError("Comment cannot be empty.");
            }

            if (content.trim().length > 5000) {
                throw new GraphQLError(
                    "Comment cannot exceed 5000 characters."
                );
            }

            const bug = await Bug.findById(bugId);

            if (!bug) {
                throw new GraphQLError("Bug not found.");
            }

            const user = await User.findById(context.user.userId);

            if (!user || !user.isActive) {
                throw new GraphQLError(
                    "User account not found or inactive."
                );
            }

            const comment = await Comment.create({
                content: content.trim(),
                bug: bugId,
                author: user._id,
            });

            await Activity.create({
                bug: bug._id,
                performedBy: user._id,
                action: "comment_added",
                description: `${user.name} added a comment.`,
                metadata: {
                    commentId: comment._id.toString(),
                },
            });

            const populatedComment = await Comment.findById(
                comment._id
            )
                .populate("author", "name email")
                .populate({
                    path: "bug",
                    populate: [
                        {
                            path: "createdBy",
                            select: "name email",
                        },
                        {
                            path: "assignedTo",
                            select: "name email",
                        },
                    ],
                });

            if (!populatedComment) {
                throw new GraphQLError(
                    "Could not retrieve the created comment."
                );
            }

            return populatedComment;
        },

        // UPDATE COMMENT (ADMIN OR COMMENT AUTHOR)
        updateComment: async (
            _: unknown,
            args: {
                commentId: string;
                content: string;
            },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError(
                    "You must be logged in to update a comment."
                );
            }

            const { commentId, content } = args;

            if (!mongoose.isValidObjectId(commentId)) {
                throw new GraphQLError("Invalid comment ID.");
            }

            const trimmedContent = content.trim();

            if (!trimmedContent) {
                throw new GraphQLError(
                    "Comment content cannot be empty."
                );
            }

            if (trimmedContent.length > 5000) {
                throw new GraphQLError(
                    "Comment cannot exceed 5000 characters."
                );
            }

            const comment = await Comment.findById(commentId);

            if (!comment) {
                throw new GraphQLError("Comment not found.");
            }

            const isAdmin = context.user.role === "admin";

            const isAuthor =
                comment.author.toString() === context.user.userId;

            if (!isAdmin && !isAuthor) {
                throw new GraphQLError(
                    "You are not authorized to update this comment."
                );
            }

            comment.content = trimmedContent;

            await comment.save();

            const updatedComment = await Comment.findById(commentId)
                .populate("author", "name email")
                .populate({
                    path: "bug",
                    populate: [
                        {
                            path: "createdBy",
                            select: "name email",
                        },
                        {
                            path: "assignedTo",
                            select: "name email",
                        },
                    ],
                });

            if (!updatedComment) {
                throw new GraphQLError(
                    "Could not retrieve the updated comment."
                );
            }

            return updatedComment;
        },

        // DELETE COMMENT (ADMIN OR COMMENT AUTHOR)
        deleteComment: async (
            _: unknown,
            args: { commentId: string },
            context: AuthContext
        ) => {
            if (!context.user) {
                throw new GraphQLError("You must be logged in.");
            }

            const { commentId } = args;

            if (!mongoose.isValidObjectId(commentId)) {
                throw new GraphQLError("Invalid comment ID.");
            }

            const comment = await Comment.findById(commentId);

            if (!comment) {
                throw new GraphQLError("Comment not found.");
            }

            const isAdmin = context.user.role === "admin";

            const isAuthor =
                comment.author.toString() === context.user.userId;

            if (!isAdmin && !isAuthor) {
                throw new GraphQLError(
                    "You are not authorized to delete this comment."
                );
            }

            await Activity.create({
                bug: comment.bug,
                performedBy: context.user.userId,
                action: "comment_deleted",
                description: "Deleted a comment.",
                metadata: {
                    commentId: comment._id.toString(),
                    content: comment.content,
                },
            });

            await Comment.findByIdAndDelete(commentId);

            return true;
        },
    },

    // ACTIVITY FIELD RESOLVERS
    Activity: {
        metadata: (parent: { metadata?: unknown }) => {
            if (
                parent.metadata === null ||
                parent.metadata === undefined
            ) {
                return null;
            }

            return JSON.stringify(parent.metadata);
        },
    },
};

export default resolvers;
