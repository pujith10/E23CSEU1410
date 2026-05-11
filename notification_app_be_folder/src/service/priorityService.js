import { zxLog } from "../middleware/logAdapter.js";

const JX_TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };
const JX_DECAY_RATE = 0.00001;

export const jxComputePriority = async (notificationType, createdAt, allNotifs) => {
    const typeWt = JX_TYPE_WEIGHT[notificationType] || 1;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    const recency = Math.exp(-JX_DECAY_RATE * ageMs);

    const score = typeWt * recency;

    await zxLog(
        "service",
        "debug",
        `Priority computed: type=${notificationType} typeWt=${typeWt} recency=${recency.toFixed(4)} score=${score.toFixed(4)}`
    );

    return parseFloat(score.toFixed(6));
};

export const jxGetTopN = (notifs, topN) => {
    const nk = Number(topN) || 10;

    const scored = notifs
        .filter((nf) => !nf.is_read)
        .map((nf) => {
            const typeWt = JX_TYPE_WEIGHT[nf.notification_type] || 1;
            const ageMs = Date.now() - new Date(nf.created_at || nf.Timestamp).getTime();
            const recency = Math.exp(-JX_DECAY_RATE * ageMs);
            return { ...nf, _computed: typeWt * recency };
        });

    scored.sort((ak, bk) => bk._computed - ak._computed);
    return scored.slice(0, nk);
};

export const jxUpdateTopN = (existing, incoming, topN) => {
    const nk = Number(topN) || 10;
    const merged = [...existing, incoming];
    return jxGetTopN(merged, nk);
};
