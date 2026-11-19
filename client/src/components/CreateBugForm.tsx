
import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import { CREATE_BUG_MUTATION } from "../graphql/mutations";

interface CreateBugResponse {
    createBug: {
        id: string;
        title: string;
        description: string;
        priority: string;
        severity: string;
        status: string;
    };
}

interface CreateBugVariables {
    input: {
        title: string;
        description: string;
        priority: string;
        severity: string;
    };
}

function CreateBugForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [severity, setSeverity] = useState("minor");

    const [createBug, { loading, error }] = useMutation<
        CreateBugResponse,
        CreateBugVariables
    >(CREATE_BUG_MUTATION, {
        onCompleted: () => {
            setTitle("");
            setDescription("");
            setPriority("medium");
            setSeverity("minor");

            alert("Bug reported successfully!");
        },
    });

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle || !trimmedDescription) {
            return;
        }

        try {
            await createBug({
                variables: {
                    input: {
                        title: trimmedTitle,
                        description: trimmedDescription,
                        priority,
                        severity,
                    },
                },
            });
        } catch (err) {
            console.error("Bug creation failed:", err);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-[#DED7CC] bg-white p-3 text-sm text-[#44382F] outline-none transition placeholder:text-gray-400 focus:border-[#285943] focus:ring-2 focus:ring-[#285943]/10 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10";

    const labelClass =
        "mb-2 block text-sm font-semibold text-[#44382F] dark:text-gray-200";

    return (
        <div className="rounded-2xl border border-[#E6DACA] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">

            {/* FORM HEADING */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DFE8E0] text-2xl dark:bg-emerald-950">
                    🐛
                </div>

                <div>
                    <h2 className="text-xl font-bold text-[#44382F] dark:text-white">
                        Report a Bug
                    </h2>

                    <p className="mt-1 text-sm text-[#887967] dark:text-gray-400">
                        Provide the details of the issue you discovered.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* BUG TITLE */}
                <div>
                    <label className={labelClass}>
                        Bug Title <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Login button not responding"
                        required
                        maxLength={150}
                        className={inputClass}
                    />

                    <p className="mt-1.5 text-right text-xs text-gray-500 dark:text-gray-400">
                        {title.length}/150 characters
                    </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className={labelClass}>
                        Description <span className="text-red-500">*</span>
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the bug, what you expected to happen, and how to reproduce it..."
                        required
                        rows={5}
                        maxLength={5000}
                        className={`${inputClass} resize-y`}
                    />

                    <p className="mt-1.5 text-right text-xs text-gray-500 dark:text-gray-400">
                        {description.length}/5000 characters
                    </p>
                </div>

                {/* PRIORITY AND SEVERITY */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {/* PRIORITY */}
                    <div>
                        <label className={labelClass}>
                            Priority
                        </label>

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={inputClass}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>

                        <p className="mt-2 text-xs leading-relaxed text-[#887967] dark:text-gray-400">
                            How urgently should the team address this bug?
                        </p>
                    </div>

                    {/* SEVERITY */}
                    <div>
                        <label className={labelClass}>
                            Severity
                        </label>

                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className={inputClass}
                        >
                            <option value="minor">Minor</option>
                            <option value="major">Major</option>
                            <option value="critical">Critical</option>
                            <option value="blocker">Blocker</option>
                        </select>

                        <p className="mt-2 text-xs leading-relaxed text-[#887967] dark:text-gray-400">
                            How seriously does this bug affect the application?
                        </p>
                    </div>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                            Failed to create bug report.
                        </p>

                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="border-t border-[#E7E1D8] pt-5 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !title.trim() ||
                            !description.trim()
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285943] p-3.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#1F4534] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                        {loading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Submitting Report...
                            </>
                        ) : (
                            <>
                                <span>+</span>
                                Submit Bug Report
                            </>
                        )}
                    </button>

                    <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        Fields marked with <span className="text-red-500">*</span> are required.
                    </p>
                </div>
            </form>
        </div>
    );
}

export default CreateBugForm;
