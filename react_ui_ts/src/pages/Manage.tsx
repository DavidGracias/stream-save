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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  InputAdornment,
  ButtonGroup,
  CircularProgress,
  Alert,
  AlertTitle,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import type { MongoDBCredentials, ContentItem, Stats } from '../types';

interface ManageProps {
  mongoDBCred: MongoDBCredentials;
  setMongoDBCred: React.Dispatch<React.SetStateAction<MongoDBCredentials>>;
}

const Manage: React.FC<ManageProps> = ({ mongoDBCred }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    movies: 0,
    series: 0,
    showing: 0
  });

  const fetchContent = async (): Promise<void> => {
    try {
      const baseUrl = 'http://127.0.0.1:5000';
      const types: ('movie' | 'series')[] = ["movie", "series"];

      const deferredResponses: Response[] = [];
      for (const type of types) {
        deferredResponses.push(
          await fetch(`${baseUrl}/${mongoDBCred.user}/${mongoDBCred.pass}/${mongoDBCred.cluster}/catalog/${type}/streams_saved.json`)
        );
      }

      const allContent: ContentItem[] = [];
      for (let i = 0; i < types.length; ++i) {
        const response = await deferredResponses[i].json();
        const items = (response.metas || []).map((item: any) => ({ ...item, type: types[i] }));
        allContent.push(...items);
      }

      setContent(allContent);
      setFilteredContent(allContent);
      updateStats(allContent);
      setLoading(false);
    } catch (err) {
      setError('Failed to load content. Please check your connection.');
      setLoading(false);
    }
  };

  const updateStats = (data: ContentItem[]): void => {
    const movies = data.filter(item => item.type === 'movie').length;
    const series = data.filter(item => item.type === 'series').length;

    setStats({
      total: data.length,
      movies,
      series,
      showing: filteredContent.length
    });
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    filterContent(term, filterType);
  };

  const handleFilter = (type: 'all' | 'movie' | 'series'): void => {
    setFilterType(type);
    filterContent(searchTerm, type);
  };

  const filterContent = (term: string, type: 'all' | 'movie' | 'series'): void => {
    let filtered = content;

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(item => item.type === type);
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term.toLowerCase()) ||
        item.id?.toLowerCase().includes(term.toLowerCase())
      );
    }

    setFilteredContent(filtered);
    updateStats(filtered);
  };

  const removeContent = async (id: string, type: 'movie' | 'series'): Promise<void> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          remove_option: 'remove',
          remove_type: type,
          remove_db_url: generateUrl(mongoDBCred),
          remove_imdbID: id
        })
      });

      if (response.ok) {
        // Refresh content after removal
        fetchContent();
      } else {
        alert('Failed to remove content');
      }
    } catch (err) {
      alert('Error removing content');
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading your content...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
          border: '1px solid #2d2d2d',
        }}>
          <AlertTitle>Configuration Required</AlertTitle>
          {error}
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" href="/configure" sx={{ borderRadius: 2 }}>
              Go to Setup
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VisibilityIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Typography variant="h3" component="h1" color="primary" gutterBottom sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            View Content
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Browse and manage your saved stream links
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card elevation={0} sx={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
            border: '1px solid #2d2d2d',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card elevation={0} sx={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
            border: '1px solid #2d2d2d',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <MovieIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.movies}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Movies
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card elevation={0} sx={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
            border: '1px solid #2d2d2d',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}>
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
          <Card elevation={0} sx={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
            border: '1px solid #2d2d2d',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(108, 92, 231, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}>
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

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search by title or IMDB ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
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
          <ButtonGroup fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
            <Button
              variant={filterType === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleFilter('all')}
              sx={{ borderRadius: 2 }}
            >
              All
            </Button>
            <Button
              variant={filterType === 'movie' ? 'contained' : 'outlined'}
              onClick={() => handleFilter('movie')}
              sx={{ borderRadius: 2 }}
            >
              Movies
            </Button>
            <Button
              variant={filterType === 'series' ? 'contained' : 'outlined'}
              onClick={() => handleFilter('series')}
              sx={{ borderRadius: 2 }}
            >
              Series
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Content Table */}
      <Card elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
        border: '1px solid #2d2d2d',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 0 }}>
          {filteredContent.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No content found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          ) : (
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
                          onClick={() => removeContent(item.id, item.type)}
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
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Manage;
