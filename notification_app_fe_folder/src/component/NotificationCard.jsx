"use client";
import { Card, CardContent, Typography, Chip, IconButton, Box } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

const YX_CHIP_COLOR = { Placement: "success", Result: "warning", Event: "info" };

export const NotificationCard = ({ notif, onMarkRead }) => {
    const isRead = notif.is_read || notif.IsRead;
    const nType = notif.notification_type || notif.Type;
    const msg = notif.message || notif.Message;
    const ts = notif.created_at || notif.Timestamp;

    return (
        <Card
            elevation={isRead ? 0 : 3}
            sx={{
                mb: 1.5,
                opacity: isRead ? 0.65 : 1,
                borderLeft: isRead ? "4px solid transparent" : "4px solid #1976d2",
                transition: "all 0.2s ease",
            }}
        >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip
                            label={nType}
                            color={YX_CHIP_COLOR[nType] || "default"}
                            size="small"
                            variant="filled"
                        />
                        {!isRead && (
                            <Chip label="New" size="small" color="primary" variant="outlined" />
                        )}
                    </Box>
                    <Typography variant="body1" fontWeight={isRead ? 400 : 600}>
                        {msg}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(ts).toLocaleString()}
                    </Typography>
                </Box>
                {!isRead && (
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onMarkRead(notif.ID || notif.id)}
                        title="Mark as read"
                    >
                        <DoneIcon fontSize="small" />
                    </IconButton>
                )}
            </CardContent>
        </Card>
    );
};
