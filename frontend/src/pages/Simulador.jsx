import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import '../styles/Pages.css';
import '../styles/Resultados.css';

function Resultados() {
  // Estado para los resultados
  const [servicio, setServicio] = useState(0);
  const [comida, setComida] = useState(0);
  const [propina, setPropina] = useState(5.08);

  // Funciones para manejar el cambio de los sliders
  const handleServicioChange = (e) => setServicio(parseFloat(e.target.value));
  const handleComidaChange = (e) => setComida(parseFloat(e.target.value));
  const handlePropinaChange = (e) => setPropina(parseFloat(e.target.value));

  // Actualizar automáticamente propina cuando cambia servicio o comida
  useEffect(() => {
    // Normalmente, esta lógica vendría de un sistema difuso
    // Aquí simplemente hacemos una demostración
    const propinaCalculada = (servicio * 0.3 + comida * 0.7).toFixed(2);
    // No actualizamos automáticamente para permitir el control manual
    // setPropina(propinaCalculada);
  }, [servicio, comida]);

  // Configuración común para los plots
  const commonPlotLayout = {
    width: 250,
    height: 150,
    margin: { l: 30, r: 20, t: 30, b: 30 },
    showlegend: false,
    xaxis: { range: [0, 10] },
    yaxis: { range: [0, 1], showticklabels: false }
  };

  // Configuración para el plot grande de propina (el último)
  const bigPlotLayout = {
    ...commonPlotLayout,
    height: 180,
    xaxis: { range: [0, 30] },
    yaxis: { range: [0, 1], showticklabels: false }
  };

  // Crear la línea vertical para el servicio
  const servicioLine = {
    type: 'line',
    x0: servicio,
    y0: 0,
    x1: servicio,
    y1: 1,
    line: {
      color: 'red',
      width: 2
    }
  };

  // Crear la línea vertical para la comida
  const comidaLine = {
    type: 'line',
    x0: comida,
    y0: 0,
    x1: comida,
    y1: 1,
    line: {
      color: 'red',
      width: 2
    }
  };

  // Crear la línea vertical para la propina
  const propinaLine = {
    type: 'line',
    x0: propina,
    y0: 0,
    x1: propina,
    y1: 1,
    line: {
      color: 'red',
      width: 2
    }
  };

  // Agregar las líneas a los layouts
  const servicioLayout = {
    ...commonPlotLayout,
    shapes: [servicioLine]
  };

  const comidaLayout = {
    ...commonPlotLayout,
    shapes: [comidaLine]
  };

  const propinaLayouts = [
    { ...commonPlotLayout, shapes: [propinaLine] },
    { ...commonPlotLayout, shapes: [propinaLine] },
    { ...commonPlotLayout, shapes: [propinaLine] },
    { ...bigPlotLayout, shapes: [propinaLine] }
  ];

  return (
    <div className="page-container">
      <h1>🧪 Resultados</h1>
      <p>Ajusta los sliders para ver cómo responde el sistema difuso.</p>

      {/* Contenedor principal con 3 columnas */}
      <div className="resultados-container">
        {/* Columna 1: Servicio (3 gráficas) */}
        <div className="columna">
          <h3>Servicio = {servicio}</h3>
          {/* Slider para controlar servicio */}
          <div className="slider-container">
            <label htmlFor="servicioSlider">
              Ajustar Servicio:
            </label>
            <input
              type="range"
              id="servicioSlider"
              min="0"
              max="10"
              step="0.1"
              value={servicio}
              onChange={handleServicioChange}
            />
          </div>

          <div className="graficas-container">
            {/* Números de la izquierda */}
            <div className="numero-indicador numero-indicador-1 destacado">1</div>
            <div className="numero-indicador numero-indicador-2">2</div>
            <div className="numero-indicador numero-indicador-3">3</div>
            
            {/* Primera gráfica de Servicio (Bueno) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 2, 5, 10],
                    y: [1, 0.8, 0.2, 0],
                    type: 'scatter',
                    mode: 'lines',
                    fill: 'tozeroy',
                    line: { color: 'yellow' },
                    fillcolor: 'rgba(255, 255, 0, 0.6)'
                  },
                ]}
                layout={servicioLayout}
              />
            </div>

            {/* Segunda gráfica de Servicio (Regular) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [0, 1, 0],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#666', dash: 'dash' },
                  },
                ]}
                layout={servicioLayout}
              />
            </div>

            {/* Tercera gráfica de Servicio (Malo) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [0, 0, 1],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#666', dash: 'dash' },
                  },
                ]}
                layout={servicioLayout}
              />
            </div>
            
            {/* Etiquetas del eje X */}
            <div className="etiquetas-eje">
              <span className="etiqueta-roja">0</span>
              <span className="etiqueta-roja">10</span>
            </div>
          </div>
          
        </div>

        {/* Columna 2: Comida (2 gráficas) */}
        <div className="columna">
          <h3>Comida = {comida}</h3>
           {/* Slider para controlar comida */}
           <div className="slider-container">
            <label htmlFor="comidaSlider">
              Ajustar Comida:
            </label>
            <input
              type="range"
              id="comidaSlider"
              min="0"
              max="10"
              step="0.1"
              value={comida}
              onChange={handleComidaChange}
            />
          </div>

          <div className="graficas-container">
            {/* Números de la izquierda */}
            <div className="numero-indicador numero-indicador-1 destacado">1</div>
            <div className="numero-indicador numero-indicador-2">2</div>
            
            {/* Primera gráfica de Comida (Rancia) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [1, 0.2, 0],
                    type: 'scatter',
                    mode: 'lines',
                    fill: 'tozeroy',
                    line: { color: 'yellow' },
                    fillcolor: 'rgba(255, 255, 0, 0.6)'
                  },
                ]}
                layout={comidaLayout}
              />
            </div>

            {/* Segunda gráfica de Comida (Deliciosa) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [0, 0, 1],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#666', dash: 'dash' },
                  },
                ]}
                layout={comidaLayout}
              />
            </div>
            
            {/* Etiquetas del eje X */}
            <div className="etiquetas-eje">
              <span className="etiqueta-roja">0</span>
              <span className="etiqueta-roja">10</span>
            </div>
          </div>
          
         
        </div>

        {/* Columna 3: Propina (4 gráficas) */}
        <div className="columna">
          <h3>Propina = {propina}</h3>
          {/* Slider para controlar propina */}
          <div className="slider-container">
            <label htmlFor="propinaSlider">
              Ajustar Propina:
            </label>
            <input
              type="range"
              id="propinaSlider"
              min="0"
              max="30"
              step="0.01"
              value={propina}
              onChange={handlePropinaChange}
            />
          </div>
          <div className="graficas-container">
            <div className="numero-indicador numero-indicador-1 destacado">1</div>
            <div className="numero-indicador numero-indicador-2">2</div>
            <div className="numero-indicador numero-indicador-3">3</div>
            <div className="numero-indicador numero-indicador-4">4</div>
            {/* Primera gráfica de Propina (Mala) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [0, 1, 0],
                    type: 'scatter',
                    mode: 'lines',
                    fill: 'tozeroy',
                    line: { color: 'blue' },
                    fillcolor: 'rgba(0, 0, 255, 0.6)'
                  },
                ]}
                layout={propinaLayouts[0]}
              />
            </div>

            {/* Segunda gráfica de Propina (Media) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [5, 10, 15],
                    y: [0, 1, 0],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#666' },
                  },
                ]}
                layout={propinaLayouts[1]}
              />
            </div>

            {/* Tercera gráfica de Propina (Buena) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [15, 20, 25],
                    y: [0, 1, 0],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#666' },
                  },
                ]}
                layout={propinaLayouts[2]}
              />
            </div>

            {/* Cuarta gráfica de Propina (grande, Línea de corte) */}
            <div className="grafica-wrapper">
              <Plot
                data={[
                  {
                    x: [0, 5, 10],
                    y: [0, 1, 0],
                    type: 'scatter',
                    mode: 'lines',
                    fill: 'tozeroy',
                    line: { color: 'blue' },
                    fillcolor: 'rgba(0, 0, 255, 0.6)'
                  },
                ]}
                layout={propinaLayouts[3]}
              />
            </div>
            
            {/* Etiquetas del eje X para la columna de propina */}
            <div className="etiquetas-eje-propina">
              <span className="etiqueta-roja">0</span>
              <span className="etiqueta-roja">30</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Resultados;