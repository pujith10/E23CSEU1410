"use client";
import { useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Divider } from "@mui/material";
import { useNotifications } from "../src/hook/useNotifications.js";
import { NotificationCard } from "../src/component/NotificationCard.jsx";
import { FilterBar } from "../src/component/FilterBar.jsx";
import { axInitApi } from "../src/api/notifApi.js";

axInitApi("test-auth-token-stu1042");

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        activeFilter,
        kxLoad,
        kxMarkRead,
        kxSetFilter,
    } = useNotifications();

    useEffect(() => {
        kxLoad({ notification_type: activeFilter === "all" ? undefined : activeFilter });
    }, [activeFilter, kxLoad]);

    const displayed = notifications.filter((nf) => {
        if (activeFilter === "all") return true;
        return (nf.notification_type || nf.Type) === activeFilter;
    });

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>
                All Notifications
            </Typography>
            <FilterBar
                activeFilter={activeFilter}
                onFilterChange={kxSetFilter}
                unreadCount={unreadCount}
            />
            <Divider sx={{ mb: 2 }} />

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && displayed.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                    No notifications found.
                </Typography>
            )}
            {displayed.map((nf) => (
                <NotificationCard
                    key={nf.ID || nf.id}
                    notif={nf}
                    onMarkRead={kxMarkRead}
                />
            ))}
        </Box>
    );
}
