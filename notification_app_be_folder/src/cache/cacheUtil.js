import { vxRedis } from "../config/storage.js";
import { zxLog } from "../middleware/logAdapter.js";

const MX_TTL = 60;

export const cxGet = async (ky) => {
    try {
        const vl = await vxRedis.get(ky);
        if (vl) {
            await zxLog("cache", "debug", `Cache hit: ${ky}`);
            return JSON.parse(vl);
        }
        await zxLog("cache", "debug", `Cache miss: ${ky}`);
        return null;
    } catch (ek) {
        await zxLog("cache", "warn", `Cache get failed for key ${ky}: ${ek.message}`);
        return null;
    }
};

export const cxSet = async (ky, vl, ttl = MX_TTL) => {
    try {
        await vxRedis.setEx(ky, ttl, JSON.stringify(vl));
        await zxLog("cache", "debug", `Cache set: ${ky} ttl=${ttl}s`);
    } catch (ek) {
        await zxLog("cache", "warn", `Cache set failed for key ${ky}: ${ek.message}`);
    }
};

export const cxDel = async (ky) => {
    try {
        await vxRedis.del(ky);
        await zxLog("cache", "debug", `Cache invalidated: ${ky}`);
    } catch (ek) {
        await zxLog("cache", "warn", `Cache delete failed for key ${ky}: ${ek.message}`);
    }
};

export const cxDelPattern = async (pat) => {
    try {
        const kys = await vxRedis.keys(pat);
        if (kys.length > 0) {
            await vxRedis.del(kys);
            await zxLog("cache", "debug", `Cache cleared ${kys.length} keys matching ${pat}`);
        }
    } catch (ek) {
        await zxLog("cache", "warn", `Cache pattern delete failed: ${ek.message}`);
    }
};
