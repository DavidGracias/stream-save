import React, { useCallback } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  type SelectChangeEvent
} from '@mui/material';


interface SearchAndFilterProps {
  searchTerm: string;
  filterType: 'all' | 'movie' | 'series';
  onSearch: (value: string) => void;
  onFilter: (type: 'all' | 'movie' | 'series') => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = React.memo(({
  searchTerm,
  filterType,
  onSearch,
  onFilter
}) => {
  // Available content types
  const availableTypes = ['movie', 'series'];

  // Memoize change handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  }, [onSearch]);

  const handleTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    onFilter(event.target.value as 'all' | 'movie' | 'series');
  }, [onFilter]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search content..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 250, flexGrow: 1 }}
          placeholder="Search by title, description, or ID..."
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={handleTypeChange}
            input={<OutlinedInput label="Type" />}
          >
            <MenuItem value="all">All Types</MenuItem>
            {availableTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Results summary */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {searchTerm && (
          <Chip
            label={`Search: "${searchTerm}"`}
            color="secondary"
            variant="outlined"
            size="small"
            onDelete={() => onSearch('')}
          />
        )}

        {filterType && filterType !== 'all' && (
          <Chip
            label={`Type: ${filterType}`}
            color="info"
            variant="outlined"
            size="small"
            onDelete={() => onFilter('all')}
          />
        )}
      </Box>
    </Box>
  );
});

SearchAndFilter.displayName = 'SearchAndFilter';

export default SearchAndFilter;
