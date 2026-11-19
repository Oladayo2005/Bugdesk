
import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
    type ClipboardEvent,
} from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import AuthFooter from "../components/AuthFooter";

import {
    VERIFY_REGISTRATION_MUTATION,
    VERIFY_LOGIN_MUTATION,
    RESEND_VERIFICATION_CODE_MUTATION,
} from "../graphql/mutations";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    isActive: boolean;
    emailVerified: boolean;
}

interface AuthResponse {
    token: string;
    user: User;
}

interface VerificationResponse {
    verifyRegistration?: AuthResponse;
    verifyLogin?: AuthResponse;
}

interface ResendResponse {
    resendVerificationCode: {
        email: string;
        message: string;
    };
}

type VerificationPurpose = "registration" | "login";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const email = searchParams.get("email") || "";
    const requestedPurpose = searchParams.get("purpose");

    const purpose: VerificationPurpose =
        requestedPurpose === "registration" ? "registration" : "login";

    const [code, setCode] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [verifyRegistration, { loading: registrationLoading }] =
        useMutation<VerificationResponse>(VERIFY_REGISTRATION_MUTATION);

    const [verifyLogin, { loading: loginLoading }] =
        useMutation<VerificationResponse>(VERIFY_LOGIN_MUTATION);

    const [resendCode, { loading: resendLoading }] =
        useMutation<ResendResponse>(RESEND_VERIFICATION_CODE_MUTATION);

    const loading = registrationLoading || loginLoading;

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = window.setTimeout(() => {
            setCountdown((previous) => previous - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [countdown]);

    // Handle individual verification-code inputs
    const handleCodeChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        const updatedCode = code.split("");
        updatedCode[index] = digit;

        const newCode = Array.from(
            { length: 6 },
            (_, i) => updatedCode[i] || ""
        ).join("");

        setCode(newCode);
        setErrorMessage("");
        setMessage("");

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Move backwards when deleting an empty input
    const handleKeyDown = (
        index: number,
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Allow users to paste their complete verification code
    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();

        const pastedCode = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedCode) return;

        setCode(pastedCode);
        setErrorMessage("");
        setMessage("");

        const nextIndex = Math.min(pastedCode.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");
        setMessage("");

        if (!email) {
            setErrorMessage(
                "Email address is missing. Please register or log in again."
            );
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            setErrorMessage("Please enter a valid six-digit verification code.");
            return;
        }

        try {
            const result =
                purpose === "registration"
                    ? await verifyRegistration({
                          variables: { email, code },
                      })
                    : await verifyLogin({
                          variables: { email, code },
                      });

            const authData =
                purpose === "registration"
                    ? result.data?.verifyRegistration
                    : result.data?.verifyLogin;

            if (!authData?.token || !authData.user) {
                throw new Error("Verification failed. Please try again.");
            }

            login(authData.token, authData.user);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to verify your email. Please try again."
            );
        }
    };

    const handleResend = async () => {
        setErrorMessage("");
        setMessage("");

        if (!email) {
            setErrorMessage(
                "Email address is missing. Please register or log in again."
            );
            return;
        }

        if (countdown > 0 || resendLoading) return;

        try {
            const result = await resendCode({
                variables: {
                    email,
                    purpose,
                },
            });

            if (!result.data?.resendVerificationCode) {
                throw new Error("Unable to resend verification code.");
            }

            setMessage(
                result.data.resendVerificationCode.message ||
                    "A new verification code has been sent."
            );

            setCountdown(60);
            setCode("");
            inputRefs.current[0]?.focus();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to resend verification code."
            );
        }
    };

    // Missing email state
    if (!email) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0b120e]">
                <main className="flex flex-1 items-center justify-center px-4 py-10">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-[#142019]">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Verification link incomplete
                        </h1>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            We could not find your email address. Please return
                            to the login or registration page.
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-lg bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
                        >
                            Back to Login
                        </Link>
                    </div>
                </main>

                <AuthFooter />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0b120e]">
            <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#142019] lg:min-h-170 lg:grid-cols-2">

                    {/* Left branding panel */}
                    <section className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-green-950 via-green-900 to-[#163d27] p-10 text-white lg:flex xl:p-14">

                        {/* Decorative circles */}
                        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-lime-400/10" />
                        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-lime-400/10" />
                        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-lime-400/5 blur-2xl" />

                        <div className="relative z-10">
                            <Link
                                to="/"
                                className="text-3xl font-extrabold tracking-tight"
                            >
                                BUGDESK<span className="text-lime-400">.</span>
                            </Link>

                            <p className="mt-2 text-sm text-green-100/70">
                                Find bugs. Fix things. Ship better.
                            </p>
                        </div>

                        <div className="relative z-10 max-w-lg">

                            {/* Security illustration */}
                            <div className="mb-10 flex h-56 items-center justify-center">
                                <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-lime-300/20 bg-green-800/40">
                                    <div className="absolute h-36 w-36 rounded-full border border-lime-300/20" />

                                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-lime-300/30 bg-green-950/60 shadow-2xl shadow-black/20">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-16 w-16 text-lime-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 3l8 3v5c0 5.1-3.4 8.7-8 10-4.6-1.3-8-4.9-8-10V6l8-3z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12l2 2 4-4"
                                            />
                                        </svg>
                                    </div>

                                    <div className="absolute -right-2 top-7 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-green-950 shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>

                                    <div className="absolute -bottom-2 left-1 flex h-11 w-11 items-center justify-center rounded-xl border border-green-700 bg-green-800 text-lime-300 shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                                {purpose === "registration"
                                    ? "One more step to get started."
                                    : "Welcome back. Let's secure your access."}
                            </h1>

                            <p className="mt-5 max-w-md text-base leading-7 text-green-100/80">
                                {purpose === "registration"
                                    ? "Verify your email address to activate your Bugdesk workspace and start managing issues with your team."
                                    : "Your security matters. Confirm your identity to access your Bugdesk workspace safely."}
                            </p>

                            <div className="mt-8 flex items-center gap-3 text-sm text-lime-300">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400/10">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </span>
                                Secure email verification
                            </div>
                        </div>
                    </section>

                    {/* Right verification panel */}
                    <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-16">

                        <div className="mx-auto w-full max-w-md">

                            {/* Mobile brand */}
                            <div className="mb-10 text-center lg:hidden">
                                <Link
                                    to="/"
                                    className="text-3xl font-extrabold tracking-tight text-green-900 dark:text-lime-400"
                                >
                                    BUGDESK<span className="text-lime-500">.</span>
                                </Link>

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Find bugs. Fix things. Ship better.
                                </p>
                            </div>

                            {/* Heading */}
                            <div className="text-center sm:text-left">
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-lime-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-7 w-7"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.6}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Verify your email
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    {purpose === "registration"
                                        ? "Your Bugdesk account is almost ready. Enter the six-digit code we sent to your email."
                                        : "Enter the six-digit login verification code we sent to your email."}
                                </p>

                                <p className="mt-3 break-all text-sm font-semibold text-green-800 dark:text-lime-400">
                                    {email}
                                </p>
                            </div>

                            {/* Verification form */}
                            <form onSubmit={handleVerify} className="mt-9">
                                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Enter verification code
                                </label>

                                <div className="flex justify-between gap-2 sm:gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <input
                                            key={index}
                                            ref={(element) => {
                                                inputRefs.current[index] = element;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete={
                                                index === 0 ? "one-time-code" : "off"
                                            }
                                            maxLength={1}
                                            value={code[index] || ""}
                                            onChange={(event) =>
                                                handleCodeChange(index, event.target.value)
                                            }
                                            onKeyDown={(event) =>
                                                handleKeyDown(index, event)
                                            }
                                            onPaste={handlePaste}
                                            aria-label={`Verification digit ${index + 1}`}
                                            className="h-14 min-w-0 w-full rounded-xl border border-gray-300 bg-gray-50 text-center text-xl font-bold text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-gray-700 dark:bg-[#0b120e] dark:text-white sm:h-16 sm:text-2xl"
                                        />
                                    ))}
                                </div>

                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    Enter the six-digit code from your email.
                                </p>

                                {errorMessage && (
                                    <p
                                        role="alert"
                                        className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    >
                                        {errorMessage}
                                    </p>
                                )}

                                {message && (
                                    <p
                                        role="status"
                                        className="mt-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    >
                                        {message}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className="mt-7 w-full rounded-xl bg-green-800 px-4 py-4 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-500 dark:text-green-950 dark:hover:bg-lime-400"
                                >
                                    {loading
                                        ? "Verifying..."
                                        : "Verify and Continue"}
                                </button>
                            </form>

                            {/* Resend code */}
                            <div className="mt-7 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Didn't receive a code?
                                </p>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || resendLoading}
                                    className="mt-2 text-sm font-semibold text-green-800 transition hover:text-green-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-lime-400 dark:hover:text-lime-300"
                                >
                                    {resendLoading
                                        ? "Sending..."
                                        : countdown > 0
                                            ? `Resend code in ${countdown}s`
                                            : "Resend verification code"}
                                </button>
                            </div>

                            {/* Back to login */}
                            <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-700">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 transition hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                                >
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <AuthFooter />
        </div>
    );
}
