import { l, s } from "../../../logging_middleware/index.js";
import "dotenv/config";

s(process.env.AUTH_TOKEN || "");

export const zxLog = async (pkg, lvl, msg) => {
    await l("backend", lvl, pkg, msg);
};
