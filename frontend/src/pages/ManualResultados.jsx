import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; // ¡Importa el nuevo archivo CSS!
import pag_resul from '../assets/pag_resultados.png'
import btn_evaluar from '../assets/btn_evaluar.png'
import resul from '../assets/resultado.png'


const ManualInicio = () => {
  return (
    <div className="manual-content">
      <div className="manual-header-container">
        <div className="home-button-container">
          <Link to="/simulador" className="home-button">
            <FaHome />
          </Link>
        </div>
        <h1>Manual Para Resultados</h1>
      </div>

      <div className="image-section">
        <img
          src={pag_resul} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="pagina de resultados"
          className="main-image"
        />
      </div>
      <p>
        Esta sección te permite interactuar con tu sistema de lógica difusa, ajustando las entradas en tiempo real y observando cómo el sistema procesa la información para producir una salida. Aquí podrás evaluar la funcionalidad de tus variables y reglas definidas.
      </p>
      
      <h2>1.  Panel de Variables de Entrada</h2>
      <p>En la parte superior de la interfaz, encontrarás un panel dedicado a cada una de tus variables de entrada definidas (ej., "temperatura", "humedad").</p>
      <ul>
        <li><strong>Rango y Slider:</strong> Cada variable de entrada se presenta con su rango numérico (ej., "temperatura (18 - 36)") y un control deslizante (slider).</li>
        <ul>
          <li>Puedes ajustar el valor de entrada moviendo el slider a lo largo de su rango.</li>
          <li>Puedes ajustar el valor de entrada moviendo el slider a lo largo de su rango.</li>
        </ul>
        <li><strong>Botones "Mostrar Todos Juntos" / "Mostrar Separados":</strong>Estos botones te permiten alternar la visualización de los conjuntos de pertenencia.</li>
        <ul>
          <li><strong>"Mostrar Todos Juntos"</strong>: Muestra todos los conjuntos de la variable en un solo gráfico superpuesto, lo que ayuda a visualizar su relación y superposición.</li>
          <li><strong>"Mostrar Separados"</strong>:  Muestra cada conjunto difuso en un gráfico individual, lo que puede ser útil para inspeccionar cada función de membresía por separado.</li>
        </ul>
        <li><strong>Gráficos de Conjuntos de Pertenencia:</strong></li>
        <ul>
          <li>Debajo del slider de cada variable, se visualizan los conjuntos difusos asociados a esa variable (ej., "Bajo", "Medio", "Alto" para temperatura).</li>
          <li>Una línea vertical roja indica la posición del valor de entrada actual en el gráfico.</li>
          <li>Los valores de "Pertenencia" (ej., "Bajo: 0.00", "Medio: 1.00", "Alto: 0.00") te muestran qué tan fuertemente el valor de entrada actual pertenece a cada uno de los conjuntos difusos.</li>
        </ul>
      </ul>
      <h2>2. Botón "Evaluar Sistema Difuso"</h2>
      <div className="image-section-pequenia">
        <img
          src={btn_evaluar} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="boton para evaluar sistema difuso"
          className="main-image-pequenia"
        />
      </div>
      <p>Ubicado en la parte inferior central de la pantalla, después de las variables de entrada.</p>
      <p>Una vez que hayas ajustado los valores de tus variables de entrada, haz clic en este botón para que el sistema procese estas entradas a través de tus reglas difusas y calcule la salida correspondiente.</p>
      
      <h2>3. Panel de Resultados de la Evaluación</h2>
      <div className="image-section-pequenia">
        <img
          src={resul} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="resultados de la evaluacion"
          className="main-image-pequenia"
        />
      </div>
      <p>Después de hacer clic en "Evaluar Sistema Difuso", esta sección en la parte inferior de la pantalla mostrará la salida calculada por tu sistema.</p>
      <ul>
        <li><strong>Variable de Salida y Valor Numérico:</strong> Se muestra el nombre de tu variable de salida (ej., "velocidad_ventilador") y el valor numérico preciso que el sistema ha calculado como resultado de la evaluación (ej., "60.00").</li>
        <li><strong>Gráfico de la Variable de Salida:</strong></li>
        <ul>
          <li>Un gráfico visualiza cómo el valor de salida se relaciona con los conjuntos difusos de la variable de salida.</li>
          <li>Una línea roja vertical indica el valor exacto de la salida en el contexto de sus conjuntos de pertenencia.</li>
        </ul>
      </ul>

      <div className="tip-box">
        <h3 className="tip-title">💡 Flujo de trabajo Recomendado en el Simulador </h3>
        <p className="tip-text">
          <ul>
            <li><strong>1. Ajusta las Entradas:</strong>Utiliza los sliders en el "Panel de Variables de Entrada" para establecer los valores que deseas probar en tu sistema (ej., una temperatura de 27 y una humedad de 64).</li>
            <li><strong>2. Visualiza la Pertenencia: </strong> Observa los gráficos de los "Conjuntos de temperatura" y "Conjuntos de humedad" para entender cómo tus valores de entrada se "activan" dentro de cada conjunto difuso.</li>
            <li><strong>3. Evalúa el Sistema:</strong> Haz clic en el botón Evaluar Sistema Difuso.</li>
            <li><strong>4. Revisa los Resultados:</strong>  El "Panel de Resultados de la Evaluación" mostrará el valor numérico de tu variable de salida y su visualización gráfica, indicando la respuesta de tu sistema.</li>
            <li><strong>5. Experimenta:</strong> Repite los pasos 1 a 4 con diferentes valores de entrada para observar cómo tu sistema reacciona y genera diferentes salidas según las reglas que has definid</li>
          </ul>
        </p>
      </div>
    
    </div>
  );
};

export default ManualInicio;