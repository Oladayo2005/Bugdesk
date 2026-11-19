
import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";

import { GET_RECENT_ACTIVITIES_QUERY } from "../graphql/queries";

interface ActivityUser {
    id: string;
    name: string;
    email: string;
}

interface ActivityBug {
    id: string;
    title: string;
}

interface Activity {
    id: string;
    action: string;
    description: string;
    metadata?: string | null;
    createdAt: string | number;
    performedBy: ActivityUser;
    bug?: ActivityBug | null;
}

interface RecentActivitiesResponse {
    recentActivities: Activity[];
}

interface RecentActivitiesVariables {
    limit: number;
}

interface RecentActivityProps {
    limit?: number;
    title?: string;
    description?: string;
}

const formatDate = (
    date: string | number | null | undefined
): string => {
    if (date === null || date === undefined || date === "") {
        return "Date unavailable";
    }

    let parsedDate: Date;

    if (typeof date === "number") {
        parsedDate = new Date(date < 1e12 ? date * 1000 : date);
    } else {
        const trimmedDate = date.trim();

        if (!trimmedDate) return "Date unavailable";

        const numericDate = Number(trimmedDate);

        parsedDate = Number.isFinite(numericDate)
            ? new Date(numericDate < 1e12 ? numericDate * 1000 : numericDate)
            : new Date(trimmedDate);
    }

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getActionStyle = (action: string) => {
    const normalizedAction = action.toLowerCase();

    if (normalizedAction.includes("create")) {
        return {
            icon: "＋",
            label: "Created",
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
            accent: "bg-emerald-500",
        };
    }

    if (normalizedAction.includes("assign")) {
        return {
            icon: "👤",
            label: "Assigned",
            color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
            accent: "bg-blue-500",
        };
    }

    if (normalizedAction.includes("status")) {
        return {
            icon: "🔄",
            label: "Status Update",
            color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
            accent: "bg-purple-500",
        };
    }

    if (normalizedAction.includes("update")) {
        return {
            icon: "✏️",
            label: "Updated",
            color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
            accent: "bg-amber-500",
        };
    }

    if (normalizedAction.includes("delete")) {
        return {
            icon: "🗑️",
            label: "Deleted",
            color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
            accent: "bg-red-500",
        };
    }

    if (normalizedAction.includes("comment")) {
        return {
            icon: "💬",
            label: "Comment",
            color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
            accent: "bg-indigo-500",
        };
    }

    return {
        icon: "📌",
        label: "Activity",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        accent: "bg-gray-400",
    };
};

function RecentActivity({
    limit = 8,
    title = "Recent Activity",
    description = "Stay updated with the latest activity in your workspace.",
}: RecentActivityProps) {
    const { data, loading, error } = useQuery<
        RecentActivitiesResponse,
        RecentActivitiesVariables
    >(GET_RECENT_ACTIVITIES_QUERY, {
        variables: { limit },
        fetchPolicy: "cache-and-network",
    });

    const activities = data?.recentActivities ?? [];

    return (
        <section className="overflow-hidden rounded-2xl border border-[#E6DACA] bg-[#FBF8F3] shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-900">

            {/* Decorative accent */}
            <div className="h-1.5 bg-linear-to-r from-[#293B35] via-[#71836F] to-[#D6A75C]" />

            <div className="p-5 sm:p-6">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9E2D5] text-xl dark:bg-gray-800">
                            ⚡
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#293B35] dark:text-white">
                                {title}
                            </h2>

                            <p className="mt-1 text-sm text-[#887967] dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>

                    {activities.length > 0 && (
                        <span className="rounded-full bg-[#E4EDE3] px-3 py-1.5 text-xs font-bold text-[#42634A] dark:bg-green-950/50 dark:text-green-300">
                            {activities.length} {activities.length === 1 ? "Activity" : "Activities"}
                        </span>
                    )}
                </div>

                {/* Loading */}
                {loading && !data && (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[#71836F] border-t-transparent" />

                        <p className="text-sm text-[#887967] dark:text-gray-400">
                            Loading activities...
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && !data && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            Unable to load activities
                        </p>

                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && activities.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#DCCFBE] bg-white/60 px-4 py-12 text-center dark:border-gray-700 dark:bg-gray-800/40">
                        <div className="mb-3 text-4xl">📭</div>

                        <p className="font-bold text-[#44382F] dark:text-white">
                            No activity yet
                        </p>

                        <p className="mt-1 text-sm text-[#887967] dark:text-gray-400">
                            Your team's bug updates and comments will appear here.
                        </p>
                    </div>
                )}

                {/* Activity timeline */}
                {activities.length > 0 && (
                    <div className="space-y-3">
                        {activities.map((activity) => {
                            const actionStyle = getActionStyle(activity.action);

                            return (
                                <article
                                    key={activity.id}
                                    className="group relative overflow-hidden rounded-xl border border-[#E6DACA] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B9C8B5] hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-gray-600"
                                >
                                    <div className={`absolute inset-y-0 left-0 w-1 ${actionStyle.accent}`} />

                                    <div className="flex gap-3 p-4 pl-5 sm:gap-4 sm:p-5 sm:pl-6">
                                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${actionStyle.color}`}>
                                            {actionStyle.icon}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${actionStyle.color}`}>
                                                    {actionStyle.label}
                                                </span>

                                                <span className="text-xs text-[#968575] dark:text-gray-500">
                                                    {formatDate(activity.createdAt)}
                                                </span>
                                            </div>

                                            <p className="wrap-break-word text-sm font-semibold leading-relaxed text-[#44382F] dark:text-gray-100">
                                                {activity.description}
                                            </p>

                                            <div className="mt-2 flex items-center gap-2 text-xs text-[#887967] dark:text-gray-400">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9E2D5] font-bold text-[#53665A] dark:bg-gray-700 dark:text-gray-200">
                                                    {(activity.performedBy?.name || "U").charAt(0).toUpperCase()}
                                                </span>

                                                <span className="font-medium">
                                                    {activity.performedBy?.name || "Unknown user"}
                                                </span>
                                            </div>

                                            {activity.bug && (
                                                <Link
                                                    to={`/bugs/${activity.bug.id}`}
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#536F59] transition-colors hover:text-[#293B35] dark:text-green-400 dark:hover:text-green-300"
                                                >
                                                    <span className="truncate">
                                                        {activity.bug.title}
                                                    </span>
                                                    <span aria-hidden="true">→</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default RecentActivity;
