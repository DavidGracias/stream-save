import React from 'react';
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface AddFormData {
  type: 'movie' | 'series';
  imdbId: string;
  streamLink: string;
  title: string;
  description: string;
  poster: string;
}

interface AddContentFormProps {
  formData: AddFormData;
  addingContent: boolean;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({
  formData,
  addingContent,
  onFormChange,
  onSubmit,
  onCancel
}) => {
  const formFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#2d2d2d' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiFormHelperText-root': {
      color: 'text.secondary',
      fontSize: '0.75rem',
    },
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      {/* Required Fields Section */}
      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
        Required Information
      </Typography>

      {/* Help Box - Important Notes */}
      <Box sx={{
        p: 2,
        mb: 3,
        bgcolor: 'rgba(25, 118, 210, 0.1)',
        borderRadius: 2,
        border: '1px solid rgba(25, 118, 210, 0.2)'
      }}>
        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon sx={{ fontSize: 20 }} />
          Important Notes:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Stream links can be magnet links, direct URLs, or YouTube links
          </Typography>
          {formData.type === 'movie' && (
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              For movies, use the IMDB ID (e.g., <code style={{ color: 'primary.light', fontFamily: 'monospace' }}>tt0468569</code> for The Dark Knight)
            </Typography>
          )}
          {formData.type === 'series' && (
            <>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                For entire series, use the IMDB ID (e.g., <code style={{ color: 'primary.light', fontFamily: 'monospace' }}>tt0944947</code> for Game of Thrones)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                For single episodes, use format: <code style={{ color: 'primary.light', fontFamily: 'monospace' }}>imdbid:season:episode</code> (e.g., <code style={{ color: 'primary.light', fontFamily: 'monospace' }}>tt0944947:1:8</code> for GoT S1E8)
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          fullWidth
          label="Content Type"
          value={formData.type}
          onChange={(e) => onFormChange('type', e.target.value)}
          sx={formFieldStyle}
        >
          <MenuItem value="movie">Movie</MenuItem>
          <MenuItem value="series">Series</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="IMDB ID *"
          value={formData.imdbId}
          onChange={(e) => onFormChange('imdbId', e.target.value)}
          placeholder="tt1234567 or paste IMDb URL"
          helperText="Enter the IMDB ID (e.g., tt1234567) or paste an IMDb URL to auto-extract the ID"
          sx={formFieldStyle}
        />
      </Box>

      <TextField
        fullWidth
        label="Stream Link *"
        value={formData.streamLink}
        onChange={(e) => onFormChange('streamLink', e.target.value)}
        placeholder="magnet:?xt=urn:btih:... or http://..."
        multiline
        rows={3}
        helperText="Enter the magnet link, torrent file, or direct stream URL"
        sx={{ mb: 3, ...formFieldStyle }}
      />

      {/* Example Box - Supported Formats */}
      <Box sx={{
        p: 2,
        mb: 4,
        bgcolor: 'rgba(0, 191, 174, 0.1)',
        borderRadius: 2,
        border: '1px solid rgba(0, 191, 174, 0.2)'
      }}>
        <Typography variant="subtitle2" sx={{ color: '#00BFAE', fontWeight: 'bold', mb: 1 }}>
          Supported Stream Link Formats:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            • <strong>Magnet links:</strong> <code style={{ color: '#00BFAE', fontFamily: 'monospace' }}>magnet:?xt=urn:btih:...</code>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Direct URLs:</strong> <code style={{ color: '#00BFAE', fontFamily: 'monospace' }}>https://example.com/video.mp4</code>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>YouTube:</strong> <code style={{ color: '#00BFAE', fontFamily: 'monospace' }}>https://youtube.com/watch?v=...</code>
          </Typography>
        </Box>
      </Box>

      {/* Optional Fields Section - Collapsible Accordion */}
      <Accordion
        elevation={0}
        sx={{
          background: 'transparent',
          border: '1px solid #2d2d2d',
          borderRadius: 2,
          mb: 4,
          '&:before': { display: 'none' },
          '& .MuiAccordionSummary-root': {
            backgroundColor: 'rgba(108, 92, 231, 0.05)',
            borderRadius: '8px 8px 0 0',
          },
          '& .MuiAccordionDetails-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 8px 8px',
            pt: 3,
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
          sx={{
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 1,
            }
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            Optional Overrides
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            (Advanced configuration)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontStyle: 'italic' }}>
            These fields will override the data fetched from IMDB if provided
          </Typography>

          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="Enter custom title (optional)"
            helperText="Leave empty to use IMDB title"
            sx={{ mb: 3, ...formFieldStyle }}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Enter custom description (optional)"
            helperText="Leave empty to use IMDB description"
            multiline
            rows={2}
            sx={{ mb: 3, ...formFieldStyle }}
          />

          <TextField
            fullWidth
            label="Poster URL"
            value={formData.poster}
            onChange={(e) => onFormChange('poster', e.target.value)}
            placeholder="http://example.com/poster.jpg"
            helperText="Enter custom poster image URL (optional)"
            sx={{ mb: 3, ...formFieldStyle }}
          />
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={addingContent}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!formData.imdbId || !formData.streamLink || addingContent}
          startIcon={addingContent ? <CircularProgress size={16} /> : <AddIcon />}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2E7D32 30%, #388E3C 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {addingContent ? 'Adding...' : 'Add Content'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddContentForm;
