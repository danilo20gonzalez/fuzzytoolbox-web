// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaProjectDiagram, FaCogs, FaPlay } from 'react-icons/fa';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Link to="/" className="logo-link">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">FuzzyToolbox</span>
        </div>
      </Link>
      
      <ul className="nav-links">
        <li className={location.pathname === '/variables' ? 'active' : ''}>
          <Link to="/variables"><FaProjectDiagram /> <span>Variables</span></Link>
        </li>
        <li className={location.pathname === '/reglas' ? 'active' : ''}>
          <Link to="/reglas"><FaCogs /> <span>Reglas</span></Link>
        </li>
        <li className={location.pathname === '/simulador' ? 'active' : ''}>
          <Link to="/simulador"><FaPlay /> <span>Simulador</span></Link>
        </li>
      </ul>
    </motion.nav>
  );
}

export default Navbar;