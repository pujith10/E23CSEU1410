"use client";
import { useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Divider } from "@mui/material";
import { useNotifications } from "../../src/hook/useNotifications.js";
import { NotificationCard } from "../../src/component/NotificationCard.jsx";
import { TopNSelector } from "../../src/component/TopNSelector.jsx";

export default function PriorityPage() {
    const {
        priorityNotifs,
        loading,
        error,
        topN,
        kxLoadPriority,
        kxMarkRead,
        kxSetTopN,
    } = useNotifications();

    useEffect(() => {
        kxLoadPriority(topN);
    }, [topN, kxLoadPriority]);

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>
                Priority Inbox
            </Typography>
            <TopNSelector topN={topN} onChange={kxSetTopN} />
            <Divider sx={{ mb: 2 }} />

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress color="secondary" />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (!priorityNotifs || priorityNotifs.length === 0) && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                    No unread notifications in priority inbox.
                </Typography>
            )}
            {priorityNotifs && priorityNotifs.map((nf) => (
                <NotificationCard
                    key={nf.ID || nf.id}
                    notif={nf}
                    onMarkRead={kxMarkRead}
                />
            ))}
        </Box>
    );
}
