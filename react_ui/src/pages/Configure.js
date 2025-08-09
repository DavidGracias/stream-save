import React, { useState, useEffect } from 'react';
import { generateUrl } from '../App';

const Configure = (mongoDBCred, setmongoDBCred) => {
  const [formData, setFormData] = useState({
    user: mongoDBCred.user,
    pass: mongoDBCred.pass,
    cluster: mongoDBCred.cluster,
    db_url: generateUrl(mongoDBCred)
  });

  useEffect(() => {
    setFormData({
      user: mongoDBCred.user,
      pass: mongoDBCred.pass,
      cluster: mongoDBCred.cluster,
      db_url: generateUrl(mongoDBCred)
    })
  }, []);

  const [showHelp, setShowHelp] = useState(false);

  const updateDbUrl = () => {
    const { user, pass, cluster } = formData;
    if (user && pass && cluster) {
      // setFormData(prev => ({
      //   ...prev,
      //   db_url: `mongodb+srv://${user}:${pass}@${cluster}.mongodb.net`
      // }));
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'user' || field === 'pass' || field === 'cluster') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      setTimeout(updateDbUrl, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(formData.user && formData.pass && formData.cluster)) {
      setmongoDBCred({
        user: formData.user
      })
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-primary mb-3">
              MongoDB Setup
            </h1>
            <p className="lead text-muted">
              Configure your MongoDB connection for Stream Save
            </p>
          </div>

          {/* Form Content */}
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              {(
                <div>
                  <h4 className="mb-4">Enter MongoDB Credentials</h4>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.user}
                        onChange={(e) => handleInputChange('user', e.target.value)}
                        placeholder="Your MongoDB username"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="Password"
                        className="form-control"
                        value={formData.pass}
                        onChange={(e) => handleInputChange('pass', e.target.value)}
                        placeholder="Your MongoDB Password"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Cluster Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cluster}
                        onChange={(e) => handleInputChange('cluster', e.target.value)}
                        placeholder="Your cluster name"
                      />
                    </div>
                  </div>
                  <div className="text-end">
                    <button
                      className="btn btn-primary"
                      disabled={!formData.user || !formData.pass || !formData.cluster}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Button */}
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-info btn-sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              Need Help?
            </button>
          </div>

          {/* Help Modal */}
          {showHelp && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowHelp(false)}>
              <div className="modal-dialog" onClick={() => setShowHelp(true)}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">MongoDB Setup Help</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowHelp(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <h6>How to get your MongoDB credentials:</h6>
                    <ol>
                      <li>Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noopener">MongoDB Atlas</a></li>
                      <li>Create a new cluster or use an existing one</li>
                      <li>Create a database user with read/write permissions</li>
                      <li>Get your connection string from the cluster</li>
                      <li>Extract username, Password, and cluster name</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configure;
