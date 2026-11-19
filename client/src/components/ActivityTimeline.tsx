
import { useQuery } from "@apollo/client/react";
import { GET_ACTIVITIES_QUERY } from "../graphql/queries";

interface User {
    id: string;
    name: string;
    email: string;
}

interface Activity {
    id: string;
    action: string;
    description: string;
    metadata: string | null;
    createdAt: string;
    performedBy: User;
}

interface GetActivitiesResponse {
    activities: Activity[];
}

interface GetActivitiesVariables {
    bugId: string;
}

function ActivityTimeline({ bugId }: { bugId: string }) {
    const { data, loading, error } = useQuery<
        GetActivitiesResponse,
        GetActivitiesVariables
    >(GET_ACTIVITIES_QUERY, {
        variables: { bugId },
        skip: !bugId,
    });

    const formatDate = (dateValue: string) => {
        const timestamp =
            /^\d+$/.test(dateValue) ? Number(dateValue) : dateValue;

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString();
    };

    const getActivityIcon = (action: string) => {
        switch (action) {
            case "bug_created":
                return "🐛";
            case "bug_assigned":
                return "👤";
            case "status_changed":
                return "🔄";
            case "bug_updated":
                return "✏️";
            case "comment_added":
                return "💬";
            case "comment_deleted":
                return "🗑️";
            default:
                return "📌";
        }
    };

    if (loading) {
        return (
            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Activity History
                </h2>
                <p className="text-gray-500">Loading activity history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Activity History
                </h2>
                <p className="text-red-500">
                    Failed to load activity history: {error.message}
                </p>
            </div>
        );
    }

    const activities = data?.activities || [];

    return (
        <div className="mt-8 border-t dark:border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Activity History
            </h2>

            {activities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                    No activity has been recorded for this bug yet.
                </p>
            ) : (
                <div className="space-y-6">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                                {getActivityIcon(activity.action)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-gray-800 dark:text-gray-200">
                                    <span className="font-semibold">
                                        {activity.performedBy.name}
                                    </span>{" "}
                                    {activity.description}
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {formatDate(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ActivityTimeline;
