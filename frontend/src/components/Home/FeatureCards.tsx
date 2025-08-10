import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Storage as StorageIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const FeatureCards: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={{
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
          border: '1px solid #2d2d2d',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
          },
          transition: 'all 0.3s ease',
        }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <StorageIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
            </Box>
            <Typography variant="h6" color="secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
              Manage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily use page for adding and removing stream links for movies and series.
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Card elevation={0} sx={{
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
          border: '1px solid #2d2d2d',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
          },
          transition: 'all 0.3s ease',
        }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <DashboardIcon sx={{ fontSize: 48, color: '#00BFAE' }} />
            </Box>
            <Typography variant="h6" color="#00BFAE" gutterBottom sx={{ fontWeight: 'bold' }}>
              Configure
            </Typography>
            <Typography variant="body2" color="text.secondary">
              One-time setup for MongoDB connection. Required before adding content.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FeatureCards;
