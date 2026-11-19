
import mongoose, { Schema } from "mongoose";

export type ActivityAction =
    | "bug_created"
    | "bug_assigned"
    | "status_changed"
    | "bug_updated"
    | "comment_added"
    | "comment_deleted";

export interface IActivity {
    bug: mongoose.Types.ObjectId;
    performedBy: mongoose.Types.ObjectId;
    action: ActivityAction;
    description: string;
    metadata?: Record<string, unknown> | null;
}

const activitySchema = new Schema<IActivity>(
    {
        bug: {
            type: Schema.Types.ObjectId,
            ref: "Bug",
            required: true,
        },

        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            enum: [
                "bug_created",
                "bug_assigned",
                "status_changed",
                "bug_updated",
                "comment_added",
                "comment_deleted",
            ],
            required: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Activity = mongoose.model<IActivity>(
    "Activity",
    activitySchema
);

export default Activity;
