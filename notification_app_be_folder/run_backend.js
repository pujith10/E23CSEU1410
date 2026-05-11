import express from "express";
import cors from "cors";
import notificationRoute from "./src/route/notificationRoute.js";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/notifications", notificationRoute);

const server = app.listen(PORT, () => {
    console.log(`\n--- Backend server running stably on port ${PORT} ---\n`);
});

// Prevent Node from exiting prematurely if that's somehow happening
setInterval(() => {}, 1000000);
