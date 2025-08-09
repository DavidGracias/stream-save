import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RouteComponentMap } from '../App';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Stream Save
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {
              Object.keys(RouteComponentMap).map(route => {
                return (<li className="nav-item">
                  <Link
                    className={`nav-link ${isActive(route) ? 'active' : ''}`}
                    to={route}
                  >
                    {
                      (route.charAt(1).toUpperCase() + route.substring(2)) || "Home"
                    }
                  </Link>
                </li>)
              }
              )
            }
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
