
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";

import { LOGIN_MUTATION } from "../graphql/mutations";
import AuthFooter from "../components/AuthFooter";

interface LoginResponse {
    login: {
        email: string;
        message: string;
        purpose: string;
    };
}

interface LoginVariables {
    email: string;
    password: string;
}

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loginUser, { loading, error }] = useMutation<
        LoginResponse,
        LoginVariables
    >(LOGIN_MUTATION, {
        onCompleted: (data) => {
            navigate(
                `/verify-email?email=${encodeURIComponent(data.login.email)}&purpose=${encodeURIComponent(data.login.purpose)}`
            );
        },
    });

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            await loginUser({
                variables: {
                    email: email.trim().toLowerCase(),
                    password,
                },
            });
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f4f7f3] dark:bg-gray-950">

            {/* AUTH PAGE CONTENT */}
            <div className="grid flex-1 min-[900px]:grid-cols-2">

                {/* LEFT SIDE */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#142d22] via-[#1d422f] to-[#28583b] p-12 text-white min-[900px]:flex xl:p-16">

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-400/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

                    {/* BRAND */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-2xl text-green-950 shadow-lg">
                                🐞
                            </div>

                            <span className="text-2xl font-black tracking-wide">
                                BUGDESK<span className="text-lime-300">.</span>
                            </span>
                        </div>

                        <div className="mt-20 max-w-lg">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-lime-200">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />
                                YOUR TEAM'S BUG HQ
                            </span>

                            <h1 className="mt-7 text-5xl font-black leading-tight xl:text-6xl">
                                Find bugs.
                                <br />
                                <span className="text-lime-300">Fix things.</span>
                                <br />
                                Ship better.
                            </h1>

                            <p className="mt-6 max-w-md text-lg leading-relaxed text-green-100/80">
                                Great software starts with finding the little
                                things that go wrong. Bring your team together
                                and squash those bugs!
                            </p>
                        </div>
                    </div>

                    {/* FLOATING DASHBOARD PREVIEW */}
                    <div className="relative z-10 mt-12 max-w-lg">
                        <div className="-rotate-2 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">

                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-green-100/60">
                                        YOUR WORKSPACE
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold">
                                        Bug Overview
                                    </h3>
                                </div>

                                <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-bold text-green-950">
                                    Live preview
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-white/10 p-4">
                                    <span className="text-2xl">🐛</span>
                                    <p className="mt-3 text-2xl font-black">24</p>
                                    <p className="text-xs text-green-100/70">
                                        Total bugs
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                    <span className="text-2xl">⚡</span>
                                    <p className="mt-3 text-2xl font-black">08</p>
                                    <p className="text-xs text-green-100/70">
                                        In progress
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                    <span className="text-2xl">✨</span>
                                    <p className="mt-3 text-2xl font-black">16</p>
                                    <p className="text-xs text-green-100/70">
                                        Resolved
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-300">
                                        🐞
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Login button issue
                                        </p>
                                        <p className="text-xs text-green-100/60">
                                            Being investigated
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-orange-300/20 px-3 py-1 text-xs text-orange-100">
                                    High
                                </span>
                            </div>
                        </div>

                        <div className="absolute -right-5 -top-7 flex h-14 w-14 rotate-12 items-center justify-center rounded-2xl bg-lime-300 text-3xl shadow-xl">
                            🎯
                        </div>
                    </div>

                    <p className="relative z-10 mt-10 text-xs text-green-100/50">
                        Bugdesk · Track issues. Build better software.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center justify-center p-5 sm:p-10 min-[900px]:p-12">

                    <div className="w-full max-w-md">

                        {/* MOBILE BRAND */}
                        <div className="mb-8 text-center min-[900px]:hidden">
                            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-green-600 to-lime-500 text-3xl shadow-lg">
                                🐞
                            </div>

                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                BUGDESK<span className="text-green-600">.</span>
                            </h1>
                        </div>

                        {/* WELCOME */}
                        <div className="mb-8">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <span>👋</span>
                                GOOD TO SEE YOU AGAIN
                            </div>

                            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Welcome back!
                            </h2>

                            <p className="mt-3 leading-relaxed text-gray-500 dark:text-gray-400">
                                Ready to squash some bugs? Sign in to get back
                                to work.
                            </p>
                        </div>

                        {/* FORM CARD */}
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 sm:p-8">

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* EMAIL */}
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Email Address
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                            ✉️
                                        </span>

                                        <input
                                            id="login-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            required
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                            🔒
                                        </span>

                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-20 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                {/* FORGOT PASSWORD */}
                                <div className="flex justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-semibold text-green-700 transition hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* ERROR */}
                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {error.message}
                                        </p>
                                    </div>
                                )}

                                {/* SUBMIT */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-green-700 to-emerald-600 p-4 font-bold text-white shadow-lg shadow-green-900/20 transition-all hover:-translate-y-0.5 hover:from-green-800 hover:to-emerald-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? "Checking credentials..." : "Let's get started"}

                                    {!loading && (
                                        <span className="transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    )}
                                </button>

                            </form>

                            <div className="my-7 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                <span className="text-xs font-semibold text-gray-400">
                                    NEW AROUND HERE?
                                </span>
                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                            </div>

                            <Link
                                to="/register"
                                className="block w-full rounded-2xl border-2 border-green-700 p-3.5 text-center font-bold text-green-800 transition hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20"
                            >
                                Create your free account
                            </Link>

                        </div>

                        <p className="mt-7 text-center text-xs text-gray-400 dark:text-gray-600">
                            Made for teams that love building great software. 💚
                        </p>

                    </div>
                </div>
            </div>

            {/* REUSABLE AUTH FOOTER */}
            <AuthFooter />
        </div>
    );
}

export default Login;
