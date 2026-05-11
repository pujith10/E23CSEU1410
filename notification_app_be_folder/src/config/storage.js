import { randomUUID } from "crypto";

const mockDb = {
    notifications: []
};

export const gxPool = {
    query: async (text, params) => {
        if (text.includes("INSERT INTO nx_notifications")) {
            const nx = {
                id: randomUUID(),
                student_id: params[0],
                notification_type: params[1],
                message: params[2],
                priority_score: params[3],
                is_read: false,
                created_at: new Date().toISOString()
            };
            mockDb.notifications.push(nx);
            return { rows: [nx] };
        }
        if (text.includes("SELECT * FROM nx_notifications")) {
            let res = [...mockDb.notifications];
            if (text.includes("is_read = FALSE")) {
                res = res.filter(n => !n.is_read);
            }
            return { rows: res.reverse() };
        }
        if (text.includes("UPDATE nx_notifications")) {
            const nx = mockDb.notifications.find(n => n.id === params[0]);
            if (nx) nx.is_read = true;
            return { rows: [nx || { id: params[0], is_read: true }] };
        }
        if (text.includes("SELECT COUNT(*)")) {
            return { rows: [{ count: mockDb.notifications.filter(n => !n.is_read).length }] };
        }
        if (text.includes("INSERT INTO nx_students")) {
            return { rows: [{ student_id: params[0], email: params[1] }] };
        }
        return { rows: [] };
    }
};

export const vxRedis = {
    connect: async () => {},
    on: () => {},
    get: async () => null,
    setEx: async () => {},
    del: async () => {},
    keys: async () => []
};

export const nxConnect = async () => {};
