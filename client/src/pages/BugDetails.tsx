
import { useQuery } from "@apollo/client/react";
import { useParams, useNavigate } from "react-router-dom";

import { GET_BUG_QUERY } from "../graphql/queries";
import CommentSection from "../components/CommentSection";
import ActivityTimeline from "../components/ActivityTimeline";

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
  createdAt: string | number;
  updatedAt: string | number;
  createdBy: User | null;
  assignedTo: User | null;
}

interface GetBugResponse {
  bug: Bug | null;
}

interface GetBugVariables {
  id: string;
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

    if (Number.isFinite(numericDate)) {
      parsedDate = new Date(
        numericDate < 1e12 ? numericDate * 1000 : numericDate
      );
    } else {
      parsedDate = new Date(trimmedDate);
    }
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

    case "in-progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

    case "resolved":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";

    case "closed":
      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

    default:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";

    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";

    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";

    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getSeverityStyle = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";

    case "major":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";

    case "moderate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";

    case "minor":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

function BugDetails() {
  const { bugId } = useParams<{ bugId: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<
    GetBugResponse,
    GetBugVariables
  >(GET_BUG_QUERY, {
    variables: {
      id: bugId || "",
    },
    skip: !bugId,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading bug details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !bugId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-950 p-6">
        <div className="text-5xl">⚠️</div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Unable to Load Bug
        </h2>

        <p className="text-red-500 text-center">
          {error?.message || "Invalid bug ID."}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const bug = data?.bug;

  if (!bug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-950 p-6">
        <div className="text-5xl">🔍</div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bug Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-center">
          This bug may have been deleted or does not exist.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const informationCards = [
    {
      label: "Reported By",
      value: bug.createdBy?.name || "Unknown",
      extra: bug.createdBy?.email || "No email available",
      icon: "👤",
      accent: "bg-blue-500",
    },
    {
      label: "Assigned Developer",
      value: bug.assignedTo?.name || "Not assigned",
      extra: bug.assignedTo?.email || "Awaiting assignment",
      icon: "💻",
      accent: "bg-purple-500",
    },
    {
      label: "Date Created",
      value: formatDate(bug.createdAt),
      extra: "Initial report",
      icon: "📅",
      accent: "bg-green-500",
    },
    {
      label: "Last Updated",
      value: formatDate(bug.updatedAt),
      extra: "Most recent modification",
      icon: "🔄",
      accent: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-5xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-semibold transition"
        >
          <span className="text-xl">←</span>
          Back to Dashboard
        </button>

        {/* MAIN BUG CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

          {/* TOP ACCENT */}
          <div className="h-2 bg-linear-to-r from-green-500 via-emerald-600 to-teal-400" />

          <div className="p-5 sm:p-7 lg:p-8">

            {/* BUG HEADER */}
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                  Bug Report
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {bug.id.slice(-8)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white wrap-break-word leading-tight">
                    {bug.title}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Review the details, track progress, and collaborate on this issue.
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap w-fit ${getStatusStyle(
                    bug.status
                  )}`}
                >
                  ● {bug.status.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* PRIORITY AND SEVERITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">
                    🚩
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Priority
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold capitalize ${getPriorityStyle(
                        bug.priority
                      )}`}
                    >
                      {bug.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                    ⚡
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Severity
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold capitalize ${getSeverityStyle(
                        bug.severity
                      )}`}
                    >
                      {bug.severity}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="mb-9">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📝</span>

                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Description
                </h2>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-7 wrap-break-word">
                  {bug.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* INFORMATION SECTION */}
            <div className="mb-9">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📌</span>

                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Bug Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {informationCards.map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 hover:shadow-md transition"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.accent}`} />

                    <div className="flex items-start gap-3 pl-2">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg shrink-0">
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {item.label}
                        </p>

                        <p className="font-semibold text-gray-900 dark:text-white wrap-break-word">
                          {item.value}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 wrap-break-word">
                          {item.extra}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FULL BUG ID */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Full Bug ID
              </p>

              <p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                {bug.id}
              </p>
            </div>

          </div>
        </div>

        {/* COMMENTS */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">💬</span>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Discussion
            </h2>
          </div>

          <CommentSection bugId={bug.id} />
        </div>

        {/* ACTIVITY TIMELINE */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">🕒</span>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activity History
            </h2>
          </div>

          <ActivityTimeline bugId={bug.id} />
        </div>

      </div>
    </div>
  );
}

export default BugDetails;
