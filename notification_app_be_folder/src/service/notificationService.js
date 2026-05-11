import {
    fxInsertNotification,
    fxFetchNotifications,
    fxMarkAsRead,
    fxMarkAllRead,
    fxFetchPriorityInbox,
    fxCountUnread,
    fxUpsertStudent,
} from "../repository/notificationRepo.js";
import { cxGet, cxSet, cxDel, cxDelPattern } from "../cache/cacheUtil.js";
import { jxComputePriority } from "./priorityService.js";
import { dxIsValidType } from "../domain/notification.js";
import { zxLog } from "../middleware/logAdapter.js";

const emailQueue = {
    add: async (name, data) => {
        console.log(`[Mock BullMQ] Added job ${name} for ${data.studentId}`);
    }
};

const RK_NOTIFS = (sid, pg, tp) => `notifs:${sid}:p${pg}:t${tp || "all"}`;
const RK_PRIORITY = (sid, n) => `priority:${sid}:n${n}`;
const RK_COUNT = (sid) => `unread_count:${sid}`;

export const mxCreateNotification = async ({ studentId, notificationType, message, email }, sseCallback) => {
    if (!dxIsValidType(notificationType)) {
        await zxLog("service", "warn", `Invalid notification type attempted: ${notificationType}`);
        throw { status: 400, msg: "Invalid notification_type value" };
    }

    await fxUpsertStudent({ studentId, email: email || `${studentId}@campus.edu` });

    const createdAt = new Date();
    const priorityScore = await jxComputePriority(notificationType, createdAt, []);

    const nx = await fxInsertNotification({ studentId, notificationType, message, priorityScore });

    await cxDelPattern(`notifs:${studentId}:*`);
    await cxDel(RK_COUNT(studentId));
    await cxDelPattern(`priority:${studentId}:*`);

    if (sseCallback) {
        sseCallback(studentId, nx);
    }

    await zxLog("service", "info", `Notification created id=${nx.id} student=${studentId}`);
    return nx;
};

export const mxGetNotifications = async ({ studentId, limit, page, notificationType }) => {
    const ck = RK_NOTIFS(studentId, page, notificationType);
    const cached = await cxGet(ck);
    if (cached) return cached;

    const rows = await fxFetchNotifications({ studentId, limit, page, notificationType });

    await cxSet(ck, rows, 45);
    return rows;
};

export const mxReadNotification = async ({ notificationId, studentId }) => {
    const nx = await fxMarkAsRead({ notificationId, studentId });
    if (!nx) {
        await zxLog("service", "warn", `Mark-read attempted on non-existent notif ${notificationId}`);
        throw { status: 404, msg: "Notification not found" };
    }
    await cxDel(RK_COUNT(studentId));
    await cxDelPattern(`notifs:${studentId}:*`);
    await cxDelPattern(`priority:${studentId}:*`);
    return nx;
};

export const mxReadAll = async ({ studentId }) => {
    await fxMarkAllRead({ studentId });
    await cxDel(RK_COUNT(studentId));
    await cxDelPattern(`notifs:${studentId}:*`);
    await cxDelPattern(`priority:${studentId}:*`);
    await zxLog("service", "info", `All notifications cleared for student ${studentId}`);
};

export const mxGetPriorityInbox = async ({ studentId, topN }) => {
    const ck = RK_PRIORITY(studentId, topN);
    const cached = await cxGet(ck);
    if (cached) return cached;

    const rows = await fxFetchPriorityInbox({ studentId, topN });
    await cxSet(ck, rows, 30);
    return rows;
};

export const mxGetUnreadCount = async ({ studentId }) => {
    const ck = RK_COUNT(studentId);
    const cached = await cxGet(ck);
    if (cached !== null) return cached;

    const cnt = await fxCountUnread({ studentId });
    await cxSet(ck, cnt, 30);
    return cnt;
};

export const mxBulkNotify = async ({ studentIds, notificationType, message }, sseCallback) => {
    if (!dxIsValidType(notificationType)) {
        throw { status: 400, msg: "Invalid notification_type value" };
    }

    await zxLog("service", "info", `Bulk notify started: ${studentIds.length} students type=${notificationType}`);

    const BATCH = 200;
    const results = { success: 0, failed: 0, errors: [] };

    for (let ik = 0; ik < studentIds.length; ik += BATCH) {
        const chunk = studentIds.slice(ik, ik + BATCH);

        const settled = await Promise.allSettled(
            chunk.map(async (sid) => {
                const nx = await mxCreateNotification({ studentId: sid, notificationType, message }, sseCallback);
                await emailQueue.add("sendEmail", { studentId: sid, message });
                return nx;
            })
        );

        for (const res of settled) {
            if (res.status === "fulfilled") results.success++;
            else {
                results.failed++;
                results.errors.push(res.reason?.message || "unknown");
            }
        }
    }

    await zxLog("service", "info", `Bulk notify done: success=${results.success} failed=${results.failed}`);
    return results;
};
