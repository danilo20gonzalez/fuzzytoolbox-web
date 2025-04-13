// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaProjectDiagram, FaCogs, FaPlay } from 'react-icons/fa';
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
      <div className="logo">🧠 FuzzyToolbox</div>
      <ul className="nav-links">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/"><FaHome /> Inicio</Link>
        </li>
        <li className={location.pathname === '/variables' ? 'active' : ''}>
          <Link to="/variables"><FaProjectDiagram /> Variables</Link>
        </li>
        <li className={location.pathname === '/reglas' ? 'active' : ''}>
          <Link to="/reglas"><FaCogs /> Reglas</Link>
        </li>
        <li className={location.pathname === '/simulador' ? 'active' : ''}>
          <Link to="/simulador"><FaPlay /> Simulador</Link>
        </li>
      </ul>
    </motion.nav>
  );
}

export default Navbar;
