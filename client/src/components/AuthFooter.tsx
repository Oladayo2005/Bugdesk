
function AuthFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white px-5 py-6 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300">
                    BUGDESK<span className="text-green-600">.</span>
                </p>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} Bugdesk. All rights reserved.
                </p>

                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Track issues. Build better software. 💚
                </p>
            </div>
        </footer>
    );
}

export default AuthFooter;
