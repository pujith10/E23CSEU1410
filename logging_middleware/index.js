let t = "";

export const s = (a) => {
    t = a;
};

export const l = async (q, w, e, r) => {
    if (!t) {
        console.error("Logger Warning: initLogger(token) must be called before logging.");
        return;
    }

    const u = "http://4.224.186.213/evaluation-service/logs ";

    const p = {
        stack: q.toLowerCase(),
        level: w.toLowerCase(),
        package: e.toLowerCase(),
        message: r
    };

    try {
        const x = await fetch(u, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${t}`
            },
            body: JSON.stringify(p)
        });

        if (!x.ok) {
            const y = await x.text();
            console.error(`Failed to send log [Status: ${x.status}]:`, y);
        } else {
            console.log(`[${w.toUpperCase()}] ${e}: ${r}`);
        }
    } catch (z) {
        console.error("Network error while sending log to test server:", z);
    }
};