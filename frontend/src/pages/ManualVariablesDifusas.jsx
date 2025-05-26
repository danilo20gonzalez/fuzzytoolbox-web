import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/Manual.css'; // ¡Importa el nuevo archivo CSS!
import Pag_variables from '../assets/Variables.png'
import Pnl_variables from '../assets/Panel_variables.png'
import Pnl_Conjunto from '../assets/Panel_Conjunto.png'
import Pnl_Grafica from '../assets/Panel_grafica.png'
import Pnl_Grafica1 from '../assets/Panel_Graficas1.png'
import Pnl_Ent_Sal from '../assets/Panel_Ent_Sal.png'
import Btn_Sal from '../assets/Btn_Reglas.png'
import Btn_guardarVar from '../assets/Btn_guardaVar.png'
import Vista_conj from '../assets/Vista_conjunto.png'

const ManualInicio = () => {
  return (
    <div className="manual-content">
      <div className="manual-header-container">
        <div className="home-button-container">
          <Link to="/" className="home-button">
            <FaHome />
          </Link>
        </div>
        <h1>Manual Para Ingresar Variables Difusas</h1>
      </div>

      <div className="image-section">
        <img
          src={Pag_variables} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Pagiana de Variables"
          className="main-image"
        />
      </div>


      <p>
        Esta sección te permite definir, configurar y visualizar las variables lingüísticas esenciales para tu
        sistema de lógica difusa. Aquí, podrás crear variables de entrada y salida, establecer sus rangos, y
        definir los conjuntos difusos asociados con ellas.
      </p>

      <h2>Panel de Definición de Variable</h2>
      <div className="image-section-pequenia">
        <img
          src={Pnl_variables} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de Variables"
          className="main-image-pequenia"
        />
      </div>

      <p>
        Ubicado en la parte superior izquierda de la pantalla, este panel te permite configurar los atributos
        generales de una nueva variable:
        <ul>
          <li><strong>Campo Nombre:</strong> Ingresa un nombre descriptivo para tu variable (ej., "temperatura", "humedad", "velocidad_ventilador").</li>
          <li><strong>Campo Rango:</strong> Define el rango de valores numéricos que esta variable puede tomar. Deberás especificar un valor mínimo y un valor máximo.</li>
          <li><strong>Campo Tipo:</strong>  Selecciona el tipo de función de membresía que usarán los conjuntos difusos de esta variable. Los tipos comunes incluyen Triangular, Trapezoidal y Gaussiana</li>
          <li><strong>Campo Tipo de Variable:</strong>  Indica si la variable es de Entrada (un valor que el sistema recibe) o de Salida (un valor que el sistema produce).</li>
        </ul>
      </p>

      <h2>Panel de Definición de Conjunto</h2>
      <div className="image-section-pequenia">
        <img
          src={Pnl_Conjunto} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de Conjunto Difuso"
          className="main-image-pequenia"
        />
      </div>
      <p>
        Este panel te permite crear seleccionando el boton (+) y configurar los conjuntos difusos específicos para la variable que estás
        definiendo en el panel superior. Aquí es donde estableces cómo se "interpretan" los valores dentro del
        rango de tu variable.
        <ul>
          <li><strong>Campo Nombre:</strong> Asigna un nombre lingüístico al conjunto (ej., "Bajo", "Medio", "Alto").</li>
          <li><strong>Campos Izquierda, Centro, Derecha:</strong> Estos campos se utilizan para definir los puntos clave de la función de membresía de tu conjunto (por ejemplo, los vértices de un triángulo para un tipo Triangular). Los valores aquí dependen del Tipo de función de membresía seleccionado.</li>
          <li><strong>Botón Guardar Conjuntos:</strong> Una vez que hayas configurado el nombre y los puntos de membresía de tu conjunto, haz clic en este botón para añadirlo a la variable actual.</li>
        </ul>
      </p>

      <h2>Gráfico de Visualización de la Variable Activa</h2>
      <div className="image-section-pequenia">
        <img
          src={Pnl_Grafica} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de la Gráfica de la Variable"
          className="main-image-pequenia"
        />
      </div>
      <p>
        En la parte superior central, un gráfico muestra dinámicamente la forma de la función de membresía
        de la variable que estás configurando. Cada conjunto difuso que añades se visualiza en este gráfico,
        permitiéndote ver cómo se superponen y cómo representan los conceptos lingüísticos dentro del rango de
        la variable.
      </p>

      <h2>Variables de Entrada y de Salida</h2>
      <div className="image-section-pequenia">
        <img
          src={Pnl_Ent_Sal} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de las entradas y salidas"
          className="main-image-pequenia"
        />
      </div>
      <p>
        Muestra una lista de todas las variables que has definido como "Entrada" y "Salida" en tu sistema. Cada variable se lista con botones Editar y Eliminar, permitiéndote gestionarlas individualmente.
      </p>

      <h2>Visualización de Variables Guardadas</h2>
      <div className="image-section-pequenia">
        <img
          src={Pnl_Grafica1} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Panel de las Graficas de las Variables"
          className="main-image-pequenia"
        />
      </div>
      <p>
        En la parte inferior de la pantalla, este panel presenta gráficos individuales para cada una de tus
        variables difusas (temperatura, humedad, velocidad_ventilador, etc.) que han sido guardadas. Cada gráfico
        muestra sus respectivos conjuntos difusos, ofreciendo una visión rápida de todas las variables creadas en tu sistema.
      </p>
      <p>
        Debajo de cada gráfico de variable, encontrarás botones Editar y Eliminar para modificar o remover
        la variable completa y todos sus conjuntos asociados.
      </p>

      <h2>Botón "Ir a Reglas →"</h2>
      <div className="image-section-pequenia">
        <img
          src={Btn_Sal} // Asegúrate de reemplazar esto con la ruta real de tu imagen
          alt="Boton para ir a Reglas"
          className="main-image-pequenia"
        />
      </div>
      <p>
        En la esquina inferior derecha, este botón te permite navegar directamente a la sección del Editor de
        Reglas una vez que hayas terminado de definir tus variables y estés listo para construir la lógica de tu
        sistema difuso.
      </p>

      <div className="tip-box">
        <h3 className="tip-title">💡 Flujo de trabajo Recomendado en el Editor de Variables Difusas</h3>
        <p className="tip-text">
          <ul>
            <li><strong>Define la Variable General:</strong> ingresa el `Nombre` de tu variable (ej., "temperatura"), establece su `Rango` (ej., 0 a 100) y selecciona su `Tipo` de función de membresía (ej., "Triangular") y su `Tipo de Variable` (Entrada o Salida).</li>
            <br />
            <li><strong>Crea los Conjuntos Difusos:</strong> Utiliza el "Panel de Definición de Conjunto" para añadir los conjuntos lingüísticos asociados a tu variable (ej., "Bajo", "Medio", "Alto"). Para cada conjunto, ingresa su `Nombre` y define los puntos (`Izquierda`, `Centro`, `Derecha`) según el tipo de función de membresía seleccionada. Haz clic en `Guardar Conjuntos` después de configurar cada uno. Observa cómo los conjuntos aparecen en el "Gráfico de Visualización" y en la "Lista de Conjuntos".</li>
            <br />
            <li><strong>Guardar la Variable y sus Conjuntos</strong> Es crucial que definas todos los conjuntos necesarios para tu variable. Una vez que lo hayas hecho, un botón de 'Guardar Variable' se activará a la derecha para que puedas guardar los cambios.</li>
            <br />
            <div className="image-section-pequenia">
              <img
                src={Btn_guardarVar} // Asegúrate de reemplazar esto con la ruta real de tu imagen
                alt="Boton para Guardar Variables"
                className="main-image-pequenia"
              />
            </div>
            <br />
            <li><strong>Revisa y Ajusta (Opcional):</strong> Utiliza la "Lista de Conjuntos de la Variable Actual" para `Editar` o `Eliminar` conjuntos si es necesario. </li>
            <br />
            <div className="image-section-pequenia">
              <img
                src={Vista_conj} // Asegúrate de reemplazar esto con la ruta real de tu imagen
                alt="vista de los conuejtos difusos"
                className="main-image-pequenia"
              />
            </div>
            <br />
            <li><strong>Continúa al Siguiente Paso:</strong> Una vez que hayas definido todas tus variables de entrada y salida, haz clic en el botón `Ir a Reglas →` para pasar a la siguiente etapa de construcción de tu sistema difuso.</li>
          </ul>

        </p>
      </div>



    </div>
  );
};

export default ManualInicio;