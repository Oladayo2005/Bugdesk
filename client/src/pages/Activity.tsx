
import RecentActivity from "../components/RecentActivity";

function Activity() {
    return (
        <div className="space-y-6">
            <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#71836F]">
                    Workspace Overview
                </p>

                <h1 className="text-3xl font-bold text-[#293B35]">
                    Activity
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#827F76]">
                    Follow bug reports, assignments, status changes,
                    and discussions happening across your workspace.
                </p>
            </div>

            <RecentActivity
                limit={50}
                title="Workspace Activity"
                description="The latest actions performed by your team"
            />
        </div>
    );
}

export default Activity;
