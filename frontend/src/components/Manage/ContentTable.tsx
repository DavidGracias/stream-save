import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import type { ContentItem } from '../../types';

interface ContentTableProps {
  content: ContentItem[];
  filteredContent: ContentItem[];
  onRemoveContent: (id: string, type: 'movie' | 'series') => Promise<void>;
  onEditContent: (item: ContentItem) => void;
}

const ContentTable: React.FC<ContentTableProps> = React.memo(({ filteredContent, onRemoveContent, onEditContent }) => {
  // Memoize sorted content to avoid unnecessary re-sorting
  const sortedContent = useMemo(() => {
    return [...filteredContent].sort((a, b) => {
      // Sort by type first, then by name
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [filteredContent]);

  // Memoize content type counts
  const contentStats = useMemo(() => {
    const movies = filteredContent.filter(item => item.type === 'movie').length;
    const series = filteredContent.filter(item => item.type === 'series').length;
    return { movies, series, total: filteredContent.length };
  }, [filteredContent]);

  if (filteredContent.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No content found. Add some movies or series to get started!</p>
        <p><small>Movies: {contentStats.movies} | Series: {contentStats.series}</small></p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Chip
          label={`Movies: ${contentStats.movies}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Series: ${contentStats.series}`}
          color="secondary"
          variant="outlined"
        />
        <Chip
          label={`Total: ${contentStats.total}`}
          color="default"
          variant="outlined"
        />
      </div>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedContent.map((item) => (
              <TableRow key={`${item.type}-${item.id}`} hover>
                <TableCell>
                  <Chip
                    label={item.type}
                    color={item.type === 'movie' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}...`
                          : item.description
                        }
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.releaseInfo || 'N/A'}</TableCell>
                <TableCell>{item.imdbRating || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEditContent(item)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      onClick={() => onRemoveContent(item.id, item.type)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});

ContentTable.displayName = 'ContentTable';

export default ContentTable;
