
import { useState } from "react";
import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";
import Footer from "../components/Footer";

function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [failedAvatar, setFailedAvatar] = useState<string | null>(null);

    // Check whether the current avatar has failed to load
    const showAvatar =
        Boolean(user?.avatar) &&
        failedAvatar !== user?.avatar;

    // Generate user initials as a fallback
    const userInitials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    // Reusable Avatar Component
    const renderAvatar = (size = "h-10 w-10") => (
        <div
            className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D8C5AD] font-bold text-[#44382F] dark:bg-gray-700 dark:text-white`}
        >
            {showAvatar ? (
                <img
                    src={user?.avatar || ""}
                    alt={`${user?.name || "User"}'s avatar`}
                    className="h-full w-full object-cover"
                    onError={() =>
                        setFailedAvatar(user?.avatar || null)
                    }
                />
            ) : (
                userInitials
            )}
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Navigate to Dashboard when Bugdesk branding is clicked
    const handleLogoClick = () => {
        setMobileMenuOpen(false);
        navigate("/dashboard");
    };

    // Scroll to the Create Bug form
    const scrollToCreateBug = () => {
        document.getElementById("create-bug")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    // Navigate to Dashboard and scroll after the page loads
    const handleCreateBugClick = () => {
        setMobileMenuOpen(false);

        if (location.pathname === "/dashboard") {
            scrollToCreateBug();
        } else {
            navigate("/dashboard#create-bug");
        }
    };

    // Handle scrolling after navigating from another page
    useState(() => {
        // No side effects are needed here.
    });

    const navigation = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: "▦",
            roles: ["admin", "developer", "tester"],
        },
        {
            label: "All Bugs",
            path: "/bugs",
            icon: "🐛",
            roles: ["admin", "developer", "tester"],
        },
        {
            label: "My Assigned Bugs",
            path: "/my-bugs",
            icon: "✓",
            roles: ["developer"],
        },
        {
            label: "Activity",
            path: "/activity",
            icon: "◷",
            roles: ["admin", "developer", "tester"],
        },
        {
            label: "Profile",
            path: "/profile",
            icon: "◎",
            roles: ["admin", "developer", "tester"],
        },
        {
            label: "Settings",
            path: "/settings",
            icon: "⚙",
            roles: ["admin", "developer", "tester"],
        },
    ];

    const visibleNavigation = navigation.filter((item) =>
        item.roles.includes(user?.role?.toLowerCase() || "")
    );

    const renderNavigation = () => (
        <nav className="space-y-2">
            {visibleNavigation.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                            isActive
                                ? "bg-[#293B35] text-white dark:bg-[#71836F] dark:text-white"
                                : "text-[#66594D] hover:bg-[#E6D7C4] dark:text-gray-300 dark:hover:bg-gray-700"
                        }`
                    }
                >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}

            {/* Create Bug Navigation */}
            <button
                type="button"
                onClick={handleCreateBugClick}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-[#66594D] transition-colors hover:bg-[#E6D7C4] dark:text-gray-300 dark:hover:bg-gray-700"
            >
                <span className="text-lg">＋</span>
                Create Bug
            </button>
        </nav>
    );

    // Reusable User Information
    const renderUserInfo = () => (
        <div className="flex items-center gap-3">
            {renderAvatar("h-11 w-11")}

            <div className="min-w-0">
                <p className="truncate font-semibold text-[#293B35] dark:text-white">
                    {user?.name}
                </p>

                <p className="text-sm capitalize text-[#968575] dark:text-gray-400">
                    {user?.role}
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F5F0E8] text-[#44382F] transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#E2D7C9] bg-[#EFE7DB] p-6 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 lg:flex">

                {/* Clickable Bugdesk Logo */}
                <button
                    type="button"
                    onClick={handleLogoClick}
                    aria-label="Go to Bugdesk Dashboard"
                    className="mb-10 flex w-fit items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-75"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#293B35] text-xl text-white dark:bg-[#71836F]">
                        🐛
                    </div>

                    <span className="text-2xl font-bold text-[#293B35] dark:text-white">
                        Bugdesk
                    </span>
                </button>

                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#968575] dark:text-gray-500">
                    Workspace
                </p>

                {renderNavigation()}

                {/* Desktop User Information */}
                <div className="mt-auto border-t border-[#DCCFBE] pt-5 dark:border-gray-700">
                    <div className="mb-4">
                        {renderUserInfo()}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-4 py-3 text-left text-red-700 transition hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"
                    >
                        ↪ Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">

                {/* Top Header */}
                <header className="sticky top-0 z-30 border-b border-[#E2D7C9] bg-[#F5F0E8]/95 px-5 py-4 backdrop-blur transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/95">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="rounded-lg p-2 text-2xl transition hover:bg-[#E6D7C4] dark:hover:bg-gray-800 lg:hidden"
                                aria-label="Toggle navigation menu"
                                aria-expanded={mobileMenuOpen}
                            >
                                ☰
                            </button>

                            {/* Mobile Bugdesk Logo */}
                            <button
                                type="button"
                                onClick={handleLogoClick}
                                aria-label="Go to Bugdesk Dashboard"
                                className="flex items-center gap-2 text-xl font-bold text-[#293B35] transition-opacity hover:opacity-75 dark:text-white lg:hidden"
                            >
                                🐛 Bugdesk
                            </button>

                            {/* Desktop Welcome Message */}
                            <div className="hidden lg:block">
                                <p className="text-lg font-semibold text-[#293B35] dark:text-white">
                                    Welcome back, {user?.name}
                                </p>

                                <p className="text-sm text-[#968575] dark:text-gray-400">
                                    Here's what's happening with your workspace.
                                </p>
                            </div>
                        </div>

                        {/* Top-right Profile Avatar */}
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            aria-label="Go to profile"
                            title="View Profile"
                            className="rounded-full transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-[#71836F] dark:hover:ring-[#A3B99C]"
                        >
                            {renderAvatar()}
                        </button>
                    </div>
                </header>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute inset-0 h-full w-full bg-black/50"
                            aria-label="Close navigation menu"
                        />

                        <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-[#EFE7DB] p-6 text-[#44382F] shadow-xl transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">

                            <div className="mb-10 flex items-center justify-between">

                                {/* Mobile Drawer Logo */}
                                <button
                                    type="button"
                                    onClick={handleLogoClick}
                                    aria-label="Go to Bugdesk Dashboard"
                                    className="text-2xl font-bold text-[#293B35] transition-opacity hover:opacity-75 dark:text-white"
                                >
                                    🐛 Bugdesk
                                </button>

                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg px-2 text-2xl hover:bg-[#E6D7C4] dark:hover:bg-gray-800"
                                    aria-label="Close menu"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#968575] dark:text-gray-500">
                                Workspace
                            </p>

                            {renderNavigation()}

                            {/* Mobile User Information */}
                            <div className="mt-auto border-t border-[#DCCFBE] pt-5 dark:border-gray-700">
                                <div className="mb-4">
                                    {renderUserInfo()}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full rounded-xl px-4 py-3 text-left text-red-700 transition hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"
                                >
                                    ↪ Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 bg-[#F5F0E8] p-4 transition-colors duration-300 dark:bg-gray-950 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

                {/* Global Footer */}
                <Footer />
            </div>
        </div>
    );
}

export default AppLayout;
