import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; 
import Pag_Reglas1 from '../assets/Reglas1.png'
import Pag_Reglas2 from '../assets/Reglas2.png'
import Pestanias from '../assets/Pestanias.png'
import Crear_regla from '../assets/Crear_regla.png'
import Vista_previa from '../assets/Vista_Previa.png'
import reglas_auto from '../assets/reglas_automaticas.png'

const ManualInicio = () => {
  return (
    <div className="manual-content">
      <div className="manual-header-container">
        <div className="home-button-container">
          <Link to="/" className="home-button">
            <FaHome />
          </Link>
        </div>
        <h1>Manual Para Definir las Reglas</h1>
      </div>

      <div className="image-section">
        <img
          src={Pag_Reglas1} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Pagiana de reglas"
          className="main-image"
        />
      </div>

      <p>
        El Editor de Reglas Difusas es donde construirás la lógica central de tu sistema, definiendo cómo las 
        variables de entrada se relacionan para producir variables de salida. Esta sección está dividida en 
        dos vistas principales: "Crear Regla" para construir nuevas reglas, y "Lista de Reglas" para gestionar
        tus reglas existentes.
      </p>
      <div className="image-section">
        <img
          src={Pag_Reglas2} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Pagiana de reglas2"
          className="main-image"
        />
      </div>

      <h2>Navegación entre Vistas</h2>
      <div className="image-section-pequenia">
        <img
          src={Pestanias} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Pagiana de reglas2"
          className="main-image-pequenia"
        />
      </div>
      <p>
        En la parte superior de la interfaz del Editor de Reglas, encontrarás un sistema de pestañas que te permite alternar entre las dos funcionalidades principales:
        <ul>
          <li><strong>1. Crear Regla:</strong> Haz clic en esta pestaña para acceder al formulario donde puedes construir una nueva regla difusa desde cero. Esta es la vista por defecto al ingresar al Editor de Reglas.</li>
          <li><strong>2. Lista de Reglas:</strong> Selecciona esta pestaña para ver un resumen de todas las reglas que has creado, junto con opciones para buscar, editar o eliminar reglas.</li>
        </ul>
      </p>

      <h2>Vista 1: Crear Nueva Regla</h2>
      <div className="image-section">
        <img
          src={Crear_regla} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de creación de regla"
          className="main-image"
        />
      </div>
      <p>
        Esta pestaña te proporciona las herramientas para construir una regla "SI... ENTONCES" utilizando las variables y conjuntos difusos que definiste previamente.
        <ul>
          <li><strong>1. Variables de Entrada (SI):</strong></li>
          <ul>
            <li>Aquí seleccionarás las variables de entrada que formarán la condición "SI" de tu regla.</li>
            <li>Para cada variable de entrada, elige el conjunto difuso, en este caso: Bajo, Medio y Alto al que pertenece en la condición.</li>
            <li>Operador: Si usas múltiples variables de entrada, selecciona el operador lógico que las conectará:</li>
            <ul>
              <li>Y (AND): Significa que todas las condiciones de entrada deben ser verdaderas.</li>
              <li>O (OR): Significa que al menos una de las condiciones de entrada debe ser verdadera.</li>
            </ul>
          </ul>
          <li><strong>2. Variables de Salida (ENTONCES):</strong></li>
          <ul>
            <li>Define la variable de salida y su conjunto difuso que resultará de la condición de entrada.</li>
            <li>Selecciona la variable de salida y el conjunto difuso al que debe pertenecer cuando la condición "SI" se cumpla.</li>
          </ul>
        </ul>
      </p>

      <h2>Vista 1: Vista Previa</h2>
      <div className="image-section">
        <img
          src={Vista_previa} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de vista previa de regla"
          className="main-image"
        />
      </div>
      
      <p>
        Este panel te muestra una representación textual de la regla que estás construyendo en tiempo real, ayudándote a verificar su lógica antes de guardarla. Por ejemplo: "Si temperatura es Bajo AND humedad es Bajo ENTONCES velocidad_ventilador es Bajo".
        <ul>
          <li><strong>Botón "Guardar Regla":</strong> Una vez que estés satisfecho con tu regla, haz clic en este botón para guardarla en tu sistema. La regla guardada aparecerá en la "Lista de Reglas".</li>
        </ul>
      </p>
      
      <h2>Boton "+ Crear Reglas Automaticas"</h2>
      <div className="image-section">
        <img
          src={reglas_auto} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de vista reglas automaticas"
          className="main-image"
        />
      </div>
      <p>
        <ul>
          <li>Este botón es una herramienta poderosa que te permite generar automáticamente un conjunto de reglas difusas basado en todas las combinaciones posibles de los conjuntos de tus variables de entrada.</li>
          <li>Al hacer clic, el sistema generará una serie de reglas, donde la parte "SI" (las condiciones de entrada) ya estará predefinida. Por ejemplo, si tienes "temperatura" (con conjuntos Baja, Media, Alta) y "humedad" (con Baja, Media, Alta), se generarán reglas como "SI temperatura es Baja AND humedad es Baja...".</li>
          <li><strong>Tu tarea principal será seleccionar la variable de salida y su conjunto difuso (velocidad_ventilador es: --Seleccionar--) para cada una de las reglas generadas automáticamente. </strong></li>
          <li>También puedes optar por <strong>"Negar" </strong>la salida si es necesario.</li>
          <li>Una vez que hayas configurado los consecuentes de todas las reglas generadas (la parte "ENTONCES" para cada una), selecciona el botón <strong>"Guardar Reglas Seleccionadas"</strong>. Al hacer clic, todas las reglas configuradas se añadirán a tu sistema. Si no las guardas, las reglas no se añadirán.</li>
          <li>Si decides no guardar las reglas generadas, puedes hacer clic en el botón <strong>"Cancelar"</strong> para descartar la generación y volver a la vista de creación de una sola regla.</li>
        </ul>
      </p>
      <div className="tip-box">
        <h3 className="tip-title">💡 Flujo de trabajo Recomendado en la Creación de Reglas</h3>
        <p className="tip-text">
          <strong>Método 1: Creación de Reglas una por una</strong>
          <ul>
            <li><strong>1. Seleccionar Variables de Entrada (Parte "SI"):</strong> </li>
            <ul>
              <li>En el panel "Variables de Entrada (SI)", selecciona las variables de entrada que formarán la condición de tu regla.</li>
              <li>Para cada variable elegida, selecciona el conjunto difuso deseado (ej., "Bajo", "Medio", "Alto").</li>
              <li>Si usas múltiples variables de entrada, elige el Operador lógico (Y (AND) u O (OR)) que las conectará.</li>
            </ul>
            <br />
            <li><strong>2. Crea los Conjuntos Difusos:</strong> </li>
            <ul>
              <li>En el panel "Variables de Salida (ENTONCES)", selecciona la variable de salida y su conjunto difuso correspondiente.</li>
            </ul>
            <br />
            <li><strong>3. Revisar la Vista Previa:</strong> </li>
            <ul>
              <li>Observa el panel "Vista Previa" para verificar que la regla se ha formado correctamente según tus selecciones (ej., "Si temperatura es Medio AND humedad es Medio ENTONCES velocidad_ventilador es Medio").</li>
            </ul>
            <br />
            <li><strong>4. Guardar la Regla:</strong> </li>
            <ul>
              <li>Haz clic en el botón Guardar Regla. La regla se añadirá a tu sistema y podrás verla en la pestaña "Lista de Reglas".</li>
            </ul>
            <br />
          </ul>

            <p><strong>Método 2: Creación de Reglas Automáticas</strong> 
             <ul>
              <li><strong>1. Iniciar Generación Automática:</strong> </li>
              <ul>
                <li>Haz clic en el botón + Crear Reglas Automáticas. El sistema generará y mostrará una serie de reglas, con sus condiciones "SI" ya definidas (ej., "Si humedad es Bajo").</li>
              </ul>
              <li><strong>2. Definir Consecuentes ("ENTONCES"):</strong> </li>
              <ul>
                <li>Para cada una de las reglas generadas, selecciona la variable de salida y el conjunto difuso apropiado en la sección "ENTONCES".</li>
                <li>Opcionalmente, puedes activar la opción "Negar" para la salida de cualquier regla.</li>
              </ul>
              <li><strong>3. Guardar o Cancelar la Operación:</strong> </li>
              <ul>
                <li>Guardar Reglas Seleccionadas: Una vez que hayas asignado un consecuente a todas las reglas deseadas, haz clic en el botón Guardar Reglas Seleccionadas. Todas las reglas configuradas se añadirán a tu sistema.</li>
                <li>Cancelar: Si no deseas guardar las reglas generadas o quieres descartar el proceso, haz clic en el botón Cancelar. Esto te regresará a la vista "Crear Nueva Regla" sin guardar las reglas automáticas.</li>
              </ul>
            </ul>
            </p>
        </p>
      </div>
    </div>
  );
};

export default ManualInicio;