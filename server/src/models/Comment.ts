
import mongoose, { Schema } from "mongoose";

export interface IComment {
    content: string;
    bug: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        bug: {
            type: Schema.Types.ObjectId,
            ref: "Bug",
            required: true,
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Comment = mongoose.model<IComment>(
    "Comment",
    commentSchema
);

export default Comment;
