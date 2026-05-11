"use client";
import { Box, Slider, Typography } from "@mui/material";

export const TopNSelector = ({ topN, onChange }) => {
    return (
        <Box sx={{ px: 2, mb: 2 }}>
            <Typography gutterBottom>Show Top {topN} Priority Items</Typography>
            <Slider
                value={topN}
                onChange={(e, val) => onChange(val)}
                min={5}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
            />
        </Box>
    );
};
