import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const View = (mongoDBCred) => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    movies: 0,
    series: 0,
    showing: 0
  });

  // Get credentials from URL params or localStorage
  const getCredentials = () => {
    const user = searchParams.get('user') || localStorage.getItem('mongo_user');
    const passw = searchParams.get('passw') || localStorage.getItem('mongo_passw');
    const cluster = searchParams.get('cluster') || localStorage.getItem('mongo_cluster');

    return { user, passw, cluster };
  };

  const fetchContent = async () => {
    const { user, passw, cluster } = getCredentials();

    if (!user || !passw || !cluster) {
      setError('Please configure your MongoDB connection first.');
      setLoading(false);
      return;
    }

    try {
      const baseUrl = 'http://127.0.0.1:5000';
      const moviesResponse = await fetch(`${baseUrl}/${user}/${passw}/${cluster}/catalog/movie/stream_save_movies.json`);
      const seriesResponse = await fetch(`${baseUrl}/${user}/${passw}/${cluster}/catalog/series/stream_save_series.json`);

      const moviesData = await moviesResponse.json();
      const seriesData = await seriesResponse.json();

      const allContent = [
        ...(moviesData.metas || []).map(item => ({ ...item, type: 'movie' })),
        ...(seriesData.metas || []).map(item => ({ ...item, type: 'series' }))
      ];

      setContent(allContent);
      setFilteredContent(allContent);
      updateStats(allContent);
      setLoading(false);
    } catch (err) {
      setError('Failed to load content. Please check your connection.');
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const movies = data.filter(item => item.type === 'movie').length;
    const series = data.filter(item => item.type === 'series').length;

    setStats({
      total: data.length,
      movies,
      series,
      showing: filteredContent.length
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterContent(term, filterType);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    filterContent(searchTerm, type);
  };

  const filterContent = (term, type) => {
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

  const removeContent = async (id, type) => {
    const { user, passw, cluster } = getCredentials();

    try {
      const response = await fetch('http://127.0.0.1:5000/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          remove_option: 'remove',
          remove_type: type,
          remove_db_url: `mongodb+srv://${user}:${passw}@${cluster}.mongodb.net`,
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
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h5>Configuration Required</h5>
          <p>{error}</p>
          <a href="/configure" className="btn btn-primary">
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-5 fw-bold text-primary mb-3">View Content</h1>
          <p className="lead text-muted">Browse and manage your saved stream links</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between gap-3">
            <div className="card text-center flex-fill">
              <div className="card-body">
                <h3 className="text-primary mb-0">{stats.total}</h3>
                <small className="text-muted">Total Items</small>
              </div>
            </div>
            <div className="card text-center flex-fill">
              <div className="card-body">
                <h3 className="text-success mb-0">{stats.movies}</h3>
                <small className="text-muted">Movies</small>
              </div>
            </div>
            <div className="card text-center flex-fill">
              <div className="card-body">
                <h3 className="text-info mb-0">{stats.series}</h3>
                <small className="text-muted">Series</small>
              </div>
            </div>
            <div className="card text-center flex-fill">
              <div className="card-body">
                <h3 className="text-warning mb-0">{stats.showing}</h3>
                <small className="text-muted">Showing</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or IMDB ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'movie' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleFilter('movie')}
            >
              Movies
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'series' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleFilter('series')}
            >
              Series
            </button>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="card border-0 shadow">
        <div className="card-body p-0">
          {filteredContent.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No content found</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>IMDB ID</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th>Release</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.poster && (
                            <img
                              src={item.poster}
                              alt={item.name}
                              className="me-3"
                              style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <strong>{item.name}</strong>
                            {item.description && (
                              <small className="text-muted d-block">
                                {item.description.substring(0, 50)}...
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code>{item.id}</code>
                      </td>
                      <td>
                        <span className={`badge ${item.type === 'movie' ? 'bg-success' : 'bg-info'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>
                        {item.imdbRating && (
                          <span className="text-warning">
                            ⭐ {item.imdbRating}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.releaseInfo || 'N/A'}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeContent(item.id, item.type)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default View;
