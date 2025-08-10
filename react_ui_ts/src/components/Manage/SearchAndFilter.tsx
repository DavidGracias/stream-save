import React from 'react';
import { Box, TextField, ButtonGroup, Button, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchAndFilterProps {
  searchTerm: string;
  filterType: 'all' | 'movie' | 'series';
  onSearch: (term: string) => void;
  onFilter: (type: 'all' | 'movie' | 'series') => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  filterType,
  onSearch,
  onFilter
}) => {
  const textFieldStyle = {
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
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          placeholder="Search by title or IMDB ID..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
          sx={textFieldStyle}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <ButtonGroup fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
          <Button
            variant={filterType === 'all' ? 'contained' : 'outlined'}
            onClick={() => onFilter('all')}
            sx={{ borderRadius: 2 }}
          >
            All
          </Button>
          <Button
            variant={filterType === 'movie' ? 'contained' : 'outlined'}
            onClick={() => onFilter('movie')}
            sx={{ borderRadius: 2 }}
          >
            Movies
          </Button>
          <Button
            variant={filterType === 'series' ? 'contained' : 'outlined'}
            onClick={() => onFilter('series')}
            sx={{ borderRadius: 2 }}
          >
            Series
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default SearchAndFilter;
