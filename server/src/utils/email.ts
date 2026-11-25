
import { google } from "googleapis";

type VerificationEmailOptions = {
  email: string;
  code: string;
  purpose: "registration" | "login" | "password-reset";
};

export const sendVerificationEmail = async ({
  email,
  code,
  purpose,
}: VerificationEmailOptions): Promise<void> => {
  const gmailUser = process.env.GMAIL_USER;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail API environment variables are missing.");
  }

  const subjects = {
    registration: "Verify your Bugdesk account",
    login: "Your Bugdesk login verification code",
    "password-reset": "Reset your Bugdesk password",
  };

  const messages = {
    registration: "Use this code to verify your email address.",
    login: "Use this code to complete your login.",
    "password-reset": "Use this code to reset your password.",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; color: #333;">
      <h2 style="color: #2563eb;">Bugdesk</h2>
      <h3>${subjects[purpose]}</h3>
      <p>${messages[purpose]}</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f3f4f6; text-align: center; border-radius: 8px;">
        ${code}
      </div>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this code, you can ignore this email.</p>
    </div>
  `;

  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  auth.setCredentials({
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({
    version: "v1",
    auth,
  });

  const rawMessage = [
    `From: Bugdesk <${gmailUser}>`,
    `To: ${email}`,
    `Subject: ${subjects[purpose]}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("Verification email sent:", response.data.id);
  } catch (error) {
    console.error("Gmail API email error:", error);
    throw new Error("Failed to send verification email.");
  }
};
