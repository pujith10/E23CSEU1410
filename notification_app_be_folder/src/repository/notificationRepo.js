import { gxPool } from "../config/storage.js";
import { zxLog } from "../middleware/logAdapter.js";

export const fxInsertNotification = async ({ studentId, notificationType, message, priorityScore }) => {
    const qk = `
        INSERT INTO nx_notifications (student_id, notification_type, message, priority_score)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const rk = await gxPool.query(qk, [studentId, notificationType, message, priorityScore]);
    await zxLog("repository", "info", `Notification inserted for student ${studentId} type=${notificationType}`);
    return rk.rows[0];
};

export const fxFetchNotifications = async ({ studentId, limit = 20, page = 1, notificationType }) => {
    const ok = (page - 1) * limit;
    const pk = [];
    let wk = "WHERE student_id = $1";
    pk.push(studentId);

    if (notificationType) {
        pk.push(notificationType);
        wk += ` AND notification_type = $${pk.length}`;
    }

    pk.push(limit);
    pk.push(ok);

    const qk = `
        SELECT * FROM nx_notifications
        ${wk}
        ORDER BY created_at DESC
        LIMIT $${pk.length - 1} OFFSET $${pk.length}
    `;

    const rk = await gxPool.query(qk, pk);
    await zxLog("repository", "debug", `Fetched ${rk.rows.length} notifications for student ${studentId}`);
    return rk.rows;
};

export const fxMarkAsRead = async ({ notificationId, studentId }) => {
    const qk = `
        UPDATE nx_notifications
        SET is_read = TRUE
        WHERE id = $1 AND student_id = $2
        RETURNING *
    `;
    const rk = await gxPool.query(qk, [notificationId, studentId]);
    await zxLog("repository", "info", `Notification ${notificationId} marked read for student ${studentId}`);
    return rk.rows[0];
};

export const fxMarkAllRead = async ({ studentId }) => {
    const qk = `
        UPDATE nx_notifications
        SET is_read = TRUE
        WHERE student_id = $1 AND is_read = FALSE
    `;
    await gxPool.query(qk, [studentId]);
    await zxLog("repository", "info", `All notifications marked read for student ${studentId}`);
};

export const fxFetchPriorityInbox = async ({ studentId, topN }) => {
    const nk = Number(topN) || 10;
    const qk = `
        SELECT * FROM nx_notifications
        WHERE student_id = $1 AND is_read = FALSE
        ORDER BY priority_score DESC, created_at DESC
        LIMIT $2
    `;
    const rk = await gxPool.query(qk, [studentId, nk]);
    await zxLog("repository", "debug", `Priority inbox fetched: top ${nk} for student ${studentId}`);
    return rk.rows;
};

export const fxCountUnread = async ({ studentId }) => {
    const qk = `SELECT COUNT(*) FROM nx_notifications WHERE student_id = $1 AND is_read = FALSE`;
    const rk = await gxPool.query(qk, [studentId]);
    return Number(rk.rows[0].count);
};

export const fxUpsertStudent = async ({ studentId, email }) => {
    const qk = `
        INSERT INTO nx_students (student_id, email)
        VALUES ($1, $2)
        ON CONFLICT (student_id) DO NOTHING
        RETURNING *
    `;
    const rk = await gxPool.query(qk, [studentId, email]);
    return rk.rows ? rk.rows[0] : null;
};
