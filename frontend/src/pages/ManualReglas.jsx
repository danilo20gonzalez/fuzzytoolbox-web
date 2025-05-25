import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; // ¡Importa el nuevo archivo CSS!

const ManualInicio = () => {
  return (
    <div className="manual-content">
      <div className="home-button-container">
        <Link to="/" className="home-button">
          <FaHome />
        </Link>
      </div>
      <h1>Reglas</h1>

      <div className="image-section">
        <img
          src="/api/placeholder/600/300" // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Sistema de Lógica Difusa"
          className="main-image"
        />
      </div>

      <h2>¿Qué es la Lógica Difusa?</h2>
      <p>
        La lógica difusa es una extensión de la lógica clásica que permite trabajar con
        valores de verdad que van más allá del simple "verdadero" o "falso". En lugar
        de usar únicamente 0 y 1, la lógica difusa utiliza valores entre 0 y 1, lo que
        permite representar conceptos como "parcialmente verdadero" o "muy probable".
      </p>

      <h2>Características del Sistema</h2>
      <p>
        Nuestro sistema de lógica difusa te permite crear y gestionar conjuntos difusos,
        definir reglas de inferencia, y realizar simulaciones precisas. Con una interfaz
        intuitiva y herramientas avanzadas, podrás:
      </p>

      <div className="features-list-container">
        <ul>
          <li>Definir variables lingüísticas con funciones de membresía personalizadas</li>
          <li>Crear reglas difusas utilizando operadores AND, OR y NOT</li>
          <li>Ejecutar simulaciones en tiempo real con diferentes valores de entrada</li>
          <li>Visualizar resultados mediante gráficos interactivos</li>
          <li>Importar y exportar datos desde archivos externos</li>
        </ul>
      </div>

      <h2>Navegación del Manual</h2>
      <p>
        Este manual está organizado en secciones que te guiarán paso a paso a través
        de todas las funcionalidades del sistema. Te recomendamos seguir el orden
        propuesto para obtener la mejor experiencia de aprendizaje:
      </p>

      <div className="manual-sections-grid">
        <div className="manual-section-card">
          <h3 className="section-card-title">📥 Instalación</h3>
          <p className="section-card-description">Requisitos del sistema y proceso de instalación</p>
        </div>

        <div className="manual-section-card">
          <h3 className="section-card-title">⚙️ Variables Difusas</h3>
          <p className="section-card-description">Cómo crear y configurar variables lingüísticas</p>
        </div>

        <div className="manual-section-card">
          <h3 className="section-card-title">📋 Reglas</h3>
          <p className="section-card-description">Definición de reglas de inferencia difusa</p>
        </div>
      </div>

      <h2>Ejemplo Práctico</h2>
      <p>
        Imagina que quieres crear un sistema para evaluar la calidad de un restaurante.
        Podrías definir variables como "Comida" (mala, regular, buena, excelente),
        "Servicio" (lento, normal, rápido) y "Precio" (barato, moderado, caro).
        Luego, crearías reglas como:
      </p>

      <div className="code-example-block">
        SI Comida es Excelente Y Servicio es Rápido ENTONCES Calidad es Muy_Buena<br/>
        SI Comida es Buena Y Precio es Barato ENTONCES Calidad es Buena<br/>
        SI Comida es Mala O Servicio es Lento ENTONCES Calidad es Baja
      </div>

      <h2>Soporte y Recursos</h2>
      <p>
        Si encuentras alguna dificultad o tienes preguntas específicas, puedes:
      </p>
      <ul className="support-list">
        <li>Consultar las secciones específicas de este manual</li>
        <li>Revisar los ejemplos incluidos en cada sección</li>
        <li>Utilizar la función de ayuda contextual en cada página</li>
        <li>Contactar al equipo de soporte técnico</li>
      </ul>

      <div className="tip-box">
        <h3 className="tip-title">💡 Consejo</h3>
        <p className="tip-text">
          Para aprovechar al máximo este sistema, te recomendamos practicar con los
          ejemplos proporcionados antes de crear tus propios proyectos. La lógica
          difusa puede parecer compleja al principio, pero con práctica se vuelve
          una herramienta muy poderosa.
        </p>
      </div>
    </div>
  );
};

export default ManualInicio;