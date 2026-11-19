
import BugList from "../components/BugList";

function Bugs() {
    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#71836F]">
                    Bug Management
                </p>

                <h1 className="text-3xl font-bold text-[#293B35]">
                    All Bug Reports
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#827F76]">
                    Browse, search, filter, and manage bug reports
                    across your workspace.
                </p>
            </div>

            {/* Bug management component */}
            <BugList />

        </div>
    );
}

export default Bugs;
