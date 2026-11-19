
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";

import {
    GET_BUGS_QUERY,
    GET_DEVELOPERS_QUERY,
} from "../graphql/queries";

import {
    UPDATE_BUG_MUTATION,
    UPDATE_BUG_STATUS_MUTATION,
    ASSIGN_BUG_MUTATION,
    DELETE_BUG_MUTATION,
} from "../graphql/mutations";

import { useAuth } from "../context/useAuth";
import CommentSection from "./CommentSection";

interface Developer {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    isActive: boolean;
}

interface Bug {
    id: string;
    title: string;
    description: string;
    priority: string;
    severity: string;
    status: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    assignedTo: {
        id: string;
        name: string;
        email: string;
    } | null;
}

interface BugsResponse {
    bugs: Bug[];
}

interface DevelopersResponse {
    developers: Developer[];
}

interface UpdateBugResponse {
    updateBug: Bug;
}

interface UpdateBugVariables {
    bugId: string;
    input: {
        title: string;
        description: string;
        priority: string;
        severity: string;
    };
}

interface UpdateBugStatusResponse {
    updateBugStatus: Bug;
}

interface UpdateBugStatusVariables {
    bugId: string;
    status: string;
}

interface AssignBugResponse {
    assignBug: Bug;
}

interface AssignBugVariables {
    bugId: string;
    developerId: string;
}

interface DeleteBugResponse {
    deleteBug: boolean;
}

interface DeleteBugVariables {
    bugId: string;
}

function getPriorityStyle(priority: string) {
    switch (priority.toLowerCase()) {
        case "critical":
            return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300";
        case "high":
            return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300";
        case "medium":
            return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
        case "low":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
        case "open":
            return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
        case "in-progress":
            return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
        case "resolved":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
        case "closed":
            return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

function getSeverityStyle(severity: string) {
    switch (severity.toLowerCase()) {
        case "blocker":
        case "critical":
            return "text-red-600 dark:text-red-400";
        case "major":
            return "text-orange-600 dark:text-orange-400";
        case "minor":
            return "text-emerald-600 dark:text-emerald-400";
        default:
            return "text-gray-600 dark:text-gray-400";
    }
}

function getPriorityAccent(priority: string) {
    switch (priority.toLowerCase()) {
        case "critical":
            return "from-red-500 to-rose-400";
        case "high":
            return "from-orange-500 to-amber-400";
        case "medium":
            return "from-amber-500 to-yellow-300";
        case "low":
            return "from-emerald-500 to-green-300";
        default:
            return "from-gray-400 to-gray-300";
    }
}

const inputClass =
    "w-full rounded-xl border border-[#DCCFBE] bg-white p-3 text-sm text-[#44382F] outline-none transition placeholder:text-gray-400 focus:border-[#71836F] focus:ring-2 focus:ring-[#71836F]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";

const labelClass =
    "mb-2 block text-sm font-semibold text-[#66594D] dark:text-gray-300";

const sectionDivider =
    "mt-5 border-t border-[#E6DACA] pt-5 dark:border-gray-700";

function BugList() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const userRole = user?.role?.toLowerCase().trim();
    const currentUserId = String(user?.id ?? "");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const bugsPerPage = 10;

    const [editingBugId, setEditingBugId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("medium");
    const [editSeverity, setEditSeverity] = useState("minor");

    const {
        data,
        loading,
        error,
    } = useQuery<BugsResponse>(GET_BUGS_QUERY);

    const {
        data: developersData,
        loading: developersLoading,
        error: developersError,
    } = useQuery<DevelopersResponse>(GET_DEVELOPERS_QUERY, {
        skip: userRole !== "admin",
    });

    const [
        updateBug,
        {
            loading: savingBug,
            error: updateBugError,
        },
    ] = useMutation<UpdateBugResponse, UpdateBugVariables>(
        UPDATE_BUG_MUTATION,
        {
            refetchQueries: [{ query: GET_BUGS_QUERY }],
            awaitRefetchQueries: true,
        }
    );

    const [
        updateBugStatus,
        {
            loading: updatingStatus,
            error: updateStatusError,
        },
    ] = useMutation<UpdateBugStatusResponse, UpdateBugStatusVariables>(
        UPDATE_BUG_STATUS_MUTATION,
        {
            refetchQueries: [{ query: GET_BUGS_QUERY }],
            awaitRefetchQueries: true,
        }
    );

    const [
        assignBug,
        {
            loading: assigningBug,
            error: assignBugError,
        },
    ] = useMutation<AssignBugResponse, AssignBugVariables>(
        ASSIGN_BUG_MUTATION,
        {
            refetchQueries: [{ query: GET_BUGS_QUERY }],
            awaitRefetchQueries: true,
        }
    );

    const [
        deleteBug,
        {
            loading: deletingBug,
            error: deleteBugError,
        },
    ] = useMutation<DeleteBugResponse, DeleteBugVariables>(
        DELETE_BUG_MUTATION,
        {
            refetchQueries: [{ query: GET_BUGS_QUERY }],
            awaitRefetchQueries: true,
        }
    );

    const handleEditClick = (bug: Bug) => {
        setEditingBugId(bug.id);
        setEditTitle(bug.title);
        setEditDescription(bug.description);
        setEditPriority(bug.priority);
        setEditSeverity(bug.severity);
    };

    const handleCancelEdit = () => {
        setEditingBugId(null);
        setEditTitle("");
        setEditDescription("");
        setEditPriority("medium");
        setEditSeverity("minor");
    };

    const handleUpdateBug = async (bugId: string) => {
        if (!editTitle.trim() || !editDescription.trim()) {
            alert("Bug title and description are required.");
            return;
        }

        try {
            await updateBug({
                variables: {
                    bugId,
                    input: {
                        title: editTitle.trim(),
                        description: editDescription.trim(),
                        priority: editPriority,
                        severity: editSeverity,
                    },
                },
            });

            handleCancelEdit();
        } catch (err) {
            console.error("Bug update failed:", err);
        }
    };

    const handleStatusChange = async (
        bugId: string,
        status: string
    ) => {
        try {
            await updateBugStatus({
                variables: {
                    bugId,
                    status,
                },
            });
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    const handleAssignBug = async (
        bugId: string,
        developerId: string
    ) => {
        if (!developerId) return;

        try {
            await assignBug({
                variables: {
                    bugId,
                    developerId,
                },
            });
        } catch (err) {
            console.error("Bug assignment failed:", err);
        }
    };

    const handleDeleteBug = async (
        bugId: string,
        bugTitle: string
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${bugTitle}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteBug({
                variables: {
                    bugId,
                },
            });
        } catch (err) {
            console.error("Bug deletion failed:", err);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-[#E6DACA] bg-[#FBF8F3] p-10 dark:border-gray-700 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[#71836F] border-t-transparent" />
                    <p className="font-medium text-[#66594D] dark:text-gray-300">
                        Loading bug reports...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                {error.message}
            </div>
        );
    }

    // Empty state
    if (!data || data.bugs.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#DCCFBE] bg-[#FBF8F3] p-10 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-3 text-4xl">🐛</div>
                <h3 className="font-bold text-[#44382F] dark:text-white">
                    No bugs reported yet
                </h3>
                <p className="mt-2 text-sm text-[#887967] dark:text-gray-400">
                    When your team reports issues, they'll appear here.
                </p>
            </div>
        );
    }

    // Filter bugs
    const filteredBugs = data.bugs.filter((bug) => {
        const matchesSearch = bug.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim());

        const matchesStatus =
            statusFilter === "all" || bug.status === statusFilter;

        const matchesPriority =
            priorityFilter === "all" || bug.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBugs.length / bugsPerPage);

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const indexOfLastBug = safeCurrentPage * bugsPerPage;
    const indexOfFirstBug = indexOfLastBug - bugsPerPage;

    const currentBugs = filteredBugs.slice(
        indexOfFirstBug,
        indexOfLastBug
    );

    const mutationErrors = [
        updateBugError,
        updateStatusError,
        assignBugError,
        developersError,
        deleteBugError,
    ].filter(Boolean);

    return (
        <div className="space-y-6">

            {/* Mutation errors */}
            {mutationErrors.map((mutationError, index) => (
                <p
                    key={index}
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                >
                    {mutationError?.message}
                </p>
            ))}

            {/* Search and filters */}
            <section className="overflow-hidden rounded-2xl border border-[#E6DACA] bg-[#FBF8F3] shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="h-1.5 bg-linear-to-r from-[#293B35] via-[#71836F] to-[#D6A75C]" />

                <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9E2D5] text-xl dark:bg-gray-800">
                            🔎
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-[#293B35] dark:text-white">
                                Search and Filter Bugs
                            </h2>

                            <p className="mt-1 text-sm text-[#887967] dark:text-gray-400">
                                Find the issue you're looking for.
                            </p>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Search bugs by title..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={inputClass}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>
                                Filter by Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={inputClass}
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Filter by Priority
                            </label>

                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={inputClass}
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6DACA] pt-4 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setPriorityFilter("all");
                                setCurrentPage(1);
                            }}
                            className="rounded-xl bg-[#E9E2D5] px-4 py-2 text-sm font-semibold text-[#5C5143] transition hover:bg-[#D8C5AD] dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Clear Filters
                        </button>

                        <p className="text-sm text-[#887967] dark:text-gray-400">
                            Showing{" "}
                            {filteredBugs.length === 0 ? 0 : indexOfFirstBug + 1}
                            {"–"}
                            {Math.min(indexOfLastBug, filteredBugs.length)}
                            {" "}of {filteredBugs.length} matching reports
                            {" "}({data.bugs.length} total)
                        </p>
                    </div>
                </div>
            </section>

            {/* No filter results */}
            {filteredBugs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#DCCFBE] bg-[#FBF8F3] p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                    <div className="mb-3 text-3xl">🔍</div>

                    <p className="font-semibold text-[#44382F] dark:text-white">
                        No matching bugs found
                    </p>

                    <p className="mt-1 text-sm text-[#887967] dark:text-gray-400">
                        Try changing your search or filters.
                    </p>
                </div>
            )}

            {/* Bug cards */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {currentBugs.map((bug) => {
                    const assignedDeveloperId = String(
                        bug.assignedTo?.id ?? ""
                    );

                    // Preserve existing role-based permissions
                    const canUpdateStatus =
                        userRole === "admin" ||
                        (
                            userRole === "developer" &&
                            currentUserId !== "" &&
                            assignedDeveloperId === currentUserId
                        );

                    const canEditBug =
                        userRole === "admin" ||
                        bug.createdBy?.id === currentUserId;

                    const isEditing = editingBugId === bug.id;

                    return (
                        <article
                            key={bug.id}
                            className="group overflow-hidden rounded-2xl border border-[#E6DACA] bg-[#FBF8F3] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
                        >
                            {/* Colourful card accent */}
                            <div className={`h-1.5 bg-linear-to-r ${getPriorityAccent(bug.priority)}`} />

                            <div className="p-5 sm:p-6">

                                {/* Card heading */}
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9E2D5] text-lg dark:bg-gray-800">
                                            🐛
                                        </span>

                                        <span className="text-xs font-bold uppercase tracking-wider text-[#968575] dark:text-gray-500">
                                            Bug Report
                                        </span>
                                    </div>

                                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(bug.status)}`}>
                                        {bug.status.replace("-", " ")}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="wrap-break-word text-xl font-bold leading-snug text-[#293B35] transition-colors group-hover:text-[#71836F] dark:text-white dark:group-hover:text-green-300">
                                    {bug.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#776B5E] dark:text-gray-400">
                                    {bug.description}
                                </p>

                                {/* Priority and severity */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className={`rounded-lg px-3 py-2 text-xs font-bold capitalize ${getPriorityStyle(bug.priority)}`}>
                                        ⚑ {bug.priority} Priority
                                    </span>

                                    <span className="rounded-lg bg-[#E9E2D5] px-3 py-2 text-xs font-semibold capitalize text-[#66594D] dark:bg-gray-800 dark:text-gray-300">
                                        Severity:{" "}
                                        <span className={getSeverityStyle(bug.severity)}>
                                            {bug.severity}
                                        </span>
                                    </span>
                                </div>

                                {/* Reporter and assignee */}
                                <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-[#E6DACA] bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-800/70 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#968575] dark:text-gray-500">
                                            Reported by
                                        </p>

                                        <p className="mt-1 wrap-break-word text-sm font-semibold text-[#44382F] dark:text-gray-200">
                                            👤 {bug.createdBy?.name ?? "Unknown"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#968575] dark:text-gray-500">
                                            Assigned to
                                        </p>

                                        <p className="mt-1 wrap-break-word text-sm font-semibold text-[#44382F] dark:text-gray-200">
                                            {bug.assignedTo?.name ?? "Unassigned"}
                                        </p>
                                    </div>
                                </div>

                                {/* View details */}
                                <button
                                    type="button"
                                    onClick={() => navigate(`/bugs/${bug.id}`)}
                                    className="mt-5 w-full rounded-xl bg-[#293B35] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3B554A] focus:outline-none focus:ring-2 focus:ring-[#71836F] focus:ring-offset-2 dark:bg-[#71836F] dark:hover:bg-[#849982] dark:focus:ring-offset-gray-900"
                                >
                                    View Bug Details →
                                </button>

                                {/* Edit section */}
                                {canEditBug && (
                                    <div className={sectionDivider}>
                                        {!isEditing ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEditClick(bug)}
                                                className="rounded-xl border border-[#DCCFBE] bg-white px-4 py-2.5 text-sm font-semibold text-[#53665A] transition hover:bg-[#E9E2D5] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                ✏️ Edit Bug
                                            </button>
                                        ) : (
                                            <div className="space-y-4 rounded-xl bg-white/70 p-4 dark:bg-gray-800/60">
                                                <h3 className="font-bold text-[#293B35] dark:text-white">
                                                    ✏️ Edit Bug Details
                                                </h3>

                                                <div>
                                                    <label className={labelClass}>
                                                        Bug Title
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        placeholder="Enter bug title"
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>
                                                        Bug Description
                                                    </label>

                                                    <textarea
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        placeholder="Describe the bug"
                                                        rows={4}
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelClass}>
                                                            Priority
                                                        </label>

                                                        <select
                                                            value={editPriority}
                                                            onChange={(e) => setEditPriority(e.target.value)}
                                                            className={inputClass}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                            <option value="critical">Critical</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className={labelClass}>
                                                            Severity
                                                        </label>

                                                        <select
                                                            value={editSeverity}
                                                            onChange={(e) => setEditSeverity(e.target.value)}
                                                            className={inputClass}
                                                        >
                                                            <option value="minor">Minor</option>
                                                            <option value="major">Major</option>
                                                            <option value="critical">Critical</option>
                                                            <option value="blocker">Blocker</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateBug(bug.id)}
                                                        disabled={savingBug}
                                                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {savingBug ? "Saving..." : "Save Changes"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        disabled={savingBug}
                                                        className="rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Admin assignment */}
                                {userRole === "admin" && (
                                    <div className={sectionDivider}>
                                        <label className={labelClass}>
                                            Assign Bug to Developer
                                        </label>

                                        <select
                                            value={bug.assignedTo?.id ?? ""}
                                            onChange={(e) => handleAssignBug(bug.id, e.target.value)}
                                            disabled={assigningBug || developersLoading}
                                            className={inputClass}
                                        >
                                            <option value="">Unassigned</option>

                                            {developersData?.developers.map((developer) => (
                                                <option
                                                    key={developer.id}
                                                    value={developer.id}
                                                >
                                                    {developer.name}
                                                </option>
                                            ))}
                                        </select>

                                        {developersLoading && (
                                            <p className="mt-2 text-sm text-[#887967] dark:text-gray-400">
                                                Loading developers...
                                            </p>
                                        )}

                                        {assigningBug && (
                                            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                                Assigning bug...
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Status update */}
                                {canUpdateStatus && (
                                    <div className={sectionDivider}>
                                        <label className={labelClass}>
                                            Update Bug Status
                                        </label>

                                        <select
                                            value={bug.status}
                                            onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                                            disabled={updatingStatus}
                                            className={inputClass}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>

                                        {updatingStatus && (
                                            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                                Updating status...
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Admin delete */}
                                {userRole === "admin" && (
                                    <div className={sectionDivider}>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBug(bug.id, bug.title)}
                                            disabled={deletingBug}
                                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/50"
                                        >
                                            {deletingBug ? "Deleting..." : "🗑 Delete Bug"}
                                        </button>

                                        {deletingBug && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                Deleting bug report...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Comments */}
                            <div className="border-t border-[#E6DACA] bg-[#F1EEE5]/70 p-5 dark:border-gray-700 dark:bg-gray-950/50 sm:p-6">
                                <CommentSection bugId={bug.id} />
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Pagination */}
            {filteredBugs.length > 0 && totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DACA] bg-[#FBF8F3] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm font-medium text-[#66594D] dark:text-gray-300">
                        Page {safeCurrentPage} of {totalPages}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((previous) => Math.max(previous - 1, 1))
                            }
                            disabled={safeCurrentPage === 1}
                            className="rounded-xl border border-[#DCCFBE] px-3 py-2 text-sm font-semibold text-[#66594D] transition hover:bg-[#E9E2D5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                aria-current={safeCurrentPage === page ? "page" : undefined}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    safeCurrentPage === page
                                        ? "bg-[#293B35] text-white dark:bg-[#71836F]"
                                        : "border border-[#DCCFBE] text-[#66594D] hover:bg-[#E9E2D5] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((previous) =>
                                    Math.min(previous + 1, totalPages)
                                )
                            }
                            disabled={safeCurrentPage === totalPages}
                            className="rounded-xl border border-[#DCCFBE] px-3 py-2 text-sm font-semibold text-[#66594D] transition hover:bg-[#E9E2D5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BugList;
