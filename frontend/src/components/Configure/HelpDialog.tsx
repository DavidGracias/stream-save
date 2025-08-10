import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Box,
  Divider,
} from '@mui/material';
import {
  Help as HelpIcon,
} from '@mui/icons-material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <List sx={{ '& .MuiListItem-root': { py: 0.5 } }}>
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
            <ListItemText primary="5. Use either the connection string or enter credentials separately" />
          </ListItem>
        </List>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            ⚠️ Important Note:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The installation link is needed to add this addon to Stremio. <strong>Even if you update your credentials, you must re-copy the link and save that new one to Stremio.</strong>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Input Options:
        </Typography>
        <List>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Individual Fields"
              secondary="Enter username, password, and cluster name separately. The connection URL will be generated automatically. Each field is color-coded to match the URL parts."
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Connection URL"
              secondary="Paste your full MongoDB connection string. The individual fields will be parsed automatically. The URL is color-coded to show which parts correspond to each field."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
