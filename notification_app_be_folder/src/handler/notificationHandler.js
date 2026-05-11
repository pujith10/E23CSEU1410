import {
    mxCreateNotification,
    mxGetNotifications,
    mxReadNotification,
    mxReadAll,
    mxGetPriorityInbox,
    mxGetUnreadCount,
    mxBulkNotify,
} from "../service/notificationService.js";
import { zxLog } from "../middleware/logAdapter.js";
import { oxPushSSE } from "../route/notificationRoute.js";

export const hxCreate = async (req, res) => {
    try {
        const { studentId, notificationType, message, email } = req.body;
        if (!studentId || !notificationType || !message) {
            await zxLog("handler", "warn", "Create notification called with missing fields");
            return res.status(400).json({ error: "studentId, notificationType and message are required" });
        }
        const nx = await mxCreateNotification({ studentId, notificationType, message, email }, oxPushSSE);
        return res.status(201).json({ notification: nx });
    } catch (ek) {
        await zxLog("handler", "error", `Create notification handler error: ${ek.msg || ek.message}`);
        return res.status(ek.status || 500).json({ error: ek.msg || "Internal server error" });
    }
};

export const hxList = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { limit = 20, page = 1, notification_type } = req.query;
        const rows = await mxGetNotifications({
            studentId,
            limit: Number(limit),
            page: Number(page),
            notificationType: notification_type,
        });
        const unread = await mxGetUnreadCount({ studentId });
        return res.json({ notifications: rows, unreadCount: unread });
    } catch (ek) {
        await zxLog("handler", "error", `List notifications handler error: ${ek.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const hxMarkRead = async (req, res) => {
    try {
        const { studentId, notificationId } = req.params;
        const nx = await mxReadNotification({ notificationId, studentId });
        return res.json({ notification: nx });
    } catch (ek) {
        await zxLog("handler", "error", `Mark-read handler error: ${ek.msg || ek.message}`);
        return res.status(ek.status || 500).json({ error: ek.msg || "Internal server error" });
    }
};

export const hxMarkAllRead = async (req, res) => {
    try {
        const { studentId } = req.params;
        await mxReadAll({ studentId });
        return res.json({ message: "All notifications marked as read" });
    } catch (ek) {
        await zxLog("handler", "error", `Mark-all-read handler error: ${ek.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const hxPriorityInbox = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { topN = 10 } = req.query;
        const rows = await mxGetPriorityInbox({ studentId, topN: Number(topN) });
        return res.json({ priorityNotifications: rows });
    } catch (ek) {
        await zxLog("handler", "error", `Priority inbox handler error: ${ek.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const hxBulkNotify = async (req, res) => {
    try {
        const { studentIds, notificationType, message } = req.body;
        if (!Array.isArray(studentIds) || !notificationType || !message) {
            return res.status(400).json({ error: "studentIds array, notificationType and message required" });
        }
        const result = await mxBulkNotify({ studentIds, notificationType, message }, oxPushSSE);
        return res.json(result);
    } catch (ek) {
        await zxLog("handler", "error", `Bulk notify handler error: ${ek.msg || ek.message}`);
        return res.status(ek.status || 500).json({ error: ek.msg || "Internal server error" });
    }
};
