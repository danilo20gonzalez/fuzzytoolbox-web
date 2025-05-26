import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; // ¡Importa el nuevo archivo CSS!
import NavBar from '../assets/Barra_nav.png'
import Inicio from '../assets/Inicio.png'
import Btn_ayuda from '../assets/Boton_ayuda.png'
import Tarjeta from '../assets/Tarjetas.png'

const ManualInicio = () => {
  return (
    <div className="manual-content">
      <div className="manual-header-container">
        <div className="home-button-container">
        <Link to="/" className="home-button">
          <FaHome />
        </Link>
      </div>
      <h1>Visión General del Sistema y Navegación Principal</h1>
      </div>
      
      <div className="image-section">
        <img
          src={Inicio}
          alt="Barra de Navegación"
          className="main-image"
        />
      </div>
      <p>
        En esta sección, exploraremos la interfaz de inicio de FuzzyFlow, que te proporciona un acceso rápido 
        y organizado a las funcionalidades clave de la aplicación.
      </p>

      <h2>Barra de Navegación Superior</h2>

      <div className="image-section">
        <img
          src={NavBar}
          alt="Barra de Navegación"
          className="main-image"
        />
      </div>

      <p>
        <strong>● FuzzyFlow (Logo/Nombre de la aplicación):</strong> Haciendo clic en el logo o el nombre de la aplicación, siempre regresarás a la página de inicio principal.
      </p>
      <p>
        <strong>● Variables:</strong> Te dirige a la sección donde podrás definir y gestionar tus variables lingüísticas y sus funciones de membresía.
      </p>
      <p>
        <strong>● Reglas:</strong> Accede a la pantalla para crear, editar y organizar las reglas de inferencia difusa de tu sistema.
      </p>
      <p>
        <strong>● Resultados:</strong> Aquí podrás visualizar y analizar los resultados de tus simulaciones, mostrando cómo las reglas difusas procesan las entradas.
      </p>

      <h2>Botón de Ayuda (?)</h2>
      <div className="image-section-pequenia">
        <img
          src={Btn_ayuda}
          alt="Barra de Navegación"
          className="main-image-pequenia"
        />
      </div>
      <p>
        En la esquina superior izquierda de la pantalla, verás un botón con un signo de interrogación. Al hacer clic en este botón, accederás a la sección de Manual de Usuario o a la ayuda contextual, que te proporcionará información detallada sobre la funcionalidad de la página actual.
      </p>
      <h2> Tarjetas de Acceso Rápido a Funcionalidades Principales</h2>
      <p>
        Debajo del mensaje de bienvenida, encontrarás tres tarjetas interactivas que representan las funcionalidades esenciales de FuzzyFlow. Cada tarjeta te permite acceder directamente a la sección correspondiente para comenzar a trabajar:
      </p>
      <div className="image-section">
        <img
          src={Tarjeta}
          alt="Barra de Navegación"
          className="main-image"
        />
      </div>
      <p>
        <strong>Tarjeta "Variables Difusas (⚙️)":</strong>
      </p> 
      <p>
        <strong>Botón:</strong> "Comenzar" – Haz clic aquí para ir a la sección de definición de variables difusas.
      </p>
      <br />
      <p>
        <strong>Tarjeta "Reglas Difusas"</strong>
      </p> 
      <p>
        <strong>Botón:</strong> ""Definir Reglas" " – Haz clic aquí para empezar a construir tus reglas de inferencia.
      </p>
      <br />
      <p>
        <strong>Tarjeta "Resultados  (📈)"</strong>
      </p> 
      <p>
        <strong>Botón:</strong> "Ver Resultados" – Haz clic aquí para explorar los resultados generados por tu sistema difuso.
      </p>
      

      <div className="tip-box">
        <h3 className="tip-title">💡 Consejo</h3>
        <p className="tip-text">
          Ve en orden secuencial para familiarizarte con todas las funcionalidades.
        </p>
      </div>
    </div>
  );
};

export default ManualInicio;