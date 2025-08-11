import React from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import AddContentForm from './AddContentForm';

interface AddFormData {
  type: 'movie' | 'series';
  imdbId: string;
  streamLink: string;
  title: string;
  description: string;
  poster: string;
}

interface AddContentDialogProps {
  showAddForm: boolean;
  formData: AddFormData;
  addingContent: boolean;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  profiles: string[];
  modalProfile: string;
  setModalProfile: React.Dispatch<React.SetStateAction<string>>;
  setProfiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({
  showAddForm,
  formData,
  addingContent,
  onFormChange,
  onSubmit,
  onCancel,
  profiles,
  modalProfile,
  setModalProfile,
  setProfiles,
}) => {
  if (!showAddForm) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={onCancel}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
          border: '1px solid #2d2d2d',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Add Saved Stream Link
            </Typography>
            <IconButton
              onClick={onCancel}
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <AddContentForm
            formData={formData}
            addingContent={addingContent}
            onFormChange={onFormChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
            profiles={profiles}
            modalProfile={modalProfile}
            setModalProfile={setModalProfile}
            setProfiles={setProfiles}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddContentDialog;
