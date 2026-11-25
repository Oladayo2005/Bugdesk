
import { Link } from "react-router-dom";

function PrivacyPolicy() {
    const contactEmail = "OGUNZDAYO@GMAIL.COM";

    return (
        <main style={styles.page}>
            <article style={styles.content}>
                <Link to="/login" style={styles.backLink}>
                    ← Back to Bugdesk
                </Link>

                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.muted}>Effective date: November 25, 2026</p>

                <p>
                    Bugdesk ("we", "our", or "the application") is a bug
                    reporting and issue-tracking platform. This Privacy
                    Policy explains how we collect, use, and protect
                    information when you use Bugdesk.
                </p>

                <h2>1. Information We Collect</h2>
                <p>Depending on how you use Bugdesk, we may collect:</p>
                <ul>
                    <li>
                        Account information, including your name, email
                        address, password credentials, and account role.
                    </li>
                    <li>
                        Profile information, including an avatar image
                        if you choose to upload one.
                    </li>
                    <li>
                        Bug reports, descriptions, priorities, severity,
                        status, assignments, and related comments.
                    </li>
                    <li>
                        Verification information used for registration,
                        login, and password recovery.
                    </li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul>
                    <li>Create and manage user accounts.</li>
                    <li>Authenticate users and protect account access.</li>
                    <li>Send email verification and password-reset codes.</li>
                    <li>Allow teams to report, assign, and track bugs.</li>
                    <li>Display user profiles and issue-related activity.</li>
                    <li>Maintain and improve the application's functionality.</li>
                </ul>

                <h2>3. Third-Party Services</h2>
                <p>
                    Bugdesk uses third-party services to operate. These
                    may include:
                </p>
                <ul>
                    <li>
                        <strong>MongoDB Atlas:</strong> to store application
                        and account information.
                    </li>
                    <li>
                        <strong>Cloudinary:</strong> to store and deliver
                        uploaded profile images.
                    </li>
                    <li>
                        <strong>Google Gmail API:</strong> to send account
                        verification and password-reset emails.
                    </li>
                    <li>
                        <strong>Render and Vercel:</strong> to host the
                        backend and frontend application.
                    </li>
                </ul>
                <p>
                    These providers process information as necessary to
                    provide their services and are subject to their own
                    privacy policies and terms.
                </p>

                <h2>4. Data Security</h2>
                <p>
                    We use reasonable technical measures to protect
                    account information, including authentication controls
                    and secure password handling. However, no internet
                    transmission or storage system can be guaranteed
                    completely secure.
                </p>

                <h2>5. Data Retention</h2>
                <p>
                    We retain information for as long as necessary to
                    provide Bugdesk, maintain accounts, support issue
                    tracking, and meet legitimate operational requirements.
                    You may contact us to request assistance with your
                    account information.
                </p>

                <h2>6. Your Choices</h2>
                <p>
                    You are responsible for keeping your login credentials
                    secure. You should avoid including passwords or other
                    highly sensitive personal information in bug reports
                    and comments.
                </p>

                <h2>7. Children's Privacy</h2>
                <p>
                    Bugdesk is not designed to knowingly collect personal
                    information from children under the age required
                    by applicable law.
                </p>

                <h2>8. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy as the application
                    develops. Any updated version will be published on
                    this page with a revised effective date.
                </p>

                <h2>9. Contact Us</h2>
                <p>
                    For privacy-related questions or requests, contact us
                    at:
                </p>
                <p>
                    <a href={`mailto:${contactEmail}`} style={styles.link}>
                        {contactEmail}
                    </a>
                </p>

                <footer style={styles.footer}>
                    <Link to="/terms" style={styles.link}>
                        Terms of Service
                    </Link>
                    {" · "}
                    <Link to="/login" style={styles.link}>
                        Bugdesk Login
                    </Link>
                </footer>
            </article>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "48px 20px",
        color: "#334155",
        fontFamily: "Arial, sans-serif",
    },
    content: {
        maxWidth: "850px",
        margin: "0 auto",
        padding: "40px",
        background: "#ffffff",
        borderRadius: "12px",
        lineHeight: 1.7,
    },
    title: {
        color: "#0f172a",
        fontSize: "32px",
        marginBottom: "4px",
    },
    muted: {
        color: "#64748b",
        fontSize: "14px",
    },
    backLink: {
        color: "#2563eb",
        textDecoration: "none",
    },
    link: {
        color: "#2563eb",
        textDecoration: "none",
    },
    footer: {
        borderTop: "1px solid #e2e8f0",
        marginTop: "40px",
        paddingTop: "20px",
    },
};

export default PrivacyPolicy;
