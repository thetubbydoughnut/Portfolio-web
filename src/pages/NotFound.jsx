import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // We'll create this file next

const NotFound = () => {
  return (
    <section className="section not-found-section">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound; 