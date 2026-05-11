import express from "express";
import notificationRoute from "./src/route/notificationRoute.js";

const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoute);

const PORT = 5005;

const server = app.listen(PORT, async () => {
    console.log(`\n--- Running Stage 1 API Tests ---\n`);

    const headers = { "Content-Type": "application/json" };
    const baseUrl = `http://localhost:${PORT}/api/notifications`;

    try {
        console.log("1. Create Notification (POST /api/notifications)");
        const res1 = await fetch(baseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                studentId: "stu_1042",
                notificationType: "Placement",
                message: "CSX Corporation hiring drive on May 20",
                email: "stu1042@campus.edu"
            })
        });
        const data1 = await res1.json();
        console.log("Status:", res1.status);
        console.log("Response:", JSON.stringify(data1, null, 2));

        const notificationId = data1.notification?.id;

        console.log("\n2. Get Notifications (GET /api/notifications/stu_1042)");
        const res2 = await fetch(`${baseUrl}/stu_1042`);
        const data2 = await res2.json();
        console.log("Status:", res2.status);
        console.log("Response:", JSON.stringify(data2, null, 2));

        if (notificationId) {
            console.log(`\n3. Mark as Read (PATCH /api/notifications/stu_1042/${notificationId}/read)`);
            const res3 = await fetch(`${baseUrl}/stu_1042/${notificationId}/read`, { method: "PATCH" });
            const data3 = await res3.json();
            console.log("Status:", res3.status);
            console.log("Response:", JSON.stringify(data3, null, 2));
        }

        console.log("\n4. Mark All as Read (PATCH /api/notifications/stu_1042/read-all)");
        const res4 = await fetch(`${baseUrl}/stu_1042/read-all`, { method: "PATCH" });
        const data4 = await res4.json();
        console.log("Status:", res4.status);
        console.log("Response:", JSON.stringify(data4, null, 2));

        console.log("\n5. Priority Inbox (GET /api/notifications/stu_1042/priority/inbox)");
        const res5 = await fetch(`${baseUrl}/stu_1042/priority/inbox`);
        const data5 = await res5.json();
        console.log("Status:", res5.status);
        console.log("Response:", JSON.stringify(data5, null, 2));

        console.log("\n6. Bulk Notify (POST /api/notifications/bulk/notify)");
        const res6 = await fetch(`${baseUrl}/bulk/notify`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                studentIds: ["stu_1042", "stu_1043"],
                notificationType: "Event",
                message: "Campus Event Tomorrow"
            })
        });
        const data6 = await res6.json();
        console.log("Status:", res6.status);
        console.log("Response:", JSON.stringify(data6, null, 2));

        console.log(`\n--- Stage 1 Tests Completed Successfully ---`);
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        server.close();
        process.exit(0);
    }
});
