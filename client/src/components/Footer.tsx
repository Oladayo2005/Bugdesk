
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="border-t border-[#E2D7C9] bg-[#EFE7DB] px-5 py-8 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">

                {/* Brand */}
                <div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#293B35] transition-opacity hover:opacity-75 dark:text-white"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#293B35] text-sm text-white dark:bg-[#71836F]">
                            🐛
                        </span>
                        Bugdesk
                    </Link>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#968575] dark:text-gray-400">
                        A simpler way to report bugs, collaborate with your
                        team, and keep projects moving.
                    </p>
                </div>

                {/* Navigation */}
                <nav
                    aria-label="Footer navigation"
                    className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"
                >
                    <Link
                        to="/dashboard"
                        className="text-[#66594D] transition-colors hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/bugs"
                        className="text-[#66594D] transition-colors hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                    >
                        All Bugs
                    </Link>

                    <Link
                        to="/activity"
                        className="text-[#66594D] transition-colors hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                    >
                        Activity
                    </Link>

                    <Link
                        to="/profile"
                        className="text-[#66594D] transition-colors hover:text-green-800 dark:text-gray-400 dark:hover:text-lime-400"
                    >
                        Profile
                    </Link>
                </nav>
            </div>

            {/* Copyright */}
            <div className="mx-auto mt-7 max-w-7xl border-t border-[#DCCFBE] pt-5 dark:border-gray-800">
                <p className="text-center text-xs text-[#968575] dark:text-gray-500 md:text-left">
                    © {new Date().getFullYear()} Bugdesk. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
