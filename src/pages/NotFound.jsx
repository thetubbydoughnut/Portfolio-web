import { Link } from 'react-router-dom';
import '../styles/NotFound.css';
import { PageFrame } from '../layout/PageFrame';

const NotFound = () => {
  return (
    <PageFrame eyebrow="Error" title="Page Not Found" dek="That route does not exist.">
      <section className="section not-found-section page-frame-section">
        <div className="not-found-container page-frame-container">
          <p>Sorry, the page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </section>
    </PageFrame>
  );
};

export default NotFound;
