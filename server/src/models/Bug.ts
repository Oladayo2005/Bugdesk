
import mongoose, { Schema } from "mongoose";

export type BugPriority = "low" | "medium" | "high" | "critical";

export type BugSeverity = "minor" | "major" | "critical" | "blocker";

export type BugStatus = "open" | "in-progress" | "resolved" | "closed";

export interface IBug {
    title: string;
    description: string;
    priority: BugPriority;
    severity: BugSeverity;
    status: BugStatus;
    createdBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId | null;
    project?: mongoose.Types.ObjectId | null;
}

const bugSchema = new Schema<IBug>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },

        severity: {
            type: String,
            enum: ["minor", "major", "critical", "blocker"],
            default: "minor",
        },

        status: {
            type: String,
            enum: ["open", "in-progress", "resolved", "closed"],
            default: "open",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Bug = mongoose.model<IBug>("Bug", bugSchema);

export default Bug;
