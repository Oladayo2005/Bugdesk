
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_MY_ASSIGNED_BUGS_QUERY } from "../graphql/queries";
import { UPDATE_BUG_STATUS_MUTATION } from "../graphql/mutations";
import { useAuth } from "../context/useAuth";

interface User {
    id: string;
    name: string;
    email: string;
}

interface Bug {
    id: string;
    title: string;
    description: string;
    priority: string;
    severity: string;
    status: string;
    createdBy: User;
    assignedTo?: User | null;
}

interface MyAssignedBugsResponse {
    myAssignedBugs: Bug[];
}

interface UpdateBugStatusResponse {
    updateBugStatus: Bug;
}

interface UpdateBugStatusVariables {
    bugId: string;
    status: string;
}

function MyAssignedBugs() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    const { data, loading, error, refetch } =
        useQuery<MyAssignedBugsResponse>(GET_MY_ASSIGNED_BUGS_QUERY, {
            skip: user?.role?.toLowerCase() !== "developer",
            fetchPolicy: "cache-and-network",
        });

    const [updateBugStatus, { loading: updatingStatus }] = useMutation<
        UpdateBugStatusResponse,
        UpdateBugStatusVariables
    >(UPDATE_BUG_STATUS_MUTATION, {
        onCompleted: () => {
            setStatusUpdateError(null);
            refetch();
        },
        onError: (mutationError) => {
            setStatusUpdateError(mutationError.message);
        },
    });

    const handleStatusChange = async (bugId: string, status: string) => {
        setStatusUpdateError(null);

        try {
            await updateBugStatus({
                variables: { bugId, status },
            });
        } catch (mutationError) {
            console.error("Status update failed:", mutationError);
        }
    };

    if (user?.role?.toLowerCase() !== "developer") {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <h2 className="text-lg font-semibold">Access Denied</h2>
                <p className="mt-2">This page is only available to developers.</p>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                Loading your assigned bugs...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Failed to load assigned bugs: {error.message}
            </div>
        );
    }

    const bugs = data?.myAssignedBugs ?? [];

    const filteredBugs = bugs.filter((bug) => {
        const matchesSearch =
            bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bug.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || bug.status === statusFilter;

        const matchesPriority =
            priorityFilter === "all" || bug.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const openCount = bugs.filter((bug) => bug.status === "open").length;
    const inProgressCount = bugs.filter((bug) => bug.status === "in-progress").length;
    const resolvedCount = bugs.filter((bug) => bug.status === "resolved").length;

    const statusStyles: Record<string, string> = {
        open: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
        "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
        resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        closed: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };

    const priorityStyles: Record<string, string> = {
        critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        high: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
        medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
        low: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    };

    const statCards = [
        {
            label: "Total Assigned",
            value: bugs.length,
            emoji: "📋",
            color: "from-blue-500 to-indigo-500",
            background: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
            label: "In Progress",
            value: inProgressCount,
            emoji: "⚡",
            color: "from-amber-400 to-orange-500",
            background: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            label: "Resolved",
            value: resolvedCount,
            emoji: "🎉",
            color: "from-emerald-400 to-green-500",
            background: "bg-emerald-50 dark:bg-emerald-500/10",
        },
    ];

    return (
        <div className="space-y-7">
            {/* Page Heading */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Assigned Bugs 🐛
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your tasks, your progress. Let's squash some bugs!
                    </p>
                </div>

                <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    👨‍💻 Developer Workspace
                </div>
            </div>

            {/* Error Message */}
            {statusUpdateError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    Failed to update status: {statusUpdateError}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${stat.background}`}
                    >
                        <div className={`absolute left-0 top-0 h-1 w-full bg-linear-to-r ${stat.color}`} />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>

                            <span className="text-4xl transition duration-300 group-hover:scale-125">
                                {stat.emoji}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Open Bugs Summary */}
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
                <span className="text-2xl">🔎</span>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    You currently have <strong>{openCount}</strong> open bug
                    {openCount === 1 ? "" : "s"} waiting for attention.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
                    Find a Bug 🔍
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <input
                        type="text"
                        placeholder="Search bugs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>

            {/* Bug Cards Heading */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Your Bug Collection 🐛
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {filteredBugs.length} bug{filteredBugs.length === 1 ? "" : "s"} found
                    </p>
                </div>
            </div>

            {/* Bug Cards */}
            {filteredBugs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-5xl">🎯</div>
                    <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                        Nothing to squash!
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No assigned bugs match your current search or filters.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {filteredBugs.map((bug, index) => (
                        <div
                            key={bug.id}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500/60"
                        >
                            {/* Colourful top accent */}
                            <div className="h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="p-5">
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/15">
                                            {index % 3 === 0 ? "🐛" : index % 3 === 1 ? "🧩" : "🛠️"}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="wrap-break-word text-lg font-bold text-gray-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                {bug.title}
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                Bug ID: {bug.id.slice(-8)}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[bug.status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                                    >
                                        {bug.status.replace("-", " ")}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                    {bug.description}
                                </p>

                                {/* Priority and Severity */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${priorityStyles[bug.priority.toLowerCase()] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                                    >
                                        ⚑ {bug.priority} Priority
                                    </span>

                                    <span className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                                        ⚠ {bug.severity} Severity
                                    </span>
                                </div>

                                {/* Reporter */}
                                <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        👤
                                    </span>
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            Reported by
                                        </p>
                                        <p className="font-medium text-gray-700 dark:text-gray-200">
                                            {bug.createdBy?.name ?? "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/70">
                                    <label
                                        htmlFor={`status-${bug.id}`}
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                                    >
                                        ⚙️ Update Bug Status
                                    </label>

                                    <select
                                        id={`status-${bug.id}`}
                                        value={bug.status}
                                        onChange={(e) =>
                                            handleStatusChange(bug.id, e.target.value)
                                        }
                                        disabled={updatingStatus}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    {updatingStatus && (
                                        <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                                            Updating status...
                                        </p>
                                    )}
                                </div>

                                {/* Details Button */}
                                <button
                                    type="button"
                                    onClick={() => navigate(`/bugs/${bug.id}`)}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-[0.98]"
                                >
                                    View Bug Details
                                    <span className="transition-transform group-hover:translate-x-1">
                                        →
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyAssignedBugs;
