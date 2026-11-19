
import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
    RESET_PASSWORD_MUTATION,
    RESEND_VERIFICATION_CODE_MUTATION,
} from "../graphql/mutations";
import AuthFooter from "../components/AuthFooter";

interface ResetPasswordResponse {
    resetPassword: boolean;
}

interface ResendVerificationCodeResponse {
    resendVerificationCode: {
        message: string;
        email: string;
        purpose: string;
    };
}

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get("email") || "";

    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [countdown, setCountdown] = useState(0);

    const [resetPassword, { loading }] =
        useMutation<ResetPasswordResponse>(RESET_PASSWORD_MUTATION);

    const [resendCode, { loading: resendLoading }] =
        useMutation<ResendVerificationCodeResponse>(
            RESEND_VERIFICATION_CODE_MUTATION
        );

    // Resend countdown
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = window.setTimeout(() => {
            setCountdown((previous) => previous - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [countdown]);

    const passwordChecks = [
        {
            label: "At least 8 characters",
            valid: password.length >= 8,
        },
        {
            label: "One uppercase letter",
            valid: /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter",
            valid: /[a-z]/.test(password),
        },
        {
            label: "One number",
            valid: /\d/.test(password),
        },
        {
            label: "One special character (@$!%*?&)",
            valid: /[@$!%*?&]/.test(password),
        },
    ];

    const isPasswordValid = passwordRegex.test(password);

    // Resend password reset code
    const handleResendCode = async () => {
        if (!email || countdown > 0 || resendLoading) return;

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const { data } = await resendCode({
                variables: {
                    email,
                    purpose: "password-reset",
                },
            });

            if (!data?.resendVerificationCode) {
                throw new Error("Unable to resend your reset code.");
            }

            setCode("");
            setCountdown(60);
            setSuccessMessage(
                "A new password reset code has been sent to your email."
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to resend your reset code. Please try again."
            );
        }
    };

    // Reset password
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!email) {
            setErrorMessage(
                "Email address is missing. Please request a new reset code."
            );
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            setErrorMessage("Please enter a valid six-digit reset code.");
            return;
        }

        if (!isPasswordValid) {
            setErrorMessage("Please meet all password requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Your passwords do not match.");
            return;
        }

        try {
            const { data } = await resetPassword({
                variables: {
                    email,
                    code,
                    newPassword: password,
                },
            });

            if (!data?.resetPassword) {
                throw new Error("Password reset failed. Please try again.");
            }

            setSuccessMessage(
                "Your password has been reset successfully. Redirecting to login..."
            );

            window.setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to reset your password. Please try again."
            );
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0b120e]">
            <main className="grid flex-1 lg:grid-cols-2">

                {/* Branding panel */}
                <section className="relative hidden overflow-hidden bg-linear-to-br from-green-950 via-green-900 to-green-800 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
                    <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/10" />
                    <div className="absolute -bottom-40 -left-32 h-120 w-120 rounded-full border border-lime-300/10" />
                    <div className="absolute right-20 top-1/2 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl" />

                    <Link to="/" className="relative z-10 text-3xl font-extrabold tracking-tight">
                        BUG<span className="text-lime-400">DESK</span>
                    </Link>

                    <div className="relative z-10 max-w-lg">
                        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-400/10">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-10 w-10 text-lime-300"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-3a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v5H6a2 2 0 00-2 2v3a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-lime-300">
                            Secure your account
                        </p>

                        <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                            Create a stronger password. Get back to work.
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-8 text-green-100/80">
                            Choose a secure password to protect your Bugdesk
                            account and keep your team's work safe.
                        </p>

                        <div className="mt-10 space-y-4 text-sm text-green-100/80">
                            <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
                                    ✓
                                </span>
                                Verify your email address
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
                                    ✓
                                </span>
                                Create a strong new password
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-green-100/50">
                        Bugdesk · Secure account recovery
                    </div>
                </section>

                {/* Form panel */}
                <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md">

                        <Link
                            to="/"
                            className="mb-10 block text-center text-3xl font-extrabold tracking-tight text-green-900 dark:text-lime-400 lg:hidden"
                        >
                            BUGDESK
                        </Link>

                        {!email ? (
                            <div>
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/40">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-7 w-7 text-green-800 dark:text-lime-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"
                                        />
                                    </svg>
                                </div>

                                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-green-800 dark:text-lime-400">
                                    Account recovery
                                </p>

                                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    Reset link incomplete
                                </h2>

                                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                    We could not find your email address.
                                    Please request a new password reset code
                                    before continuing.
                                </p>

                                <Link
                                    to="/forgot-password"
                                    className="mt-8 block w-full rounded-xl bg-green-800 px-4 py-3.5 text-center font-semibold text-white transition hover:bg-green-900 dark:bg-lime-500 dark:text-green-950 dark:hover:bg-lime-400"
                                >
                                    Request Reset Code
                                </Link>

                                <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
                                    <Link
                                        to="/login"
                                        className="text-sm font-semibold text-gray-600 hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                                    >
                                        ← Back to Login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-7">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/40">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            className="h-7 w-7 text-green-800 dark:text-lime-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-3a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v5H6a2 2 0 00-2 2v3a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>

                                    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-green-800 dark:text-lime-400">
                                        Account recovery
                                    </p>

                                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Create a new password
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                        Enter the six-digit code sent to your
                                        email, then choose a new password.
                                    </p>

                                    <p className="mt-2 break-all text-sm font-semibold text-green-800 dark:text-lime-400">
                                        {email}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Verification code */}
                                    <div>
                                        <label
                                            htmlFor="code"
                                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            Password reset code
                                        </label>

                                        <input
                                            id="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            value={code}
                                            onChange={(event) => {
                                                setCode(
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6)
                                                );
                                                setErrorMessage("");
                                                setSuccessMessage("");
                                            }}
                                            placeholder="000000"
                                            required
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-xl font-bold tracking-[0.6em] text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-gray-700 dark:bg-[#142019] dark:text-white"
                                        />

                                        <div className="mt-3 text-center">
                                            <button
                                                type="button"
                                                onClick={handleResendCode}
                                                disabled={countdown > 0 || resendLoading}
                                                className="text-sm font-semibold text-green-800 transition hover:text-green-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-lime-400 dark:hover:text-lime-300"
                                            >
                                                {resendLoading
                                                    ? "Sending code..."
                                                    : countdown > 0
                                                        ? `Resend code in ${countdown}s`
                                                        : "Didn't receive a code? Resend"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            New password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(event) => {
                                                    setPassword(event.target.value);
                                                    setErrorMessage("");
                                                    setSuccessMessage("");
                                                }}
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                                required
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-16 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-gray-700 dark:bg-[#142019] dark:text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-green-800 hover:text-green-950 dark:text-lime-400"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password requirements */}
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0b120e]">
                                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                            Password requirements
                                        </p>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {passwordChecks.map((check) => (
                                                <div
                                                    key={check.label}
                                                    className={`flex items-center gap-2 text-xs ${
                                                        check.valid
                                                            ? "text-green-700 dark:text-lime-400"
                                                            : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                                >
                                                    <span className="font-bold">
                                                        {check.valid ? "✓" : "○"}
                                                    </span>
                                                    <span>{check.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            Confirm new password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(event) => {
                                                    setConfirmPassword(event.target.value);
                                                    setErrorMessage("");
                                                    setSuccessMessage("");
                                                }}
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                                required
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-16 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-gray-700 dark:bg-[#142019] dark:text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-green-800 hover:text-green-950 dark:text-lime-400"
                                            >
                                                {showConfirmPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>

                                        {confirmPassword.length > 0 && (
                                            <p
                                                className={`mt-2 text-xs ${
                                                    password === confirmPassword
                                                        ? "text-green-700 dark:text-lime-400"
                                                        : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {password === confirmPassword
                                                    ? "Passwords match"
                                                    : "Passwords do not match"}
                                            </p>
                                        )}
                                    </div>

                                    {errorMessage && (
                                        <p
                                            role="alert"
                                            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                        >
                                            {errorMessage}
                                        </p>
                                    )}

                                    {successMessage && (
                                        <p
                                            role="status"
                                            className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        >
                                            {successMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            code.length !== 6 ||
                                            !isPasswordValid ||
                                            password !== confirmPassword
                                        }
                                        className="w-full rounded-xl bg-green-800 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-500 dark:text-green-950 dark:hover:bg-lime-400"
                                    >
                                        {loading ? "Resetting password..." : "Reset Password"}
                                    </button>
                                </form>

                                <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
                                    <Link
                                        to="/login"
                                        className="text-sm font-semibold text-gray-600 transition hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                                    >
                                        ← Back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <AuthFooter />
        </div>
    );
}
