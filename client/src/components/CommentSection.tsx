
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_COMMENTS_QUERY } from "../graphql/queries";

import {
    CREATE_COMMENT_MUTATION,
    DELETE_COMMENT_MUTATION,
    UPDATE_COMMENT_MUTATION,
} from "../graphql/mutations";

import { useAuth } from "../context/useAuth";

interface Comment {
    id: string;
    content: string;
    createdAt: string | number;
    author: {
        id: string;
        name: string;
        email: string;
    };
}

interface CommentsResponse {
    comments: Comment[];
}

interface CommentsVariables {
    bugId: string;
}

interface CreateCommentResponse {
    createComment: Comment;
}

interface CreateCommentVariables {
    input: {
        bugId: string;
        content: string;
    };
}

interface DeleteCommentResponse {
    deleteComment: boolean;
}

interface DeleteCommentVariables {
    commentId: string;
}

interface UpdateCommentResponse {
    updateComment: Comment;
}

interface UpdateCommentVariables {
    commentId: string;
    content: string;
}

interface CommentSectionProps {
    bugId: string;
}

// FORMAT COMMENT DATE
const formatCommentDate = (createdAt: string | number) => {
    const timestamp =
        typeof createdAt === "string" && /^\d+$/.test(createdAt)
            ? Number(createdAt)
            : createdAt;

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
};

// GET USER INITIALS
const getInitials = (name: string) => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

function CommentSection({ bugId }: CommentSectionProps) {
    const { user } = useAuth();

    const [content, setContent] = useState("");

    const [editingCommentId, setEditingCommentId] =
        useState<string | null>(null);

    const [editedContent, setEditedContent] = useState("");

    const {
        data,
        loading,
        error,
    } = useQuery<CommentsResponse, CommentsVariables>(
        GET_COMMENTS_QUERY,
        {
            variables: { bugId },
        }
    );

    // CREATE COMMENT
    const [createComment, { loading: submitting }] =
        useMutation<CreateCommentResponse, CreateCommentVariables>(
            CREATE_COMMENT_MUTATION,
            {
                refetchQueries: [
                    {
                        query: GET_COMMENTS_QUERY,
                        variables: { bugId },
                    },
                ],
                awaitRefetchQueries: true,
            }
        );

    // DELETE COMMENT
    const [deleteComment, { loading: deleting }] =
        useMutation<DeleteCommentResponse, DeleteCommentVariables>(
            DELETE_COMMENT_MUTATION,
            {
                refetchQueries: [
                    {
                        query: GET_COMMENTS_QUERY,
                        variables: { bugId },
                    },
                ],
                awaitRefetchQueries: true,
            }
        );

    // UPDATE COMMENT
    const [updateComment, { loading: updating }] =
        useMutation<UpdateCommentResponse, UpdateCommentVariables>(
            UPDATE_COMMENT_MUTATION,
            {
                refetchQueries: [
                    {
                        query: GET_COMMENTS_QUERY,
                        variables: { bugId },
                    },
                ],
                awaitRefetchQueries: true,
            }
        );

    // SUBMIT NEW COMMENT
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            alert("Please enter a comment.");
            return;
        }

        try {
            await createComment({
                variables: {
                    input: {
                        bugId,
                        content: trimmedContent,
                    },
                },
            });

            setContent("");
        } catch (error) {
            console.error("Comment submission failed:", error);
            alert("Failed to submit comment. Please try again.");
        }
    };

    // START EDITING
    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedContent(comment.content);
    };

    // CANCEL EDITING
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedContent("");
    };

    // SAVE EDITED COMMENT
    const handleUpdateComment = async (commentId: string) => {
        const trimmedContent = editedContent.trim();

        if (!trimmedContent) {
            alert("Comment cannot be empty.");
            return;
        }

        if (trimmedContent.length > 5000) {
            alert("Comment cannot exceed 5000 characters.");
            return;
        }

        try {
            await updateComment({
                variables: {
                    commentId,
                    content: trimmedContent,
                },
            });

            handleCancelEdit();
        } catch (error) {
            console.error("Comment update failed:", error);
            alert("Failed to update comment. Please try again.");
        }
    };

    // DELETE COMMENT
    const handleDeleteComment = async (commentId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        try {
            await deleteComment({
                variables: {
                    commentId,
                },
            });
        } catch (error) {
            console.error("Comment deletion failed:", error);
            alert("Failed to delete comment. Please try again.");
        }
    };

    const comments = data?.comments ?? [];

    return (
        <div className="mt-6 border-t border-[#E7E1D8] pt-5 dark:border-gray-700">

            {/* SECTION HEADING */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#44382F] dark:text-gray-100">
                    <span>💬</span>
                    Comments
                    <span className="rounded-full bg-[#E8EFE9] px-2.5 py-0.5 text-xs font-semibold text-[#285943] dark:bg-emerald-900/40 dark:text-emerald-300">
                        {comments.length}
                    </span>
                </h3>
            </div>

            {/* CREATE COMMENT FORM */}
            <form
                onSubmit={handleSubmit}
                className="mb-5 rounded-xl border border-[#E7E1D8] bg-[#FBF8F3] p-4 dark:border-gray-700 dark:bg-gray-800"
            >
                <label className="mb-2 block text-sm font-semibold text-[#44382F] dark:text-gray-200">
                    Add a comment
                </label>

                <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Share your thoughts or provide an update..."
                    rows={3}
                    maxLength={5000}
                    className="w-full resize-y rounded-lg border border-[#DED7CC] bg-white p-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#285943] focus:ring-2 focus:ring-[#285943]/10 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10"
                />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {content.length}/5000 characters
                    </span>

                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="rounded-lg bg-[#285943] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F4534] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                        {submitting ? "Posting..." : "✉ Post Comment"}
                    </button>
                </div>
            </form>

            {/* LOADING */}
            {loading && (
                <div className="rounded-lg bg-[#FBF8F3] p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Loading comments...
                </div>
            )}

            {/* ERROR */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                    Failed to load comments. Please try again.
                </div>
            )}

            {/* COMMENTS LIST */}
            {!loading && !error && (
                <div className="space-y-3">

                    {comments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#DED7CC] bg-[#FBF8F3] px-4 py-8 text-center dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-2 text-3xl">💭</div>

                            <p className="text-sm font-semibold text-[#44382F] dark:text-gray-200">
                                No comments yet
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Start the conversation by adding the first comment.
                            </p>
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const canEdit =
                                user?.role === "admin" ||
                                user?.id === comment.author.id;

                            const canDelete = canEdit;

                            const isEditing =
                                editingCommentId === comment.id;

                            return (
                                <div
                                    key={comment.id}
                                    className="rounded-xl border border-[#E7E1D8] bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                    {/* COMMENT HEADER */}
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">

                                            {/* AVATAR */}
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFE9] text-xs font-bold text-[#285943] dark:bg-emerald-900/50 dark:text-emerald-300">
                                                {getInitials(comment.author.name)}
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-[#44382F] dark:text-gray-100">
                                                    {comment.author.name}
                                                </p>

                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatCommentDate(comment.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {canEdit && (
                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                                {user?.role === "admin" &&
                                                user?.id !== comment.author.id
                                                    ? "Admin access"
                                                    : "Your comment"}
                                            </span>
                                        )}
                                    </div>

                                    {/* EDITING INTERFACE */}
                                    {isEditing ? (
                                        <div>
                                            <textarea
                                                value={editedContent}
                                                onChange={(event) =>
                                                    setEditedContent(
                                                        event.target.value
                                                    )
                                                }
                                                rows={3}
                                                maxLength={5000}
                                                className="w-full resize-y rounded-lg border border-blue-300 bg-white p-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400"
                                            />

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {editedContent.length}/5000 characters
                                                </span>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateComment(comment.id)
                                                        }
                                                        disabled={
                                                            updating ||
                                                            !editedContent.trim()
                                                        }
                                                        className="rounded-lg bg-[#285943] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1F4534] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                                    >
                                                        {updating
                                                            ? "Saving..."
                                                            : "Save Changes"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        disabled={updating}
                                                        className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* COMMENT CONTENT */}
                                            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                {comment.content}
                                            </p>

                                            {/* EDIT AND DELETE BUTTONS */}
                                            {canEdit && (
                                                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F0ECE5] pt-3 dark:border-gray-700">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStartEdit(comment)
                                                        }
                                                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                    >
                                                        ✏ Edit
                                                    </button>

                                                    {canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteComment(comment.id)
                                                            }
                                                            disabled={deleting}
                                                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                                        >
                                                            {deleting
                                                                ? "Deleting..."
                                                                : "🗑 Delete"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default CommentSection;
