import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Storage as StorageIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { Stats } from '../../types';

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cardStyle = {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
    border: '1px solid #2d2d2d',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
    },
    transition: 'all 0.3s ease',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={cardStyle}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }} gutterBottom>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={cardStyle}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <MovieIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }} gutterBottom>
              {stats.movies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Movies
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={cardStyle}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <TvIcon sx={{ fontSize: 40, color: 'primary.light', mb: 1 }} />
            <Typography variant="h4" color="primary.light" gutterBottom sx={{ fontWeight: 'bold' }}>
              {stats.series}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Series
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={cardStyle}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <VisibilityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              {stats.showing}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StatsCards;
