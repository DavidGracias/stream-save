import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { generateUrl } from '../utils';
import {
  ManageHeader,
  StatsCards,
  SearchAndFilter,
  AddContentButton,
  ContentTable,
  LoadingState,
  ErrorState,
  AddContentDialog,
  useAddContentForm
} from '../components/Manage';
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
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { formData: addFormData, setFormData: setAddFormData, handleFormChange, resetForm } = useAddContentForm();
  const [addingContent, setAddingContent] = useState<boolean>(false);

  const fetchContent = async (): Promise<void> => {
    try {
      // Validate MongoDB credentials
      if (!mongoDBCred.user || !mongoDBCred.pass || !mongoDBCred.cluster) {
        setError('MongoDB credentials are not properly configured. Please check your configuration.');
        setLoading(false);
        return;
      }

      // Use the proper URL from the backend instead of hardcoded localhost
      const baseUrl = window.location.origin;

      console.log('Fetching content with:', { baseUrl, mongoDBCred });

      // First, check if the backend is accessible
      try {
        const healthCheck = await fetch(`${baseUrl}/manifest.json`);
        if (!healthCheck.ok) {
          throw new Error(`Backend server not responding: ${healthCheck.status}`);
        }
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        setError('Backend server is not accessible. Please ensure the server is running.');
        setLoading(false);
        return;
      }

      // Use the new catalog endpoint that returns all content
      const response = await fetch(`${baseUrl}/catalog`);

      if (response.ok) {
        const data = await response.json();
        if (data.content && Array.isArray(data.content)) {
          const allContent = data.content;
          setContent(allContent);
          setFilteredContent(allContent);
          updateStats(allContent);
          setError(''); // Clear any previous errors
        } else {
          // No content found, but this isn't necessarily an error
          setContent([]);
          setFilteredContent([]);
          setStats({ total: 0, movies: 0, series: 0, showing: 0 });
          setError(''); // Clear any previous errors
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch content:', response.status, errorData);
        setError(`Failed to fetch content: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch content error:', err);
      setError(`Failed to load content: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your connection and credentials.`);
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
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/manage`, {
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
        await fetchContent();
      } else {
        const errorText = await response.text();
        console.error('Remove content error:', response.status, errorText);
        alert(`Failed to remove content: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error removing content:', err);
      alert(`Error removing content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const addContent = async (): Promise<void> => {
    try {
      setAddingContent(true);
      const baseUrl = window.location.origin;

      // Debug: Log what we're sending
      const requestBody = {
        option: 'add',
        type: addFormData.type,
        imdbID: addFormData.imdbId,
        stream: addFormData.streamLink,
        db_url: generateUrl(mongoDBCred)
      };

      console.log('Sending request to:', `${baseUrl}/manage`);
      console.log('Request body:', requestBody);
      console.log('MongoDB credentials:', mongoDBCred);

      // First check if backend is accessible
      try {
        const healthCheck = await fetch(`${baseUrl}/manifest.json`);
        if (!healthCheck.ok) {
          throw new Error(`Backend not accessible: ${healthCheck.status}`);
        }
        console.log('Backend health check passed');
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error('Backend server is not accessible. Please ensure the server is running.');
      }

      const response = await fetch(`${baseUrl}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody)
      });

      if (response.ok) {
        // Reset form and refresh content
        resetForm();
        setShowAddForm(false);
        await fetchContent();
        alert('Content added successfully!');
      } else {
        const errorText = await response.text();
        console.error('Add content error:', response.status, errorText);
        alert(`Failed to add content: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error adding content:', err);
      alert(`Error adding content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddingContent(false);
    }
  };

  const resetAddForm = (): void => {
    resetForm();
    setShowAddForm(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ManageHeader />
      <StatsCards stats={stats} />

      <SearchAndFilter
        searchTerm={searchTerm}
        filterType={filterType}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />

      <AddContentButton onClick={() => setShowAddForm(true)} />

      <ContentTable
        content={content}
        filteredContent={filteredContent}
        onRemoveContent={removeContent}
      />

      <AddContentDialog
        showAddForm={showAddForm}
        formData={addFormData}
        addingContent={addingContent}
        onFormChange={handleFormChange}
        onSubmit={addContent}
        onCancel={resetAddForm}
      />
    </Container>
  );
};

export default Manage;
