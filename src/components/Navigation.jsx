import { NavLink } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <NavLink to="/" className="nav-logo">
          Portfolio
        </NavLink>
        
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Projects
          </NavLink>
          <NavLink to="/skills" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Skills
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
