"use client";
import { Box, ToggleButton, ToggleButtonGroup, Badge } from "@mui/material";

export const FilterBar = ({ activeFilter, onFilterChange, unreadCount }) => {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <ToggleButtonGroup
                value={activeFilter}
                exclusive
                onChange={(e, val) => { if (val) onFilterChange(val); }}
                size="small"
            >
                <ToggleButton value="all">
                    <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { right: -10, top: 0 } }}>
                        All
                    </Badge>
                </ToggleButton>
                <ToggleButton value="Placement">Placement</ToggleButton>
                <ToggleButton value="Result">Result</ToggleButton>
                <ToggleButton value="Event">Event</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};
