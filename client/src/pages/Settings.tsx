
import { useRef, useState } from "react";
import { gql } from "@apollo/client";
import {
    useApolloClient,
    useMutation,
    useQuery,
} from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { GET_ME_QUERY } from "../graphql/queries";

// ==========================================
// GRAPHQL
// ==========================================

const CREATE_AVATAR_UPLOAD_SIGNATURE = gql`
  mutation CreateAvatarUploadSignature {
    createAvatarUploadSignature {
      cloudName
      apiKey
      timestamp
      signature
      folder
      publicId
    }
  }
`;

const SAVE_AVATAR_MUTATION = gql`
  mutation SaveAvatar($publicId: String!) {
    saveAvatar(publicId: $publicId) {
      id
      avatar
    }
  }
`;

const REMOVE_AVATAR_MUTATION = gql`
  mutation RemoveAvatar {
    removeAvatar {
      id
      avatar
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      id
      name
      email
      role
      avatar
      isActive
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    )
  }
`;

const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount($password: String!) {
    deleteAccount(currentPassword: $password)
  }
`;

// ==========================================
// TYPES
// ==========================================

interface MeResponse {
    me: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        isActive: boolean;
    };
}

interface UploadSignature {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    publicId: string;
}

interface CreateAvatarUploadSignatureResponse {
    createAvatarUploadSignature: UploadSignature;
}

interface SaveAvatarResponse {
    saveAvatar: {
        id: string;
        avatar: string | null;
    };
}

interface RemoveAvatarResponse {
    removeAvatar: {
        id: string;
        avatar: string | null;
    };
}

interface UpdateProfileResponse {
    updateProfile: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        isActive: boolean;
    };
}

interface UpdateProfileVariables {
    name: string;
}

interface ChangePasswordResponse {
    changePassword: boolean;
}

interface ChangePasswordVariables {
    currentPassword: string;
    newPassword: string;
}

interface DeleteAccountResponse {
    deleteAccount: boolean;
}

interface DeleteAccountVariables {
    password: string;
}

interface CloudinaryUploadResponse {
    public_id: string;
    secure_url: string;
    error?: {
        message: string;
    };
}

// ==========================================
// HELPERS
// ==========================================

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
}

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Small reusable icon component.
// Uses inline SVG, so no additional icon package is required.

function SettingsIcon({
    name,
    className = "h-5 w-5",
}: {
    name:
    | "user"
    | "camera"
    | "lock"
    | "palette"
    | "shield"
    | "trash"
    | "info"
    | "sun"
    | "moon"
    | "upload"
    | "check"
    | "arrow";
    className?: string;
}) {
    const paths: Record<string, React.ReactNode> = {
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21a7 7 0 0 1 14 0" />
            </>
        ),
        camera: (
            <>
                <path d="M14 4h-4l-2 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
                <circle cx="12" cy="13" r="3" />
            </>
        ),
        lock: (
            <>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                <path d="M12 14v3" />
            </>
        ),
        palette: (
            <>
                <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.7-3.1 1.8 1.8 0 0 1 1.5-2.8H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" />
                <circle cx="7.5" cy="10" r="1" />
                <circle cx="10" cy="6.5" r="1" />
                <circle cx="15" cy="7" r="1" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
            </>
        ),
        info: (
            <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 11v5M12 7h.01" />
            </>
        ),
        sun: (
            <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </>
        ),
        moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
        upload: (
            <>
                <path d="M12 16V4m-4 4 4-4 4 4" />
                <path d="M4 16v4h16v-4" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        arrow: <path d="m9 18 6-6-6-6" />,
    };

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

function SectionHeading({
    icon,
    title,
    description,
    color = "blue",
}: {
    icon: React.ComponentProps<typeof SettingsIcon>["name"];
    title: string;
    description: string;
    color?: "blue" | "violet" | "amber" | "red" | "green";
}) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    };

    return (
        <div className="mb-6 flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
                <SettingsIcon name={icon} />
            </div>

            <div>
                <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Feedback({
    message,
    type,
}: {
    message: string;
    type: "success" | "error";
}) {
    if (!message) return null;

    return (
        <div
            role="status"
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                }`}
        >
            <SettingsIcon
                name={type === "success" ? "check" : "info"}
                className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>{message}</span>
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-blue-500 dark:focus:bg-gray-950";

const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300";

const cardClass =
    "rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm shadow-gray-200/30 sm:p-6 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none";

// ==========================================
// SETTINGS COMPONENT
// ==========================================

export default function Settings() {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const { data: meData, refetch: refetchMe } =
        useQuery<MeResponse>(GET_ME_QUERY);

    const currentUser = meData?.me || user;
    const currentAvatar = currentUser?.avatar || "";

    const [profileName, setProfileName] = useState(user?.name || "");

    const [avatarError, setAvatarError] = useState("");
    const [avatarSuccess, setAvatarSuccess] = useState("");

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [deleteCurrentPassword, setDeleteCurrentPassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const [
        createAvatarUploadSignature,
        { loading: creatingSignature },
    ] = useMutation<CreateAvatarUploadSignatureResponse>(
        CREATE_AVATAR_UPLOAD_SIGNATURE
    );

    const [saveAvatar, { loading: savingAvatar }] =
        useMutation<SaveAvatarResponse>(SAVE_AVATAR_MUTATION);

    const [removeAvatar, { loading: removingAvatar }] =
        useMutation<RemoveAvatarResponse>(REMOVE_AVATAR_MUTATION);

    const [updateProfile, { loading: updatingProfile }] =
        useMutation<UpdateProfileResponse, UpdateProfileVariables>(
            UPDATE_PROFILE_MUTATION
        );

    const [changePassword, { loading: changingPassword }] =
        useMutation<ChangePasswordResponse, ChangePasswordVariables>(
            CHANGE_PASSWORD_MUTATION
        );

    const [
        deleteAccountMutation,
        { loading: deletingAccount },
    ] = useMutation<DeleteAccountResponse, DeleteAccountVariables>(
        DELETE_ACCOUNT_MUTATION
    );

    // ==========================================
    // AVATAR UPLOAD
    // ==========================================

    async function handleAvatarUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarError("");
        setAvatarSuccess("");

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setAvatarError("Please select a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setAvatarError("Image size must not exceed 5 MB.");
            event.target.value = "";
            return;
        }

        try {
            const signatureResult = await createAvatarUploadSignature();
            const signature = signatureResult.data?.createAvatarUploadSignature;

            if (!signature) {
                throw new Error("Could not generate avatar upload credentials.");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signature.apiKey);
            formData.append("timestamp", String(signature.timestamp));
            formData.append("signature", signature.signature);
            formData.append("folder", signature.folder);
            formData.append("public_id", signature.publicId);

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const uploadData =
                (await uploadResponse.json()) as CloudinaryUploadResponse;

            if (!uploadResponse.ok || !uploadData.public_id) {
                throw new Error(
                    uploadData.error?.message || "Avatar upload failed."
                );
            }

            const saveResult = await saveAvatar({
                variables: { publicId: uploadData.public_id },
            });

            const savedAvatar = saveResult.data?.saveAvatar;

            if (!savedAvatar) {
                throw new Error("Could not save your avatar.");
            }

            updateUser({ avatar: savedAvatar.avatar });
            await refetchMe();

            setAvatarSuccess("Profile picture updated successfully.");
        } catch (error: unknown) {
            setAvatarError(getErrorMessage(error));
        } finally {
            event.target.value = "";
        }
    }

    // ==========================================
    // REMOVE AVATAR
    // ==========================================

    async function handleRemoveAvatar() {
        setAvatarError("");
        setAvatarSuccess("");

        try {
            const result = await removeAvatar();
            const updatedAvatar = result.data?.removeAvatar;

            if (!updatedAvatar) {
                throw new Error("Could not remove your profile picture.");
            }

            updateUser({ avatar: updatedAvatar.avatar });
            await refetchMe();

            setAvatarSuccess("Profile picture removed successfully.");
        } catch (error: unknown) {
            setAvatarError(getErrorMessage(error));
        }
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    async function handleUpdateProfile(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        const trimmedName = profileName.trim();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            setProfileError("Your name must be between 2 and 50 characters.");
            return;
        }

        try {
            const result = await updateProfile({
                variables: { name: trimmedName },
            });

            const updatedUser = result.data?.updateProfile;

            if (!updatedUser) {
                throw new Error("Could not update your profile.");
            }

            updateUser({
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                isActive: updatedUser.isActive,
            });

            setProfileName(updatedUser.name);
            await refetchMe();

            setProfileSuccess("Profile updated successfully.");
        } catch (error: unknown) {
            setProfileError(getErrorMessage(error));
        }
    }

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    async function handleChangePassword(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please complete all password fields.");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setPasswordError(
                "Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character (@$!%*?&)."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Your new passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "Your new password must be different from your current password."
            );
            return;
        }

        try {
            const result = await changePassword({
                variables: { currentPassword, newPassword },
            });

            if (result.data?.changePassword !== true) {
                throw new Error("Password change was unsuccessful.");
            }

            setPasswordSuccess(
                "Password changed successfully. Please log in again."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            await apolloClient.clearStore();
            logout();
            navigate("/login", { replace: true });
        } catch (error: unknown) {
            setPasswordError(getErrorMessage(error));
        }
    }

    // ==========================================
    // DELETE ACCOUNT
    // ==========================================

    async function handleDeleteAccount(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setDeleteError("");

        if (!deleteCurrentPassword) {
            setDeleteError("Please enter your current password.");
            return;
        }

        try {
            const result = await deleteAccountMutation({
                variables: { password: deleteCurrentPassword },
            });

            if (result.data?.deleteAccount !== true) {
                throw new Error("Account deletion was unsuccessful.");
            }

            await apolloClient.clearStore();
            logout();
            navigate("/login", { replace: true });
        } catch (error: unknown) {
            setDeleteError(getErrorMessage(error));
        }
    }

    const isUploadingAvatar = creatingSignature || savingAvatar;
    const isAvatarBusy = isUploadingAvatar || removingAvatar;

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="mx-auto w-full max-w-5xl space-y-7 pb-12">

            {/* PAGE HEADER */}

            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
                <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

                <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                        <SettingsIcon name="shield" className="h-3.5 w-3.5" />
                        Account preferences
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Settings
                    </h1>

                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-100/75 sm:text-base">
                        Personalize your Bugdesk experience and manage your
                        account, security, and preferences.
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/15 font-semibold">
                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                currentUser?.name?.charAt(0).toUpperCase() || "U"
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                {currentUser?.name || "Your account"}
                            </p>
                            <p className="text-xs text-blue-100/70">
                                {currentUser?.email || ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROFILE PICTURE */}

            <section className={cardClass}>
                <SectionHeading
                    icon="camera"
                    title="Profile picture"
                    description="Choose an image that represents you across Bugdesk."
                    color="violet"
                />

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            currentUser?.name?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {currentUser?.name || "Your profile"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            JPG, PNG, or WebP. Maximum size of 5 MB.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                disabled={isAvatarBusy}
                                onClick={() => avatarInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <SettingsIcon name="upload" className="h-4 w-4" />
                                {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                            </button>

                            {currentAvatar && (
                                <button
                                    type="button"
                                    disabled={isAvatarBusy}
                                    onClick={handleRemoveAvatar}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
                                >
                                    {removingAvatar ? "Removing..." : "Remove photo"}
                                </button>
                            )}
                        </div>

                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="mt-5 space-y-2">
                    <Feedback message={avatarError} type="error" />
                    <Feedback message={avatarSuccess} type="success" />
                </div>
            </section>

            {/* PROFILE INFORMATION */}

            <section className={cardClass}>
                <SectionHeading
                    icon="user"
                    title="Personal information"
                    description="Update the details associated with your Bugdesk account."
                    color="blue"
                />

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="profileName" className={labelClass}>
                                Full name
                            </label>
                            <input
                                id="profileName"
                                type="text"
                                value={profileName}
                                onChange={(event) => setProfileName(event.target.value)}
                                minLength={2}
                                maxLength={50}
                                placeholder="Enter your full name"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="profileEmail" className={labelClass}>
                                Email address
                            </label>
                            <input
                                id="profileEmail"
                                type="email"
                                value={currentUser?.email || ""}
                                readOnly
                                className={`${inputClass} cursor-not-allowed opacity-70`}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Email changes are not available here.
                            </p>
                        </div>
                    </div>

                    <Feedback message={profileError} type="error" />
                    <Feedback message={profileSuccess} type="success" />

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Your name is visible to your Bugdesk team.
                        </p>

                        <button
                            type="submit"
                            disabled={updatingProfile}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updatingProfile ? "Saving changes..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>

            {/* PASSWORD */}

            <section className={cardClass}>
                <SectionHeading
                    icon="lock"
                    title="Password and security"
                    description="Keep your account secure by using a strong, unique password."
                    color="green"
                />

                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="currentPassword" className={labelClass}>
                                Current password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                placeholder="Enter your current password"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className={labelClass}>
                                New password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="Create a new password"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={labelClass}>
                                Confirm new password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Re-enter your new password"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                            Password requirements
                        </p>
                        <ul className="grid gap-2 text-xs text-blue-900/80 sm:grid-cols-2 dark:text-blue-200/80">
                            <li>• At least 8 characters</li>
                            <li>• One uppercase and lowercase letter</li>
                            <li>• At least one number</li>
                            <li>• One special character (@$!%*?&)</li>
                        </ul>
                    </div>

                    <Feedback message={passwordError} type="error" />
                    <Feedback message={passwordSuccess} type="success" />

                    <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {changingPassword ? "Updating password..." : "Update password"}
                        </button>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            You will need to log in again after changing your password.
                        </p>
                    </div>
                </form>
            </section>

            {/* APPEARANCE */}

            <section className={cardClass}>
                <SectionHeading
                    icon="palette"
                    title="Appearance"
                    description="Choose the look and feel of your Bugdesk workspace."
                    color="amber"
                />

                <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-950/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm dark:bg-gray-800">
                            <SettingsIcon name={isDarkMode ? "moon" : "sun"} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {isDarkMode ? "Dark appearance" : "Light appearance"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {isDarkMode
                                    ? "A darker workspace for low-light environments."
                                    : "A bright and clean workspace."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={isDarkMode}
                        aria-label="Toggle dark mode"
                        onClick={toggleTheme}
                        className={`relative h-7 w-14 shrink-0 rounded-full transition-colors ${isDarkMode ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? "translate-x-7" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>
            </section>

            {/* ACCOUNT INFORMATION */}

            <section className={cardClass}>
                <SectionHeading
                    icon="shield"
                    title="Account overview"
                    description="A quick overview of your Bugdesk account."
                    color="green"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Account role
                        </p>
                        <p className="mt-2 text-lg font-bold capitalize text-gray-900 dark:text-white">
                            {currentUser?.role || "N/A"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Account status
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${currentUser?.isActive ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                            />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {currentUser?.isActive ? "Active" : "Inactive"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DANGER ZONE */}

            <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-950 dark:bg-gray-900">
                <div className="border-b border-red-100 bg-red-50/70 px-5 py-4 dark:border-red-950 dark:bg-red-950/20 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            <SettingsIcon name="trash" />
                        </div>
                        <div>
                            <h2 className="font-bold text-red-700 dark:text-red-400">
                                Danger zone
                            </h2>
                            <p className="text-xs text-red-600/80 dark:text-red-400/70">
                                Permanent account actions
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                Delete your account
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Permanently delete your account. This action cannot be undone.
                            </p>
                        </div>

                        {!showDeleteForm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteForm(true);
                                    setDeleteError("");
                                }}
                                className="shrink-0 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                            >
                                Delete account
                            </button>
                        )}
                    </div>

                    {showDeleteForm && (
                        <form
                            onSubmit={handleDeleteAccount}
                            className="mt-5 space-y-4 rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-950 dark:bg-red-950/10"
                        >
                            <div>
                                <label
                                    htmlFor="deleteCurrentPassword"
                                    className={labelClass}
                                >
                                    Confirm your current password
                                </label>
                                <input
                                    id="deleteCurrentPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    value={deleteCurrentPassword}
                                    onChange={(event) =>
                                        setDeleteCurrentPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <Feedback message={deleteError} type="error" />

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={deletingAccount}
                                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletingAccount ? "Deleting..." : "Permanently delete"}
                                </button>

                                <button
                                    type="button"
                                    disabled={deletingAccount}
                                    onClick={() => {
                                        setShowDeleteForm(false);
                                        setDeleteCurrentPassword("");
                                        setDeleteError("");
                                    }}
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            {/* ABOUT */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <SettingsIcon name="info" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-gray-900 dark:text-white">
                            About Bugdesk
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            Bugdesk helps development teams report bugs, assign tasks,
                            track progress, and collaborate on resolving issues.
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                            <span className="text-xs text-gray-400">
                                Built for better team collaboration
                            </span>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                Version 1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
