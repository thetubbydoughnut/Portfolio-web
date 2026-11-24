import PropTypes from 'prop-types';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout" data-glisse-backdrop>
      <div className="main-content">{children}</div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
