import React from 'react';
import { Link } from 'react-router-dom';

const Home = (mongoDBCred) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          {/* Hero Section */}
          <div className="mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">
              Stream Save
            </h1>
            <p className="lead text-muted mb-4">
              Save and manage your custom stream links for movies and series in Stremio
            </p>
          </div>

          {/* Main Actions */}
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Link to="/manage" className="btn btn-success btn-lg w-100">
                    <i className="bi bi-pencil me-2"></i>
                    Manage Content
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link to="/configure" className="btn btn-light btn-lg w-100">
                    <i className="bi bi-gear me-2"></i>
                    First Time Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Page Descriptions */}
          <div className="row mt-5">
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title text-primary">Configure</h5>
                  <p className="card-text text-muted">
                    One-time setup for MongoDB connection. Required before adding content.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title text-success">Manage</h5>
                  <p className="card-text text-muted">
                    Daily use page for adding and removing stream links for movies and series.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title text-info">View</h5>
                  <p className="card-text text-muted">
                    Browse and search all your saved content with detailed information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
