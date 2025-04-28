// src/pages/Inicio.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaCode, FaCog } from 'react-icons/fa';
import '../styles/Inicio.css';  
import { Link } from 'react-router-dom';

function Inicio() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="inicio-container">
      {/* Content */}
      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="header-section"
        >
          <h1 className="main-title">🎯 Bienvenido a FuzzyToolbox</h1>
          <p className="subtitle">
            Explora, experimenta y aprende lógica difusa con herramientas visuales interactivas.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
          className="cards-grid"
        >
          {/* Variables Card */}
          <motion.div
            variants={item}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="card"
          >
            <div className="card-stripe card-stripe-blue"></div>
            <div className="card-content">
              <div className="icon-container icon-blue">
                <FaCog className="card-icon" />
              </div>
              <h2 className="card-title">Variables Difusas</h2>
              <p className="card-description">
                Define y personaliza variables lingüísticas con funciones de pertenencia intuitivas.
              </p>
              <Link to="/variables" className="card-button button-blue"> {/* Reemplazado <a> con <Link> */}
                Comenzar
              </Link>
            </div>
          </motion.div>

          {/* Rules Card */}
          <motion.div
            variants={item}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="card"
          >
            <div className="card-stripe card-stripe-purple"></div>
            <div className="card-content">
              <div className="icon-container icon-purple">
                <FaCode className="card-icon" />
              </div>
              <h2 className="card-title">Reglas Difusas</h2>
              <p className="card-description">
                Crea reglas condicionales IF-THEN y observa cómo afectan al sistema difuso.
              </p>
              <Link to="/reglas" className="card-button button-purple"> {/* Reemplazado <a> con <Link> */}
                Definir Reglas
              </Link>
            </div>
          </motion.div>

          {/* Results Card */}
          <motion.div
            variants={item}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="card"
          >
            <div className="card-stripe card-stripe-green"></div>
            <div className="card-content">
              <div className="icon-container icon-green">
                <FaChartLine className="card-icon" />
              </div>
              <h2 className="card-title">Resultados y Gráficas</h2>
              <p className="card-description">
                Visualiza el comportamiento del sistema mediante gráficas interactivas y análisis.
              </p>
              <Link to="/simulador" className="card-button button-green"> {/* Reemplazado <a> con <Link> */}
                Ver Simulador
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="footer-text"
        >
          <p>Desarrollado con ❤️ para entusiastas de la lógica difusa</p>
        </motion.div>
      </div>
    </div>
  );
}

export default Inicio;