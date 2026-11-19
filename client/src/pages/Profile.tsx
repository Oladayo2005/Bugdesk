
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Profile() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-[#827F76] dark:text-gray-400">
                    Unable to load profile information.
                </p>
            </div>
        );
    }

    const initials = user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    const formattedRole =
        user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const accountDetails = [
        {
            label: "Full Name",
            value: user.name,
            icon: "👤",
        },
        {
            label: "Email Address",
            value: user.email,
            icon: "✉️",
        },
        {
            label: "Account Role",
            value: formattedRole,
            icon: "🛡️",
        },
        {
            label: "Account Status",
            value: user.isActive ? "Active" : "Inactive",
            icon: "●",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-8">

            {/* PAGE HEADER */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#293B35] via-[#365342] to-[#71836F] p-6 text-white shadow-sm sm:p-9">

                <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />

                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C7D5C9]">
                            Account Overview
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            My Profile
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D5DFD6]">
                            View your personal information and account details
                            in your Bugdesk workspace.
                        </p>
                    </div>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
                        👤
                    </div>
                </div>
            </section>

            {/* PROFILE CARD */}
            <section className="overflow-hidden rounded-2xl border border-[#E7DED1] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

                <div className="h-2 bg-linear-to-r from-[#293B35] via-[#71836F] to-[#A7BBA8]" />

                <div className="p-6 sm:p-8">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        {/* AVATAR */}
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#E7DED1] bg-[#DCE8D8] text-3xl font-bold text-[#293B35] dark:border-gray-700 dark:bg-[#71836F]/20 dark:text-[#D5DFD6]">
                            {initials}

                            {user.avatar && (
                                <img
                                    src={user.avatar}
                                    alt={`${user.name}'s avatar`}
                                    className="absolute h-24 w-24 rounded-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            )}
                        </div>

                        {/* USER INFORMATION */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-[#293B35] dark:text-white">
                                    {user.name}
                                </h2>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        user.isActive
                                            ? "bg-[#DCE8D8] text-[#365342] dark:bg-emerald-500/15 dark:text-emerald-400"
                                            : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                                    }`}
                                >
                                    {user.isActive ? "Active Account" : "Inactive Account"}
                                </span>
                            </div>

                            <p className="mt-2 break-all text-sm text-[#827F76] dark:text-gray-400">
                                {user.email}
                            </p>

                            <p className="mt-2 text-sm font-medium text-[#71836F] dark:text-[#A7BBA8]">
                                {formattedRole}
                            </p>
                        </div>

                        {/* EDIT PROFILE */}
                        <Link
                            to="/settings"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#293B35] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#365342] dark:bg-[#71836F] dark:hover:bg-[#829781]"
                        >
                            <span>⚙️</span>
                            Account Settings
                        </Link>
                    </div>
                </div>
            </section>

            {/* ACCOUNT INFORMATION */}
            <section>
                <div className="mb-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#71836F] dark:text-[#A7BBA8]">
                        Personal information
                    </p>

                    <h2 className="text-xl font-bold text-[#293B35] dark:text-white">
                        Account Details
                    </h2>

                    <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                        Your registered account information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {accountDetails.map((detail) => (
                        <div
                            key={detail.label}
                            className="flex items-start gap-4 rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm transition hover:border-[#A7BBA8] dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D8] text-lg text-[#293B35] dark:bg-[#71836F]/20 dark:text-[#C7D5C9]">
                                {detail.icon}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#827F76] dark:text-gray-400">
                                    {detail.label}
                                </p>

                                <p className="mt-2 break-words text-sm font-bold text-[#293B35] dark:text-white">
                                    {detail.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ACCOUNT ID */}
            <section className="rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold text-[#293B35] dark:text-white">
                            Account ID
                        </p>

                        <p className="mt-1 text-xs text-[#827F76] dark:text-gray-400">
                            Your unique Bugdesk account identifier.
                        </p>
                    </div>

                    <p className="break-all rounded-lg bg-[#F5F2EC] px-4 py-2 font-mono text-xs text-[#365342] dark:bg-gray-700 dark:text-[#D5DFD6]">
                        {user.id}
                    </p>
                </div>
            </section>

            {/* SETTINGS NOTICE */}
            <section className="flex flex-col gap-4 rounded-2xl border border-[#DCE8D8] bg-[#F5F7F2] p-5 dark:border-[#71836F]/30 dark:bg-[#71836F]/10 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <h3 className="font-bold text-[#293B35] dark:text-white">
                        Need to update your information?
                    </h3>

                    <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                        Manage your profile, avatar, password, and account preferences.
                    </p>
                </div>

                <Link
                    to="/settings"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#71836F] px-5 py-3 text-sm font-semibold text-[#365342] transition hover:bg-[#DCE8D8] dark:border-[#71836F] dark:text-[#D5DFD6] dark:hover:bg-[#71836F]/20"
                >
                    Go to Settings
                    <span>→</span>
                </Link>
            </section>

        </div>
    );
}

export default Profile;
