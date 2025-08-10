import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container } from '@mui/material';
import type { ContentItem } from '../types';
import LoadingState from '../components/Manage/LoadingState';
import ErrorState from '../components/Manage/ErrorState';
import HeaderSection from '../components/Manage/ManageHeader';
import StatsCards from '../components/Manage/StatsCards';
import SearchAndFilter from '../components/Manage/SearchAndFilter';
import ContentTable from '../components/Manage/ContentTable';
import AddContentButton from '../components/Manage/AddContentButton';
import AddContentDialog from '../components/Manage/AddContentDialog';
import { useAddContentForm } from '../components/Manage/useAddContentForm';

const getDbUrl = (): string => localStorage.getItem('db_url') || '';

const calculateStats = (content: ContentItem[]) => ({
  total: content.length,
  movies: content.filter(i => i.type === 'movie').length,
  series: content.filter(i => i.type === 'series').length,
  showing: content.length,
});

const Manage: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [stats, setStats] = useState({ total: 0, movies: 0, series: 0, showing: 0 });
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { formData: addFormData, handleFormChange, resetForm } = useAddContentForm();
  const [addingContent, setAddingContent] = useState<boolean>(false);

  const fetchContent = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        setError('Database URL missing. Please configure credentials.');
        setContent([]);
        setFilteredContent([]);
        setStats({ total: 0, movies: 0, series: 0, showing: 0 });
        return;
      }
      const res = await fetch('/api/content', { headers: { 'x-db-url': dbUrl } });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      const json = await res.json() as { content?: ContentItem[] };
      const all = Array.isArray(json.content) ? json.content : [];
      setContent(all);
      setFilteredContent(all);
      setStats(calculateStats(all));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStats = (data: ContentItem[]): void => {
    setStats(calculateStats(data));
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
    if (type !== 'all') filtered = filtered.filter(item => item.type === type);
    if (term) {
      const q = term.toLowerCase();
      filtered = filtered.filter(item => (item.name || '').toLowerCase().includes(q) || (item.id || '').toLowerCase().includes(q));
    }
    setFilteredContent(filtered);
    updateStats(filtered);
  };

  const removeContent = async (id: string, type: 'movie' | 'series'): Promise<void> => {
    try {
      const dbUrl = getDbUrl();
      if (!dbUrl) return alert('Database URL missing. Configure credentials first.');
      const res = await fetch(`/api/content/${type}/${id}`, { method: 'DELETE', headers: { 'x-db-url': dbUrl } });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      await fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove content');
    }
  };

  const addContent = async (): Promise<void> => {
    try {
      setAddingContent(true);
      const dbUrl = getDbUrl();
      if (!dbUrl) return alert('Database URL missing. Configure credentials first.');
      const body = { type: addFormData.type, imdbID: addFormData.imdbId, stream: addFormData.streamLink };
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-db-url': dbUrl },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      resetForm();
      setShowAddForm(false);
      await fetchContent();
      alert('Content added successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add content');
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
  }, [fetchContent]);

  // Debug: Monitor content state changes
  useEffect(() => {
    console.log('Content state changed:', {
      contentLength: content.length,
      content: content,
      filteredContentLength: filteredContent.length,
      filteredContent: filteredContent
    });
  }, [content, filteredContent]);

  // Memoized sorted content for better performance
  const sortedContent = useMemo(() => {
    return [...filteredContent].sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [filteredContent]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <HeaderSection />
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
        filteredContent={sortedContent}
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
