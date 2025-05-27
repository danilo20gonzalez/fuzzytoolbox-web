import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; // ¡Importa el nuevo archivo CSS!
import pag_cargar_datos from '../assets/cargar_datos.png'
import carga1 from '../assets/carga1.png'
import carga2 from '../assets/carga2.png'


const ManualInicio = () => {
  return (
    <div className="manual-content">
          <div className="manual-header-container">
            <div className="home-button-container">
              <Link to="/" className="home-button">
                <FaHome />
              </Link>
            </div>
            <h1>Manual de Carga de Datos para Lógica Difusa</h1>
          </div>
    
          <div className="image-section">
            <img
              src={pag_cargar_datos} // Asegúrate de reemplazar esto con la ruta real de tu imagen
              alt="pagina de resultados"
              className="main-image"
            />
          </div>
          <p>
            Esta sección te permite importar datos externos a tu sistema de lógica difusa, utilizando archivos en formato CSV (valores separados por comas). Esta funcionalidad es útil para cargar grandes conjuntos de datos de entrada o para pruebas extensas.          
          </p>
          <p>
            Botón "Seleccionar archivo": Haz clic en este botón para abrir un explorador de archivos y navegar hasta la ubicación de tu archivo CSV. Una vez que selecciones un archivo, el sistema lo cargará para su procesamiento.
          </p>

          <h2>Vista Previa de Datos</h2>
          <div className="image-section">
            <img
              src={carga1} // Asegúrate de reemplazar esto con la ruta real de tu imagen
              alt="carga de datos"
              className="main-image"
            />
          </div>
          <p>
            Después de seleccionar un archivo CSV, el sistema mostrará una vista previa de los datos cargados en formato de tabla.
          </p>
          <p>
            Botón Detectar Variables: Haz clic en este botón para que el sistema analice las columnas de tu CSV e intente identificar variables automáticamente.
          </p>

          <h2>Configura las variables detectadas</h2>
          <div className="image-section">
            <img
              src={carga2} // Asegúrate de reemplazar esto con la ruta real de tu imagen
              alt="carga de datos"
              className="main-image"
            />
          </div>
          <p>
            Una vez que el sistema ha detectado las variables (columnas) de tu archivo CSV, las presentará para que puedas configurarlas antes de crearlas en tu sistema.
          </p>
          <p><strong>Paneles de Configuración por Variable</strong>: Para cada columna detectada (ej., "temperatura", "humedad", "velocidad_ventilador"), verás un panel con las siguientes opciones:</p>
          <ul>
            <li><strong>Nombre de la Variable:</strong> El nombre de la columna en tu CSV, que se usará como nombre de la variable.</li>
            <li><strong>Tipo Numérica:</strong> Indica que la variable es de tipo numérica.</li>
            <li><strong>Rango:</strong>El sistema intentará detectar automáticamente el rango mínimo y máximo de valores para esa variable basándose en los datos del CSV (ej., "Rango: [18, 36]").. Nota: Puedes ajustar manualmente este rango si lo deseas.</li>
            <li><strong>Tipo Variable (Desplegable):</strong>Aquí debes seleccionar si esta variable será de Entrada o de Salida para tu sistema difuso.</li>
            <li><strong>Función (Desplegable):</strong>Selecciona el tipo de función de membresía que deseas que se aplique por defecto a los conjuntos difusos de esta variable (ej., Triangular). Nota: Al enviar, se crearán automáticamente conjuntos difusos básicos para cada variable, pero podrás modificarlos en detalle más adelante en el "Editor de Variables Difusas".</li>
          </ul>

          <h2>Finalizar y enviar:</h2>
          <p>
            Después de revisar y configurar todas las variables detectadas, puedes proceder a finalizar el proceso de carga y creación.
            <ul>
              <li><strong>Botón "Generar Variables y Enviar":</strong> Haz clic en este botón para que el sistema cree automáticamente las variables en base a tu configuración. Una vez hecho esto, estas variables (con sus rangos y tipos de función) aparecerán en el "Editor de Variables Difusas" para que puedas ajustar sus conjuntos.</li>
            <li><strong>Botón Reiniciar:</strong> Si deseas volver a empezar el proceso de carga de datos o seleccionar un archivo diferente, haz clic en este botón.</li>
            </ul>
          </p>
    
          <div className="tip-box">
            <h3 className="tip-title">💡 Flujo de Trabajo Completo de la Carga de Datos: </h3>
            <p className="tip-text">
              <ul>
                <li><strong>1. Prepara tu archivo CSV:</strong>Asegúrate de que tus datos estén correctamente formateados en un archivo CSV, con columnas para tus variables de entrada y salida deseadas.</li>
                <li><strong>2. Carga el Archivo: </strong> "Carga de Datos para Lógica Difusa", haz clic en Seleccionar archivo y elige tu CSV.</li>
                <li><strong>3. Revisa la Vista Previa:</strong>  Verifica que los datos se muestren correctamente en la "Vista previa de datos".</li>
                <li><strong>4. Detecta Variables:</strong>  Haz clic en Detectar Variables para que el sistema identifique las columnas como variables.</li>
                <li><strong>5. Configura Variables:</strong> Para cada variable detectada, selecciona su Tipo Variable (Entrada/Salida) y la Función de membresía deseada. Ajusta el Rango si es necesario.</li>
                <li><strong>6. Generar y Enviar:</strong>Haz clic en Generar Variables y Enviar. El sistema creará las variables y las enviará al "Editor de Variables Difusas".</li>
                <li><strong>7. Ajuste Fino: </strong>Dirígete al "Editor de Variables Difusas" para refinar los conjuntos difusos de tus variables recién creadas.</li>
              </ul>
            </p>
          </div>
        
        </div>
  );
};

export default ManualInicio;