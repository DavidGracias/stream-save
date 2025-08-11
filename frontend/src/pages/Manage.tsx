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
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Stack, Typography, Box } from '@mui/material';

const getDbUrl = (): string => localStorage.getItem('db_url') || '';
const getOwner = (fallback?: string): string => localStorage.getItem('profile') || localStorage.getItem('owner') || fallback || '';

const calculateStats = (content: ContentItem[]) => ({
  total: content.length,
  movies: content.filter(i => i.type === 'movie').length,
  series: content.filter(i => i.type === 'series').length,
  showing: content.length,
});

type ManageProps = { profile: string; profiles: string[]; setProfiles: React.Dispatch<React.SetStateAction<string[]>> };

const Manage: React.FC<ManageProps> = ({ profile, profiles, setProfiles }) => {
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
  const [modalProfile, setModalProfile] = useState<string>(profile);

  // Edit state
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editStream, setEditStream] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPoster, setEditPoster] = useState<string>('');
  const [editReleaseInfo, setEditReleaseInfo] = useState<string>('');
  const [editImdbRating, setEditImdbRating] = useState<string>('');
  const [editSaving, setEditSaving] = useState<boolean>(false);

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
  } as const;

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
      const res = await fetch('/api/content', { headers: { 'x-db-url': dbUrl, 'x-owner': getOwner(profile) }, signal: controller.signal });
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
  }, [profile]);

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
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(q)
        || (item.id || '').toLowerCase().includes(q)
        || (item.owner || '').toLowerCase().includes(q)
      );
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
      const res = await fetch(`/api/content/${type}/${id}`, { method: 'DELETE', headers: { 'x-db-url': dbUrl, 'x-owner': getOwner(profile) } });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      await fetchContent();
      showSnackbar('Content removed successfully', 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to remove content', 'error');
    }
  }, [fetchContent, showSnackbar, profile]);

  const openEdit = useCallback(async (item: ContentItem) => {
    try {
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        showSnackbar('Database URL missing. Configure credentials first.', 'warning');
        return;
      }
      setEditItem(item);
      // Prefill from table row immediately
      setEditName(item.name || '');
      setEditDescription(item.description || '');
      setEditPoster(item.poster || '');
      setEditReleaseInfo((item.releaseInfo as any) || '');
      setEditImdbRating(item.imdbRating === null || item.imdbRating === undefined ? '' : String(item.imdbRating));
      setEditStream('');
      setEditOpen(true);
      // Prefetch current stream for movies
      if (item.type === 'movie') {
        const res = await fetch(`/api/content/${item.type}/${item.id}`, { headers: { 'x-db-url': dbUrl, 'x-owner': getOwner(profile) } });
        if (res.ok) {
          const j = await res.json() as { stream?: string; item?: ContentItem };
          setEditStream(j.stream || '');
          if (j.item) {
            setEditName(j.item.name || '');
            setEditDescription(j.item.description || '');
            setEditPoster(j.item.poster || '');
            setEditReleaseInfo(j.item.releaseInfo || '');
            setEditImdbRating(j.item.imdbRating === null || j.item.imdbRating === undefined ? '' : String(j.item.imdbRating));
          }
        }
      }
      if (item.type === 'series') {
        const res = await fetch(`/api/content/${item.type}/${item.id}`, { headers: { 'x-db-url': dbUrl, 'x-owner': getOwner(profile) } });
        if (res.ok) {
          const j = await res.json() as { item?: ContentItem };
          if (j.item) {
            setEditName(j.item.name || '');
            setEditDescription(j.item.description || '');
            setEditPoster(j.item.poster || '');
            setEditReleaseInfo(j.item.releaseInfo || '');
            setEditImdbRating(j.item.imdbRating === null || j.item.imdbRating === undefined ? '' : String(j.item.imdbRating));
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [showSnackbar, profile]);

  const saveEdit = useCallback(async () => {
    if (!editItem) return;
    try {
      setEditSaving(true);
      const dbUrl = getDbUrl();
      if (!dbUrl) {
        showSnackbar('Database URL missing. Configure credentials first.', 'warning');
        return;
      }
      const ratingStr = typeof editImdbRating === 'string' ? editImdbRating : String(editImdbRating);
      const numericRating = ratingStr.trim() === '' ? null : (isNaN(parseFloat(ratingStr)) ? ratingStr : parseFloat(ratingStr));
      const payload: any = {
        name: editName,
        description: editDescription,
        poster: editPoster,
        releaseInfo: editReleaseInfo,
        imdbRating: numericRating,
      };
      if (editItem.type === 'movie') payload.stream = editStream;
      const res = await fetch(`/api/content/${editItem.type}/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-db-url': dbUrl, 'x-owner': getOwner(profile) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status}: ${t}`);
      }
      await fetchContent();
      setEditOpen(false);
      setEditItem(null);
      setEditStream('');
      setEditName('');
      setEditDescription('');
      setEditPoster('');
      setEditReleaseInfo('');
      setEditImdbRating('');
      showSnackbar('Changes saved', 'success');
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : 'Failed to save changes', 'error');
    } finally {
      setEditSaving(false);
    }
  }, [editItem, editStream, fetchContent, showSnackbar, editName, editDescription, editPoster, editReleaseInfo, editImdbRating, profile]);

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
        headers: { 'Content-Type': 'application/json', 'x-db-url': dbUrl, 'x-owner': getOwner(modalProfile || profile) },
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
  }, [addFormData.type, addFormData.imdbId, addFormData.streamLink, fetchContent, resetForm, showSnackbar, profile, modalProfile]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, profile]);

  useEffect(() => { setModalProfile(profile); }, [profile]);

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
        profile={profile}
        onRemoveContent={removeContent}
        onEditContent={openEdit}
      />

      <AddContentDialog
        showAddForm={showAddForm}
        formData={addFormData}
        addingContent={addingContent}
        onFormChange={handleFormChange}
        onSubmit={addContent}
        onCancel={() => { resetForm(); setShowAddForm(false); }}
        profiles={profiles}
        modalProfile={modalProfile}
        setModalProfile={setModalProfile}
        setProfiles={setProfiles}
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

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)', border: '1px solid #2d2d2d' } }}
      >
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>Edit Content</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 1.5, border: '1px dashed #2d2d2d', borderRadius: 1, bgcolor: 'rgba(108, 92, 231, 0.05)' }}>
              <Typography variant="body2" color="text.secondary">
                Note: The first two fields are not editable.
              </Typography>
            </Box>
            <TextField label="Type" value={editItem?.type || ''} InputProps={{ readOnly: true }} fullWidth sx={formFieldStyle} helperText="Not editable" />
            <TextField label="IMDb ID" value={editItem?.id || ''} InputProps={{ readOnly: true }} fullWidth sx={formFieldStyle} helperText="Not editable" />
            <TextField label="Title" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth sx={formFieldStyle} />
            <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth multiline minRows={3} sx={formFieldStyle} />
            <TextField label="Poster URL" value={editPoster} onChange={(e) => setEditPoster(e.target.value)} fullWidth sx={formFieldStyle} />
            <Stack direction="row" spacing={2}>
              <TextField label="Release Info" value={editReleaseInfo} onChange={(e) => setEditReleaseInfo(e.target.value)} fullWidth sx={formFieldStyle} />
              <TextField label="IMDb Rating" value={editImdbRating} onChange={(e) => setEditImdbRating(e.target.value)} fullWidth sx={formFieldStyle} />
            </Stack>
            {editItem?.type === 'movie' && (
              <TextField
                label="Stream URL"
                value={editStream}
                onChange={(e) => setEditStream(e.target.value)}
                placeholder="https://..."
                fullWidth
                sx={formFieldStyle}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained" disabled={editSaving} sx={{ borderRadius: 2 }}>{editSaving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Manage;
