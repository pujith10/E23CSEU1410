import { Router } from "express";
import {
    hxCreate,
    hxList,
    hxMarkRead,
    hxMarkAllRead,
    hxPriorityInbox,
    hxBulkNotify,
} from "../handler/notificationHandler.js";

const rx = Router();

const clients = new Map();

export const oxPushSSE = (studentId, notification) => {
    const cl = clients.get(studentId);
    if (cl) {
        cl.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
};

rx.get("/stream/:studentId", (req, res) => {
    const { studentId } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    clients.set(studentId, res);
    
    req.on("close", () => {
        clients.delete(studentId);
    });
});

rx.post("/", hxCreate);
rx.get("/:studentId", hxList);
rx.patch("/:studentId/:notificationId/read", hxMarkRead);
rx.patch("/:studentId/read-all", hxMarkAllRead);
rx.get("/:studentId/priority/inbox", hxPriorityInbox);
rx.post("/bulk/notify", hxBulkNotify);

export default rx;
