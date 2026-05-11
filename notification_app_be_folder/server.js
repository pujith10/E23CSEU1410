import express from "express";
import cors from "cors";
import "dotenv/config";
import { nxConnect } from "./src/config/storage.js";
import { hxRunMigrations } from "./src/db/migrate.js";
import notificationRoute from "./src/route/notificationRoute.js";
import { zxLog } from "./src/middleware/logAdapter.js";

const ax = express();
const PORT = process.env.PORT || 5000;

ax.use(cors({ origin: "http://localhost:3000", credentials: true }));
ax.use(express.json());

ax.use("/api/notifications", notificationRoute);

const exNotFound = (req, res, next) => {
    res.status(404).json({ error: "Not found" });
};

const exErrorMiddleware = (err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
};

ax.use(exNotFound);
ax.use(exErrorMiddleware);

const gxBoot = async () => {
    try {
        await nxConnect();
        await zxLog("config", "info", "Redis connected");
        await hxRunMigrations();
        ax.listen(PORT, () => {
            zxLog("config", "info", `Backend server running on port ${PORT}`);
        });
    } catch (ek) {
        await zxLog("config", "fatal", `Server boot failure: ${ek.message}`);
        process.exit(1);
    }
};

gxBoot();
