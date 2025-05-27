import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDownload, FaHome, FaProjectDiagram, FaCogs, FaPlay, FaUpload } from 'react-icons/fa';
import '../styles/BarManual.css'; 

const ManualSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/manual/inicio',
      label: 'Inicio',
      icon: <FaHome />
    },
    {
      path: '/manual/variables',
      label: 'Variables Difusas',
      icon: <FaProjectDiagram />
    },
    {
      path: '/manual/reglas',
      label: 'Reglas',
      icon: <FaCogs />
    },
    {
      path: '/manual/resultados',
      label: 'Resultados',
      icon: <FaPlay />
    },
    {
      path: '/manual/cargarDatos',
      label: 'Cargar Datos Externos',
      icon: <FaUpload />
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="manual-sidebar">
      <div className="sidebar-header">
        <h2 className="titulo2">Manual de Usuario</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ManualSidebar;