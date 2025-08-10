import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Snackbar, Alert } from '@mui/material';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { formData: addFormData, handleFormChange, resetForm } = useAddContentForm();
  const [addingContent, setAddingContent] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const showSnackbar = useCallback((msg: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const fetchContent = useCallback(async (): Promise<void> => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError('');
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        setError('Database URL missing. Please configure credentials.');
        setContent([]);
        return;
      }
      const res = await fetch('/api/content', { headers: { 'x-db-url': dbUrl }, signal: controller.signal });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      const json = await res.json() as { content?: ContentItem[] };
      setContent(Array.isArray(json.content) ? json.content : []);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((term: string): void => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((type: 'all' | 'movie' | 'series'): void => {
    setFilterType(type);
  }, []);

  const filteredContent = useMemo(() => {
    let filtered = content;
    if (filterType !== 'all') filtered = filtered.filter(item => item.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(item => (item.name || '').toLowerCase().includes(q) || (item.id || '').toLowerCase().includes(q));
    }
    return filtered;
  }, [content, searchTerm, filterType]);

  const stats = useMemo(() => calculateStats(filteredContent), [filteredContent]);

  const removeContent = useCallback(async (id: string, type: 'movie' | 'series'): Promise<void> => {
    try {
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        showSnackbar('Database URL missing. Configure credentials first.', 'warning');
        return;
      }
      const res = await fetch(`/api/content/${type}/${id}`, { method: 'DELETE', headers: { 'x-db-url': dbUrl } });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      await fetchContent();
      showSnackbar('Content removed successfully', 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to remove content', 'error');
    }
  }, [fetchContent, showSnackbar]);

  const addContent = useCallback(async (): Promise<void> => {
    try {
      setAddingContent(true);
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        showSnackbar('Database URL missing. Configure credentials first.', 'warning');
        return;
      }
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
      showSnackbar('Content added successfully!', 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to add content', 'error');
    } finally {
      setAddingContent(false);
    }
  }, [addFormData.type, addFormData.imdbId, addFormData.streamLink, fetchContent, resetForm, showSnackbar]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

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
        filteredContent={filteredContent}
        onRemoveContent={removeContent}
      />

      <AddContentDialog
        showAddForm={showAddForm}
        formData={addFormData}
        addingContent={addingContent}
        onFormChange={handleFormChange}
        onSubmit={addContent}
        onCancel={() => { resetForm(); setShowAddForm(false); }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Manage;
