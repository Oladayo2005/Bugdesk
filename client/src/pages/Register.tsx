
import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";

import { REGISTER_MUTATION } from "../graphql/mutations";
import AuthFooter from "../components/AuthFooter";

interface RegisterResponse {
    register: {
        email: string;
        message: string;
        purpose: string;
    };
}

interface RegisterVariables {
    name: string;
    email: string;
    password: string;
    role: "tester" | "developer";
}

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"tester" | "developer">("tester");
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordStrong = passwordRegex.test(password);

    const passwordRequirements = [
        {
            label: "At least 8 characters",
            valid: password.length >= 8,
        },
        {
            label: "One uppercase letter (A-Z)",
            valid: /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter (a-z)",
            valid: /[a-z]/.test(password),
        },
        {
            label: "One number (0-9)",
            valid: /\d/.test(password),
        },
        {
            label: "One special character (@$!%*?&)",
            valid: /[@$!%*?&]/.test(password),
        },
    ];

    const [register, { loading, error }] = useMutation<
        RegisterResponse,
        RegisterVariables
    >(REGISTER_MUTATION, {
        onCompleted: (data) => {
            navigate(
                `/verify-email?email=${encodeURIComponent(data.register.email)}&purpose=${encodeURIComponent(data.register.purpose)}`
            );
        },
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isPasswordStrong) {
            return;
        }

        try {
            await register({
                variables: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    role,
                },
            });
        } catch (err) {
            console.error("Registration failed:", err);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f4f7f2] dark:bg-gray-950">
            <div className="flex-1 min-[900px]:grid min-[900px]:grid-cols-2">

                {/* LEFT SIDE */}
                <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-linear-to-br from-[#102e22] via-[#164b35] to-[#23764b] p-12 text-white min-[900px]:flex">

                    <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border-50 border-white/5" />
                    <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-2xl shadow-lg shadow-black/20">
                                🐞
                            </div>

                            <span className="text-2xl font-black tracking-wide">
                                BUGDESK
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 my-12 max-w-xl">
                        <span className="mb-6 inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-medium text-lime-200">
                            ✨ Your team's new favourite workspace
                        </span>

                        <h1 className="mb-6 text-5xl font-black leading-tight xl:text-6xl">
                            Great teams
                            <br />
                            catch bugs.
                            <br />
                            <span className="text-lime-300">Better teams</span>
                            <br />
                            fix them.
                        </h1>

                        <p className="max-w-md text-lg leading-8 text-green-100/80">
                            Join your team, report issues, collaborate with
                            developers, and keep every project moving forward.
                        </p>

                        {/* WORKSPACE PREVIEW */}
                        <div className="mt-12 max-w-md -rotate-2 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-100/70">
                                        Your workspace
                                    </p>

                                    <h3 className="text-xl font-bold">
                                        Let's get things fixed!
                                    </h3>
                                </div>

                                <span className="rounded-xl bg-lime-300/20 p-3 text-2xl">
                                    🚀
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-sm text-green-100/70">
                                        Report issues
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">🐛</p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-sm text-green-100/70">
                                        Fix together
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">🛠️</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl bg-lime-300 p-4 text-[#173c2b]">
                                <p className="text-sm font-semibold">
                                    Small bugs. Big progress.
                                </p>

                                <p className="mt-1 text-xs opacity-80">
                                    Your next great project starts here.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="relative z-10 text-sm text-green-100/60">
                        Bugdesk · Built for better teamwork.
                    </p>
                </section>

                {/* RIGHT SIDE */}
                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 min-[900px]:px-12">
                    <div className="w-full max-w-lg">

                        {/* MOBILE BRAND */}
                        <div className="mb-8 flex items-center justify-center gap-2 min-[900px]:hidden">
                            <span className="text-3xl">🐞</span>

                            <span className="text-2xl font-black tracking-wide text-[#164b35] dark:text-lime-400">
                                BUGDESK
                            </span>
                        </div>

                        {/* HEADING */}
                        <div className="mb-8">
                            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                🌱 Let's get you started
                            </span>

                            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Create your account
                            </h2>

                            <p className="mt-3 text-gray-500 dark:text-gray-400">
                                Join Bugdesk and make teamwork a little easier.
                            </p>
                        </div>

                        {/* REGISTRATION FORM */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* FULL NAME */}
                            <div>
                                <label
                                    htmlFor="register-name"
                                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Full Name
                                </label>

                                <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="mr-3 text-lg">👤</span>

                                    <input
                                        id="register-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        autoComplete="name"
                                        className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="register-email"
                                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Email Address
                                </label>

                                <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="mr-3 text-lg">✉️</span>

                                    <input
                                        id="register-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* ROLE SELECTION */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    I want to join Bugdesk as a...
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* TESTER */}
                                    <button
                                        type="button"
                                        onClick={() => setRole("tester")}
                                        aria-pressed={role === "tester"}
                                        className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                                            role === "tester"
                                                ? "border-green-600 bg-green-50 shadow-md shadow-green-900/10 dark:border-lime-400 dark:bg-green-950/40"
                                                : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-green-700"
                                        }`}
                                    >
                                        {role === "tester" && (
                                            <span className="absolute right-3 top-3 text-green-600 dark:text-lime-400">
                                                ✓
                                            </span>
                                        )}

                                        <span className="mb-3 block text-3xl">🔍</span>

                                        <span className="block font-bold text-gray-900 dark:text-white">
                                            Tester
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                                            Find bugs and report issues.
                                        </span>
                                    </button>

                                    {/* DEVELOPER */}
                                    <button
                                        type="button"
                                        onClick={() => setRole("developer")}
                                        aria-pressed={role === "developer"}
                                        className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                                            role === "developer"
                                                ? "border-green-600 bg-green-50 shadow-md shadow-green-900/10 dark:border-lime-400 dark:bg-green-950/40"
                                                : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-green-700"
                                        }`}
                                    >
                                        {role === "developer" && (
                                            <span className="absolute right-3 top-3 text-green-600 dark:text-lime-400">
                                                ✓
                                            </span>
                                        )}

                                        <span className="mb-3 block text-3xl">💻</span>

                                        <span className="block font-bold text-gray-900 dark:text-white">
                                            Developer
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                                            Receive bugs and fix issues.
                                        </span>
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    You can select one role for your account.
                                </p>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="register-password"
                                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>

                                <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="mr-3 text-lg">🔒</span>

                                    <input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        autoComplete="new-password"
                                        aria-describedby="password-requirements"
                                        className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="ml-2 text-sm font-semibold text-green-700 hover:text-green-900 dark:text-lime-400"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {/* PASSWORD REQUIREMENTS */}
                                <div
                                    id="password-requirements"
                                    className="mt-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900"
                                >
                                    <p className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Your password must contain:
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {passwordRequirements.map((item) => (
                                            <div
                                                key={item.label}
                                                className={`flex items-center gap-2 text-xs ${
                                                    item.valid
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-gray-400 dark:text-gray-500"
                                                }`}
                                            >
                                                <span className="font-bold">
                                                    {item.valid ? "✓" : "○"}
                                                </span>

                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    {password.length > 0 && (
                                        <p
                                            className={`mt-3 text-xs font-semibold ${
                                                isPasswordStrong
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-orange-500"
                                            }`}
                                        >
                                            {isPasswordStrong
                                                ? "✓ Your password is strong!"
                                                : "Keep going — your password needs more strength."}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                    {error.message}
                                </div>
                            )}

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading || !isPasswordStrong}
                                className="w-full rounded-2xl bg-linear-to-r from-[#164b35] to-[#23804e] py-4 font-bold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading
                                    ? "Creating your account..."
                                    : "Create My Account →"}
                            </button>
                        </form>

                        {/* LOGIN LINK */}
                        <p className="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-bold text-green-700 hover:underline dark:text-lime-400"
                            >
                                Login
                            </Link>
                        </p>

                        <p className="mt-8 text-center text-xs text-gray-400">
                            By joining Bugdesk, you're ready to build better
                            software together.
                        </p>
                    </div>
                </section>
            </div>

            <AuthFooter />
        </div>
    );
}

export default Register;
