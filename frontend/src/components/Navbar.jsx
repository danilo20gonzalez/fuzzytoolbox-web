// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaProjectDiagram, FaCogs, FaPlay } from 'react-icons/fa';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();

  const routeColors = {
        '/': { background: 'linear-gradient(90deg, #3b82f6, #38bd6b,rgb(185, 60, 179))' },       // Degradado lineal azul, verde, rosa
        '/variables': { background: 'linear-gradient(90deg, #3b82f6, #38bd6b)' },  // Verde para Variables
        '/reglas': { background: 'linear-gradient(140deg,rgb(1, 207, 80),rgb(185, 60, 179))' },     // Rojo para Reglas
        '/simulador': { background: 'linear-gradient(90deg,rgb(109, 3, 141), rgb(109, 3, 141),rgb(63, 131, 241))' }   // Amarillo para Simulador
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