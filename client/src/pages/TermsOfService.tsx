
import { Link } from "react-router-dom";

function TermsOfService() {
    const contactEmail = "OGUNZDAYO@GMAIL.COM";

    return (
        <main style={styles.page}>
            <article style={styles.content}>
                <Link to="/login" style={styles.backLink}>
                    ← Back to Bugdesk
                </Link>

                <h1 style={styles.title}>Terms of Service</h1>
                <p style={styles.muted}>Effective date: November 25, 2026</p>

                <p>
                    Welcome to Bugdesk. These Terms of Service govern
                    your access to and use of the Bugdesk bug reporting
                    and issue-tracking application. By using Bugdesk,
                    you agree to these terms.
                </p>

                <h2>1. Purpose of Bugdesk</h2>
                <p>
                    Bugdesk provides tools for teams to report software
                    issues, assign bugs to developers, track progress,
                    and discuss reported problems.
                </p>

                <h2>2. User Accounts</h2>
                <ul>
                    <li>You must provide accurate registration information.</li>
                    <li>You are responsible for keeping your credentials secure.</li>
                    <li>
                        You must not impersonate another person or use
                        another person's account without permission.
                    </li>
                    <li>
                        You must notify the application administrator if
                        you suspect unauthorized access to your account.
                    </li>
                </ul>

                <h2>3. Acceptable Use</h2>
                <p>When using Bugdesk, you agree not to:</p>
                <ul>
                    <li>Attempt to access accounts or data without authorization.</li>
                    <li>Interfere with the application's security or operation.</li>
                    <li>Upload malicious files or harmful content.</li>
                    <li>Use the application for unlawful activities.</li>
                    <li>Submit misleading or abusive content.</li>
                </ul>

                <h2>4. Bug Reports and User Content</h2>
                <p>
                    Users are responsible for the bug reports, comments,
                    descriptions, and other content they submit. Do not
                    include passwords, private access tokens, or other
                    confidential credentials in submitted content.
                </p>

                <h2>5. Roles and Permissions</h2>
                <p>
                    Bugdesk may provide different permissions for
                    administrators and developers. Access to features
                    such as bug assignment, status updates, and deletion
                    depends on the role and permissions assigned to
                    an account.
                </p>

                <h2>6. Intellectual Property</h2>
                <p>
                    The Bugdesk application, including its design,
                    branding, and software components, may be protected
                    by applicable intellectual property laws. Users
                    retain responsibility for content they submit and
                    must have the necessary rights to submit it.
                </p>

                <h2>7. Availability and Changes</h2>
                <p>
                    We may modify, suspend, or discontinue parts of
                    Bugdesk as necessary. We do not guarantee that
                    the application will always be available or free
                    from errors and interruptions.
                </p>

                <h2>8. Account Suspension</h2>
                <p>
                    Access may be restricted or suspended when an
                    account is used in violation of these terms or
                    when necessary to protect the application and
                    its users.
                </p>

                <h2>9. Limitation of Liability</h2>
                <p>
                    To the extent permitted by applicable law, Bugdesk
                    is provided without guarantees that it will meet
                    every user's requirements. We are not responsible
                    for losses arising from interruptions, unauthorized
                    access, or misuse of the application, except where
                    liability cannot legally be excluded.
                </p>

                <h2>10. Changes to These Terms</h2>
                <p>
                    We may update these Terms of Service from time
                    to time. Updated terms will be published on
                    this page with a revised effective date.
                </p>

                <h2>11. Contact</h2>
                <p>
                    For questions about these terms, contact:
                </p>
                <p>
                    <a href={`mailto:${contactEmail}`} style={styles.link}>
                        {contactEmail}
                    </a>
                </p>

                <footer style={styles.footer}>
                    <Link to="/privacy" style={styles.link}>
                        Privacy Policy
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

export default TermsOfService;
