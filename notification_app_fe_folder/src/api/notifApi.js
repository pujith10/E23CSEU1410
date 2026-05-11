import { l, s } from "../../../logging_middleware/index.js";

const VX_BASE = "http://localhost:5000/api";
let px_token = "";

export const axInitApi = (token) => {
    px_token = token;
    s(token);
};

const bxHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${px_token}`,
});

export const axFetchNotifications = async ({ limit = 20, page = 1, notification_type } = {}) => {
    await l("frontend", "info", "api", `Fetching notifications limit=${limit} page=${page} type=${notification_type || "all"}`);

    const qp = new URLSearchParams({ limit, page });
    if (notification_type) qp.set("notification_type", notification_type);

    const rk = await fetch(`${VX_BASE}/notifications/stu_1042?${qp}`, {
        headers: bxHeaders(),
    });

    if (!rk.ok) {
        await l("frontend", "error", "api", `Notifications fetch failed status=${rk.status}`);
        throw new Error(`Fetch failed: ${rk.status}`);
    }

    const dk = await rk.json();
    await l("frontend", "info", "api", `Notifications fetched count=${dk.notifications?.length}`);
    return dk;
};

export const axMarkRead = async (notificationId) => {
    await l("frontend", "info", "api", `Marking notification ${notificationId} as read`);

    const rk = await fetch(`${VX_BASE}/notifications/stu_1042/${notificationId}/read`, {
        method: "PATCH",
        headers: bxHeaders(),
    });

    if (!rk.ok) {
        await l("frontend", "error", "api", `Mark-read failed for ${notificationId} status=${rk.status}`);
        throw new Error(`Mark read failed: ${rk.status}`);
    }

    return rk.json();
};
