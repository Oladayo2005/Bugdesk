
import nodemailer from "nodemailer";

type VerificationEmailOptions = {
    email: string;
    code: string;
    purpose: "registration" | "login" | "password-reset";
};

export const sendVerificationEmail = async ({
    email,
    code,
    purpose,
}: VerificationEmailOptions) => {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
        throw new Error("Gmail email credentials are not configured.");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: gmailUser,
            pass: gmailPassword.replace(/\s/g, ""),
        },
    });

    const subjects = {
        registration: "Verify your Bugdesk account",
        login: "Your Bugdesk login verification code",
        "password-reset": "Reset your Bugdesk password",
    };

    const messages = {
        registration:
            "Use this code to verify your email address and complete your Bugdesk registration.",
        login: "Use this code to complete your Bugdesk login.",
        "password-reset":
            "Use this code to verify your request to reset your Bugdesk password.",
    };

    try {
        const info = await transporter.sendMail({
            from: `"Bugdesk" <${gmailUser}>`,
            to: email,
            subject: subjects[purpose],
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 30px; color: #1f2937;">
                    <div style="background: #14532d; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0;">BUGDESK</h1>
                        <p style="color: #d9f99d; margin-bottom: 0;">Find bugs. Fix things. Ship better.</p>
                    </div>

                    <div style="padding: 28px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
                        <h2 style="margin-top: 0;">${subjects[purpose]}</h2>

                        <p>${messages[purpose]}</p>

                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                            <p style="margin: 0 0 8px; color: #166534; font-size: 13px;">YOUR VERIFICATION CODE</p>
                            <h1 style="letter-spacing: 10px; color: #14532d; margin: 0; font-size: 32px;">
                                ${code}
                            </h1>
                        </div>

                        <p>This code expires in <strong>10 minutes</strong>.</p>

                        <p style="color: #6b7280; font-size: 13px;">
                            If you did not request this code, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });

        console.log("Verification email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Gmail email error:", error);
        throw new Error("Unable to send verification email.");
    }
};
