// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaProjectDiagram, FaCogs, FaPlay } from 'react-icons/fa';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();

  const routeColors = {
        '/': { background: 'linear-gradient(90deg, #3b82f6, #38bd6b,rgb(196, 43, 158))' },       // Degradado lineal azul, verde, rosa
        '/variables': { background: 'linear-gradient(90deg,rgb(127, 171, 241),rgb(67, 62, 165))' },  // Verde para Variables
        '/reglas': { background: 'linear-gradient(90deg,rgb(114, 172, 128), #28a745)' },     // Rojo para Reglas
        '/simulador': { background: 'linear-gradient(90deg,rgb(176, 114, 233),rgb(140, 34, 238))' }   // Amarillo para Simulador
  };

  const navbarStyle = {
        background: routeColors[location.pathname]?.background || '#333', // Usar 'background' para el degradado
        transition: 'background-color 0.3s ease' // La transición ahora afectará al 'background'
      };

  return (
    <motion.nav
      className="navbar" style={navbarStyle}
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
          <Link to="/simulador"><FaPlay /> <span>Resultados</span></Link>
        </li>
      </ul>
    </motion.nav>
  );
}

export default Navbar;