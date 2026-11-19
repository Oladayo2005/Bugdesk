
import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";

import { FORGOT_PASSWORD_MUTATION } from "../graphql/mutations";
import AuthFooter from "../components/AuthFooter";

interface ForgotPasswordResponse {
    forgotPassword: {
        email: string;
        message: string;
    };
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [forgotPassword, { loading }] =
        useMutation<ForgotPasswordResponse>(FORGOT_PASSWORD_MUTATION);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        try {
            const result = await forgotPassword({
                variables: { email: normalizedEmail },
            });

            if (!result.data?.forgotPassword) {
                throw new Error("Unable to process your request. Please try again.");
            }

            navigate(
                `/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
                { replace: true }
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
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
                            Account recovery
                        </p>

                        <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                            A fresh start is just a few steps away.
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-8 text-green-100/80">
                            Forgot your password? It happens. Verify your email
                            address and create a new password to get back to
                            managing your team's issues.
                        </p>

                        <div className="mt-10 flex items-center gap-3 text-sm text-green-100/70">
                            <span className="h-2 w-2 rounded-full bg-lime-400" />
                            Secure account recovery with email verification
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-green-100/50">
                        Bugdesk · Secure account recovery
                    </div>
                </section>

                {/* Form panel */}
                <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md">

                        {/* Mobile brand */}
                        <Link
                            to="/"
                            className="mb-12 block text-center text-3xl font-extrabold tracking-tight text-green-900 dark:text-lime-400 lg:hidden"
                        >
                            BUGDESK
                        </Link>

                        <div className="mb-8">
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
                                Password recovery
                            </p>

                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Forgot your password?
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                Enter the email address associated with your
                                Bugdesk account. We'll send you a six-digit
                                password reset code.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setErrorMessage("");
                                    }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-gray-700 dark:bg-[#142019] dark:text-white"
                                />
                            </div>

                            {errorMessage && (
                                <p
                                    role="alert"
                                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                >
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full rounded-xl bg-green-800 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-500 dark:text-green-950 dark:hover:bg-lime-400"
                            >
                                {loading ? "Sending reset code..." : "Send Reset Code"}
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
                    </div>
                </section>
            </main>

            <AuthFooter />
        </div>
    );
}
