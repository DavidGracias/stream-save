import React, { useState, useEffect } from 'react';
import { generateUrl } from '../App';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Help as HelpIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import type { MongoDBCredentials, FormData } from '../types';

interface ConfigureProps {
  mongoDBCred: MongoDBCredentials;
  setMongoDBCred: React.Dispatch<React.SetStateAction<MongoDBCredentials>>;
}

const Configure: React.FC<ConfigureProps> = ({ mongoDBCred, setMongoDBCred }) => {
  const [formData, setFormData] = useState<FormData>({
    user: mongoDBCred.user || '',
    pass: mongoDBCred.pass || '',
    cluster: mongoDBCred.cluster || '',
    db_url: generateUrl(mongoDBCred)
  });

  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setFormData({
      user: mongoDBCred.user || '',
      pass: mongoDBCred.pass || '',
      cluster: mongoDBCred.cluster || '',
      db_url: generateUrl(mongoDBCred)
    });
  }, [mongoDBCred]);

  const updateDbUrl = (): void => {
    const { user, pass, cluster } = formData;
    if (user && pass && cluster) {
      // setFormData(prev => ({
      //   ...prev,
      //   db_url: `mongodb+srv://${user}:${pass}@${cluster}.mongodb.net`
      // }));
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    if (field === 'user' || field === 'pass' || field === 'cluster') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      setTimeout(updateDbUrl, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save credentials to localStorage
      localStorage.setItem('MONGO_USERNAME', formData.user);
      localStorage.setItem('MONGO_PASSWORD', formData.pass);
      localStorage.setItem('MONGO_CLUSTER', formData.cluster);

      // Update the state
      setMongoDBCred({
        user: formData.user,
        pass: formData.pass,
        cluster: formData.cluster
      });

      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving credentials:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Success Alert */}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Success!</AlertTitle>
          MongoDB credentials have been saved successfully.
        </Alert>
      )}

      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Box sx={{ mb: 2 }}>
          <CloudIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
        <Typography
          variant="h3"
          component="h1"
          color="primary"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          MongoDB Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Configure your MongoDB connection for Stream Save
        </Typography>
      </Box>

      {/* Form Content */}
      <Card elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
        border: '1px solid #2d2d2d',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SecurityIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Enter MongoDB Credentials
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  placeholder="Your MongoDB username"
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#2d2d2d',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.pass}
                  onChange={(e) => handleInputChange('pass', e.target.value)}
                  placeholder="Your MongoDB Password"
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#2d2d2d',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Cluster Name"
                  value={formData.cluster}
                  onChange={(e) => handleInputChange('cluster', e.target.value)}
                  placeholder="Your cluster name"
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#2d2d2d',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 4, textAlign: 'right' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!formData.user || !formData.pass || !formData.cluster || isSubmitting}
                size="large"
                startIcon={<SettingsIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(108, 92, 231, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Credentials'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Help Button */}
      <Box textAlign="center" mt={4}>
        <Button
          variant="outlined"
          startIcon={<HelpIcon />}
          onClick={() => setShowHelp(true)}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(108, 92, 231, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Need Help?
        </Button>
      </Box>

      {/* Help Dialog */}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
            border: '1px solid #2d2d2d',
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #2d2d2d',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <HelpIcon sx={{ color: 'primary.main' }} />
          MongoDB Setup Help
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            How to get your MongoDB credentials:
          </Typography>
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="1. Go to MongoDB Atlas"
                secondary={
                  <MuiLink href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.light' }}>
                    https://cloud.mongodb.com
                  </MuiLink>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="2. Create a new cluster or use an existing one" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="3. Create a database user with read/write permissions" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="4. Get your connection string from the cluster" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="5. Extract username, Password, and cluster name" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowHelp(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Configure;
