import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Typography,
  Button
} from '@mui/material';
import {
  Star as StarIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { ContentItem } from '../../types';

interface ContentTableProps {
  content: ContentItem[];
  filteredContent: ContentItem[];
  onRemoveContent: (id: string, type: 'movie' | 'series') => void;
}

const ContentTable: React.FC<ContentTableProps> = ({
  content,
  filteredContent,
  onRemoveContent
}) => {
  if (filteredContent.length === 0) {
    return (
      <Card elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
        border: '1px solid #2d2d2d',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {content.length === 0 ? 'No content found' : 'No content matches your search'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {content.length === 0
                ? 'It looks like you haven\'t saved any content yet, or there might be an issue with your credentials.'
                : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              }
            </Typography>
            {content.length === 0 && (
              <Button
                variant="outlined"
                href="/configure"
                sx={{ borderRadius: 2 }}
                startIcon={<VisibilityIcon />}
              >
                Check Configuration
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
      border: '1px solid #2d2d2d',
      borderRadius: 3,
    }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} sx={{
          background: 'transparent',
          boxShadow: 'none',
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid #2d2d2d' }}>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>IMDB ID</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Release</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContent.map((item, index) => (
                <TableRow key={index} hover sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(108, 92, 231, 0.05)',
                  },
                  borderBottom: '1px solid #2d2d2d',
                }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.poster && (
                        <Avatar
                          src={item.poster}
                          alt={item.name}
                          sx={{ width: 40, height: 60 }}
                          variant="rounded"
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description.substring(0, 50)}...
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="code" sx={{ color: 'primary.light' }}>
                      {item.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.type}
                      color={item.type === 'movie' ? 'secondary' : 'primary'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {item.imdbRating && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {item.imdbRating}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.releaseInfo || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => onRemoveContent(item.id, item.type)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ContentTable;
