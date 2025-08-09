import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { MongoDBCredentials } from '../types';

interface HomeProps {
  mongoDBCred: MongoDBCredentials;
  setMongoDBCred: React.Dispatch<React.SetStateAction<MongoDBCredentials>>;
}

const Home: React.FC<HomeProps> = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          color="primary"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Stream Save
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
          Save and manage your custom stream links for movies and series in Stremio
        </Typography>
      </Box>

      {/* Main Actions */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 6, justifyContent: 'center' }}>
        <Box sx={{ flex: { xs: '1', md: '0 1 300px' } }}>
          <Button
            component={Link}
            to="/manage"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<EditIcon />}
            sx={{
              py: 3,
              fontSize: '1.1rem',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(108, 92, 231, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Manage Content
          </Button>
        </Box>
        <Box sx={{ flex: { xs: '1', md: '0 1 300px' } }}>
          <Button
            component={Link}
            to="/configure"
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            startIcon={<SettingsIcon />}
            sx={{
              py: 3,
              fontSize: '1.1rem',
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(108, 92, 231, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            First Time Setup
          </Button>
        </Box>
      </Box>

      {/* Page Descriptions */}
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
                <DashboardIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                Configure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                One-time setup for MongoDB connection. Required before adding content.
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
                <VisibilityIcon sx={{ fontSize: 48, color: 'primary.light' }} />
              </Box>
              <Typography variant="h6" color="primary.light" gutterBottom sx={{ fontWeight: 'bold' }}>
                View
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and search all your saved content with detailed information.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
