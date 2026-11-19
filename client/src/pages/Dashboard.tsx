
import { useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import {
    GET_ME_QUERY,
    GET_BUGS_QUERY,
} from "../graphql/queries";

import CreateBugForm from "../components/CreateBugForm";
import RecentActivity from "../components/RecentActivity";

interface MeResponse {
    me: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        isActive: boolean;
    };
}

interface Bug {
    id: string;
    status: string;
}

interface BugsResponse {
    bugs: Bug[];
}

function Dashboard() {
    const { user } = useAuth();

    const createBugRef = useRef<HTMLElement>(null);

    const scrollToCreateBug = () => {
        createBugRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const {
        data,
        loading,
        error,
    } = useQuery<MeResponse>(GET_ME_QUERY);

    const {
        data: bugsData,
        loading: bugsLoading,
        error: bugsError,
    } = useQuery<BugsResponse>(GET_BUGS_QUERY);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7DED1] border-t-[#293B35] dark:border-gray-700 dark:border-t-[#A7BBA8]" />
                    <p className="text-sm font-medium text-[#827F76] dark:text-gray-400">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Failed to load dashboard: {error.message}
            </div>
        );
    }

    const currentUser = data?.me;
    const bugs = bugsData?.bugs ?? [];

    const stats = [
        {
            title: "Total Bugs",
            value: bugs.length,
            description: "All reported issues",
            icon: "🐛",
            iconBackground: "bg-[#E7DED1] dark:bg-[#827F76]/20",
            iconColor: "text-[#293B35] dark:text-[#D5DFD6]",
        },
        {
            title: "Open Bugs",
            value: bugs.filter((bug) => bug.status === "open").length,
            description: "Awaiting attention",
            icon: "📌",
            iconBackground: "bg-amber-100 dark:bg-amber-500/15",
            iconColor: "text-amber-700 dark:text-amber-400",
        },
        {
            title: "In Progress",
            value: bugs.filter((bug) => bug.status === "in-progress").length,
            description: "Currently being worked on",
            icon: "⚡",
            iconBackground: "bg-blue-100 dark:bg-blue-500/15",
            iconColor: "text-blue-700 dark:text-blue-400",
        },
        {
            title: "Resolved",
            value: bugs.filter((bug) => bug.status === "resolved").length,
            description: "Successfully resolved",
            icon: "✓",
            iconBackground: "bg-[#DCE8D8] dark:bg-emerald-500/15",
            iconColor: "text-[#365342] dark:text-emerald-400",
        },
    ];

    const displayName = currentUser?.name || user?.name || "there";

    return (
        <div className="mx-auto max-w-7xl space-y-8">

            {/* WELCOME SECTION */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#293B35] via-[#365342] to-[#71836F] p-6 text-white shadow-sm sm:p-9">

                <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />

                <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">

                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#C7D5C9]" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-[#E7DED1]">
                                Your Workspace
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                            Welcome back, {displayName}!
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#E0E8E0] sm:text-base">
                            Keep track of reported issues, follow your team's progress,
                            and stay on top of everything happening in Bugdesk.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/bugs"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#E7DED1] px-5 py-3 text-sm font-bold text-[#293B35] transition hover:-translate-y-0.5 hover:bg-white"
                            >
                                Explore Bug Reports
                                <span>→</span>
                            </Link>

                            <button
                                type="button"
                                onClick={scrollToCreateBug}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                <span>+</span>
                                Report a Bug
                            </button>
                        </div>
                    </div>

                    <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-5xl shadow-inner sm:flex lg:h-28 lg:w-28">
                        🐛
                    </div>
                </div>
            </section>

            {/* WORKSPACE OVERVIEW */}
            <section>
                <div className="mb-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#71836F] dark:text-[#A7BBA8]">
                        At a glance
                    </p>

                    <h2 className="text-xl font-bold text-[#293B35] dark:text-white sm:text-2xl">
                        Workspace Overview
                    </h2>

                    <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                        Here's what's happening with your team's issues.
                    </p>
                </div>

                {bugsError && (
                    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                        Unable to load bug statistics: {bugsError.message}
                    </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.title}
                            className="group relative overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-[#827F76] dark:text-gray-400">
                                        {stat.title}
                                    </p>

                                    <p className="mt-4 text-4xl font-bold tracking-tight text-[#293B35] dark:text-white">
                                        {bugsLoading ? "—" : stat.value}
                                    </p>
                                </div>

                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition duration-300 group-hover:scale-110 ${stat.iconBackground} ${stat.iconColor}`}>
                                    {stat.icon}
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <p className="text-xs text-[#827F76] dark:text-gray-400">
                                    {stat.description}
                                </p>

                                <span className="text-xs font-semibold text-[#A7BBA8] dark:text-[#71836F]">
                                    0{index + 1}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section>
                <div className="mb-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#71836F] dark:text-[#A7BBA8]">
                        Get things done
                    </p>

                    <h2 className="text-xl font-bold text-[#293B35] dark:text-white">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                        Shortcuts to the things you use most.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* REPORT BUG */}
                    <button
                        type="button"
                        onClick={scrollToCreateBug}
                        className="group flex items-center gap-4 rounded-2xl border border-[#E7DED1] bg-white p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#71836F] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#71836F]"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D8] text-2xl text-[#293B35] transition group-hover:scale-110 dark:bg-[#71836F]/20 dark:text-[#C7D5C9]">
                            +
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#293B35] dark:text-white">
                                Report a Bug
                            </p>
                            <p className="mt-1 text-xs text-[#827F76] dark:text-gray-400">
                                Create a new issue
                            </p>
                        </div>

                        <span className="text-[#A7BBA8] transition group-hover:translate-y-1">
                            ↓
                        </span>
                    </button>

                    {/* BROWSE BUGS */}
                    <Link
                        to="/bugs"
                        className="group flex items-center gap-4 rounded-2xl border border-[#E7DED1] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#71836F] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#71836F]"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7DED1] text-2xl text-[#293B35] transition group-hover:scale-110 dark:bg-[#827F76]/20 dark:text-[#D5DFD6]">
                            📋
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#293B35] dark:text-white">
                                Browse Bugs
                            </p>
                            <p className="mt-1 text-xs text-[#827F76] dark:text-gray-400">
                                View reported issues
                            </p>
                        </div>

                        <span className="text-[#A7BBA8] transition group-hover:translate-x-1">
                            →
                        </span>
                    </Link>

                    {/* PROFILE */}
                    <Link
                        to="/profile"
                        className="group flex items-center gap-4 rounded-2xl border border-[#E7DED1] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#71836F] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#71836F]"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D8] text-2xl text-[#293B35] transition group-hover:scale-110 dark:bg-[#71836F]/20 dark:text-[#C7D5C9]">
                            👤
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#293B35] dark:text-white">
                                My Profile
                            </p>
                            <p className="mt-1 text-xs text-[#827F76] dark:text-gray-400">
                                View your account
                            </p>
                        </div>

                        <span className="text-[#A7BBA8] transition group-hover:translate-x-1">
                            →
                        </span>
                    </Link>
                </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-7">
                <div className="mb-6">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#71836F] dark:text-[#A7BBA8]">
                        What's happening
                    </p>

                    <h2 className="text-lg font-bold text-[#293B35] dark:text-white sm:text-xl">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                        Stay updated with the latest changes in your workspace.
                    </p>
                </div>

                <RecentActivity />
            </section>

            {/* CREATE BUG FORM */}
            <section
                ref={createBugRef}
                id="create-bug"
                className="scroll-mt-24 rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-7"
            >
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D8] text-2xl text-[#293B35] dark:bg-[#71836F]/20 dark:text-[#C7D5C9]">
                        📝
                    </div>

                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#71836F] dark:text-[#A7BBA8]">
                            Create an issue
                        </p>

                        <h2 className="text-lg font-bold text-[#293B35] dark:text-white">
                            Report a New Bug
                        </h2>

                        <p className="mt-1 text-sm text-[#827F76] dark:text-gray-400">
                            Give your team the details they need to fix an issue.
                        </p>
                    </div>
                </div>

                <CreateBugForm />
            </section>

        </div>
    );
}

export default Dashboard;
