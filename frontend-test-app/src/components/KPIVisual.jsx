import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function KPIVisual({ icon, label, value, subtitle, trend, trendLabel, color = 'primary' }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 6, minHeight: 140 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={trendLabel || `${Math.abs(trend)}%`}
              color={trend > 0 ? 'success' : 'error'}
              size="medium"
              variant="filled"
              sx={{ fontWeight: 'bold', fontSize: 16 }}
            />
          )}
        </Box>
        <Typography variant="h3" fontWeight={700} color={`${color}.main`} gutterBottom>
          {value}
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 