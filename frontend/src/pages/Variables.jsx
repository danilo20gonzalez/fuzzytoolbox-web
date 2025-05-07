import { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import "../styles/Variables.css"
import { Link } from 'react-router-dom';
import { FaProjectDiagram, FaCogs, FaPlay } from 'react-icons/fa';

// Configuración de tipos de funciones difusas
const FUZZY_TYPES = {
  triangular: {
    name: 'Triangular',
    points: 3,
  },
  trapezoidal: {
    name: 'Trapezoidal',
    points: 4,
  },
  gaussiana: {
    name: 'Gaussiana',
    points: 2,
  }
};

// Paleta de colores para los conjuntos
const COLOR_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#20B2AA', '#8A2BE2'
];

function Variables() {
  const plotRef = useRef(null);

  // Estados principales
  const [variables, setVariables] = useState([]);
  const [currentVariable, setCurrentVariable] = useState({
    nombre: '',
    tipoVariable: 'entrada', // 'entrada' o 'salida'
    rango: [0, 100],
    tipo: 'triangular',
    conjuntos: []
  });

  const [currentSet, setCurrentSet] = useState({
    nombre: '',
    puntos: [],
    originalName: null
  });

  // Estados de UI
  const [selectedSet, setSelectedSet] = useState(null);
  const [visibleSets, setVisibleSets] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await fetch('http://localhost:8000/variables/');
        const data = await response.json();
        console.log('Respuesta del backend:', data);
        setVariables(data);  // Asigna las variables obtenidas solo del backend
      } catch (error) {
        console.error('Error al cargar las variables:', error);
        setMessage('Error al cargar las variables del servidor');
      }
    };

    fetchVariables();
  }, []);   // Solo se ejecuta una vez al montar el componente

  // Inicializar visibilidad de conjuntos
  useEffect(() => {
    if (currentVariable.conjuntos.length > 0) {
      const initialVisibility = {};
      currentVariable.conjuntos.forEach(conjunto => {
        initialVisibility[conjunto.nombre] = true;
      });
      setVisibleSets(initialVisibility);
    }
  }, [currentVariable.conjuntos]);

  // Inicializar puntos cuando cambia tipo de función
  const initializePoints = useCallback(() => {
    const [min, max] = currentVariable.rango;
    const range = max - min;

    let newPoints = [];

    switch (currentVariable.tipo) {
      case 'triangular':
        newPoints = [min, min + range / 2, max];
        break;
      case 'trapezoidal':
        newPoints = [min, min + range / 4, min + range * 3 / 4, max];
        break;
      case 'gaussiana':
        newPoints = [min + range / 2, range / 6];
        break;
      default:
        newPoints = [min, min + range / 2, max];
    }

    setCurrentSet(prev => ({
      ...prev,
      puntos: newPoints
    }));
  }, [currentVariable.rango, currentVariable.tipo]);

  // Inicializar puntos cuando se crea un nuevo conjunto
  const handleNewSet = () => {
    setCurrentSet({
      nombre: `Conjunto${currentVariable.conjuntos.length + 1}`,
      puntos: [],
      originalName: null
    });
    initializePoints();
  };

  // Manejar cambios en el nombre de la variable
  const handleVariableNameChange = (e) => {
    setCurrentVariable({
      ...currentVariable,
      nombre: e.target.value
    });
  };

  // Manejar cambios en el nombre del conjunto
  const handleSetNameChange = (e) => {
    setCurrentSet({
      ...currentSet,
      nombre: e.target.value
    });
  };

  // Manejar cambios en los puntos
  const handlePointChange = (index, value) => {
    const [min, max] = currentVariable.rango;

    // Asegurar que el valor esté dentro del rango
    let adjustedValue = value;
    if (currentVariable.tipo !== 'gaussiana' || index === 0) {
      adjustedValue = Math.max(min, Math.min(value, max));
    } else if (index === 1 && currentVariable.tipo === 'gaussiana') {
      adjustedValue = Math.max(0.1, value); // Desviación mínima de 0.1
    }

    const newPoints = [...currentSet.puntos];
    newPoints[index] = adjustedValue;

    setCurrentSet(prev => ({ ...prev, puntos: newPoints }));
  };

  // Calcular función de pertenencia
  const calculateMembership = useCallback((xValues, points, type) => {
    switch (type) {
      case 'triangular':
        if (points.length === 3) {
          const [a, b, c] = points;
          return xValues.map(x => {
            if (x <= a || x >= c) return 0;
            if (x <= b) return (x - a) / (b - a);
            return (c - x) / (c - b);
          });
        }
        break;

      case 'trapezoidal':
        if (points.length === 4) {
          const [a, b, c, d] = points;
          return xValues.map(x => {
            if (x <= a || x >= d) return 0;
            if (x >= b && x <= c) return 1;
            if (x < b) return (x - a) / (b - a);
            return (d - x) / (d - c);
          });
        }
        break;

      case 'gaussiana':
        if (points.length === 2) {
          const [mean, stdDev] = points;
          return xValues.map(x => {
            return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
          });
        }
        break;
    }

    return Array(xValues.length).fill(0);
  }, []);

  // Generar datos para el gráfico
  const generatePlotData = useCallback(() => {
    const [min, max] = currentVariable.rango;
    const x = Array.from({ length: 200 }, (_, i) => min + (max - min) * i / 199);
    const plotData = [];

    // Conjuntos existentes visibles
    currentVariable.conjuntos
      .filter(conjunto => visibleSets[conjunto.nombre] !== false)
      .forEach((conjunto, idx) => {
        const y = calculateMembership(x, conjunto.puntos, conjunto.tipo || currentVariable.tipo);

        plotData.push({
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          fill: 'tozeroy',
          name: conjunto.nombre,
          line: {
            color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
            width: selectedSet === conjunto.nombre ? 3 : 2
          }
        });
      });

    // Conjunto actual si tiene nombre y puntos
    if (currentSet.nombre && currentSet.puntos.length > 0) {
      const y = calculateMembership(x, currentSet.puntos, currentVariable.tipo);

      plotData.push({
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: currentSet.nombre,
        line: {
          color: COLOR_PALETTE[currentVariable.conjuntos.length % COLOR_PALETTE.length],
          dash: 'dash',
          width: 2
        }
      });
    }

    return plotData;
  }, [currentVariable, currentSet, visibleSets, selectedSet, calculateMembership]);

  // Generar datos para las gráficas de previsualización
  const generatePreviewPlot = useCallback((variable) => {
    const [min, max] = variable.rango;
    const x = Array.from({ length: 100 }, (_, i) => min + (max - min) * i / 99);
    const plotData = [];

    variable.conjuntos.forEach((conjunto, idx) => {
      const y = calculateMembership(x, conjunto.puntos, conjunto.tipo || variable.tipo);

      plotData.push({
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: conjunto.nombre,
        line: {
          color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
          width: 1.5
        }
      });
    });

    return plotData;
  }, [calculateMembership]);

  // Configuración del gráfico
  const plotLayout = {
    title: `Variable: ${currentVariable.nombre || 'Nueva Variable'}`,
    xaxis: {
      title: 'Valor',
      range: currentVariable.rango
    },
    yaxis: {
      title: 'Grado de Pertenencia',
      range: [0, 1.1]
    },
    margin: { l: 50, r: 50, b: 50, t: 70 },
    showlegend: true
  };

  // Guardar conjunto
  const handleSaveSet = () => {
    if (!currentSet.nombre) {
      setMessage('Ingresa un nombre para el conjunto');
      return;
    }

    const updatedConjuntos = [...currentVariable.conjuntos];
    const existingIndex = updatedConjuntos.findIndex(c =>
      c.nombre === currentSet.originalName || c.nombre === currentSet.nombre
    );

    const newSet = {
      nombre: currentSet.nombre,
      puntos: [...currentSet.puntos],
      tipo: currentVariable.tipo
    };

    if (existingIndex >= 0) {
      updatedConjuntos[existingIndex] = newSet;
      setMessage('Conjunto actualizado');
    } else {
      updatedConjuntos.push(newSet);
      setMessage('Conjunto creado');
    }

    setCurrentVariable(prev => ({ ...prev, conjuntos: updatedConjuntos }));
    setCurrentSet({ nombre: '', puntos: [], originalName: null });
    setSelectedSet(null);

    // Actualizar visibilidad
    setVisibleSets(prev => ({ ...prev, [newSet.nombre]: true }));
  };

  // Guardar variable
  const handleSaveVariable = async () => {
    if (!currentVariable.nombre) {
      setMessage('Ingresa un nombre para la variable');
      return;
    }

    if (currentVariable.conjuntos.length === 0) {
      setMessage('Añade al menos un conjunto');
      return;
    }

    const variableConTipo = {
      ...currentVariable,
      esVariable: currentVariable.tipoVariable,  // Asegúrate de que 'tipoVariable' es 'entrada' o 'salida'
      id: currentVariable.id || Date.now()  // Asignar id si es nueva
    };

    try {
      // Si estás actualizando
      if (currentVariable.id) {
        await fetch(`http://localhost:8000/variables/${currentVariable.nombre}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentVariable)
        });

        // Actualizar en el estado local después de éxito en el backend
        setVariables(prev => prev.map(v => v.id === currentVariable.id ? currentVariable : v));
        setMessage('Variable actualizada');

      } else {
        const newVariable = {
          ...currentVariable,
          id: Date.now()
        };
        // Si es una nueva variable
        await fetch('http://localhost:8000/variables/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentVariable)
        });
        setVariables(prev => [...prev, newVariable]);
        setMessage('Variable creada');
      }

      // Resetear estado
      setCurrentVariable({
        nombre: '',
        rango: [0, 100],
        tipo: 'triangular',
        conjuntos: [],
        tipoVariable: 'entrada'
      });

      setCurrentSet({ nombre: '', puntos: [], originalName: null });
      setSelectedSet(null);

      setMessage('Variable guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la variable:', error);
      setMessage('Error al guardar la variable');
    }
  };

  // Editar variable existente
  const handleEditVariable = (variable) => {
    setCurrentVariable({ ...variable });
    setCurrentSet({ nombre: '', puntos: [], originalName: null });
    setSelectedSet(null);
    setMessage('Variable cargada para edición');
  };

  // Eliminar variable
  const handleDeleteVariable = async (variableId) => {
    if (!window.confirm('¿Eliminar esta variable?')) return;

    try {
      const response = await fetch(`http://localhost:8000/variables/${variableId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Vuelve a cargar las variables después de eliminar
        const updatedResponse = await fetch('http://localhost:8000/variables/');
        const updatedData = await updatedResponse.json();
        setVariables(updatedData);

        if (currentVariable.id === variableId) {
          setCurrentVariable({
            nombre: '',
            rango: [0, 100],
            tipo: 'triangular',
            conjuntos: []
          });
        }
        setMessage('Variable eliminada');
      }
    } catch (error) {
      console.error('Error al eliminar variable:', error);
      setMessage('Error al eliminar variable');
    }
  };

  // Eliminar conjunto
  const handleDeleteSet = (setName) => {
    setCurrentVariable(prev => ({
      ...prev,
      conjuntos: prev.conjuntos.filter(s => s.nombre !== setName)
    }));

    if (selectedSet === setName) {
      setSelectedSet(null);
      setCurrentSet({ nombre: '', puntos: [], originalName: null });
    }

    setMessage('Conjunto eliminado');
  };

  // Toggle visibilidad de conjunto
  const toggleSetVisibility = (setName) => {
    setVisibleSets(prev => ({
      ...prev,
      [setName]: !prev[setName]
    }));
  };

  // Obtener etiquetas según el tipo de función
  const getPointLabels = () => {
    switch (currentVariable.tipo) {
      case 'triangular':
        return ['Izquierda', 'Centro', 'Derecha'];
      case 'trapezoidal':
        return ['Izquierda', 'Inicio Meseta', 'Fin Meseta', 'Derecha'];
      case 'gaussiana':
        return ['Media', 'Desv. Estándar'];
      default:
        return [];
    }
  };

  return (
    <div className="variables-container">
      <h1>Editor de Variables Difusas</h1>

      {message && <div className="message">{message}</div>}

      <div className="main-grid">
        {/* Panel izquierdo */}
        <div className="left-panel">
          <div className="section variable-section">
            <h2>Variable</h2>

            <div className="form-row">
              <label>Nombre:</label>
              <input
                type="text"
                value={currentVariable.nombre}
                onChange={handleVariableNameChange}
              />
            </div>

            <div className="form-row">
              <label>Rango:</label>
              <input
                type="number"
                value={currentVariable.rango[0]}
                onChange={(e) => setCurrentVariable({
                  ...currentVariable,
                  rango: [parseFloat(e.target.value), currentVariable.rango[1]]
                })}
              />
              <input
                type="number"
                value={currentVariable.rango[1]}
                onChange={(e) => setCurrentVariable({
                  ...currentVariable,
                  rango: [currentVariable.rango[0], parseFloat(e.target.value)]
                })}
              />
            </div>

            <div className="form-row">
              <label>Tipo:</label>
              <select
                value={currentVariable.tipo}
                onChange={(e) => setCurrentVariable({ ...currentVariable, tipo: e.target.value })}
              >
                {Object.entries(FUZZY_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
            </div>


            <div className="form-row">
              <label>Tipo de Variable:</label>
              <select
                value={currentVariable.tipoVariable}
                onChange={(e) =>
                  setCurrentVariable({ ...currentVariable, tipoVariable: e.target.value })
                }
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>
          </div>

          <div className="section">
            <div className='CuadrarBoton'>
              <h2>Conjunto</h2>
              <div className='conjunto-boton'>
                <button className='boton-guardar-conjunto' onClick={handleNewSet}>+</button>
              </div>

            </div>
            <div className="form-row">
              <label>Nombre:</label>
              <div className="conjunto-form">
                <input
                  type="text"
                  value={currentSet.nombre}
                  onChange={handleSetNameChange}
                />
              </div>
            </div>

            {currentSet.nombre && currentSet.puntos.length > 0 && (
              <><div className="points-editor">
                {getPointLabels().map((label, index) => (
                  <div className="form-row" key={index}>
                    <label>{label}:</label>
                    <input
                      type="number"
                      value={currentSet.puntos[index] || ''}
                      onChange={(e) => handlePointChange(index, parseFloat(e.target.value))}
                      step="0.1" />
                  </div>
                ))}
              </div>
                <div className="variable-section-footer">
                  <button className="save-variable-btn" onClick={handleSaveSet}>
                    Guardar Conjuntos
                  </button>
                </div>
              </>
            )}
          </div>

          <h2>Variables de Entrada</h2>
          <div className="variables-list">
            {variables.filter(v => v.tipoVariable === 'entrada').map((variable) => (
              <div key={variable.id} className="variable-item">
                <span>{variable.nombre}</span>
                <div>
                  <button className="segundo-boton" onClick={() => handleEditVariable(variable)}>Editar</button>
                  <button className="segundo-boton" onClick={() => handleDeleteVariable(variable.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <br />
          <h2>Variables de Salida</h2>
          <div className="variables-list">
            {variables.filter(v => v.tipoVariable === 'salida').map((variable) => (
              <div key={variable.id} className="variable-item">
                <span>{variable.nombre}</span>
                <div>
                  <button className="segundo-boton" onClick={() => handleEditVariable(variable)}>Editar</button>
                  <button className="segundo-boton" onClick={() => handleDeleteVariable(variable.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="right-panel">
          <div className="plot-container">
            <Plot
              ref={plotRef}
              data={generatePlotData()}
              layout={plotLayout}
              config={{ responsive: true }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>

          {currentVariable.conjuntos.length > 0 && (
            <div className="conjuntos-list">
              <h3>Conjuntos de {currentVariable.nombre}</h3>

              <div className="conjunto-items">
                {currentVariable.conjuntos.map((conjunto, idx) => (
                  <div key={idx} className="conjunto-item">
                    <input
                      type="checkbox"
                      checked={visibleSets[conjunto.nombre] !== false}
                      onChange={() => toggleSetVisibility(conjunto.nombre)}
                    />
                    <span>{conjunto.nombre}</span>
                    <button className="segundo-boton" onClick={() => {
                      setCurrentSet({
                        nombre: conjunto.nombre,
                        originalName: conjunto.nombre,
                        puntos: [...conjunto.puntos]
                      });
                    }}>Editar</button>
                    <button className="segundo-boton" onClick={() => handleDeleteSet(conjunto.nombre)}>X</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="variable-section-footer">
            <button className="boton-actu-guardar" onClick={handleSaveVariable}>
              {currentVariable.id ? 'Actualizar Variable' : 'Guardar Variable ✓'}
            </button>
          </div>
        </div>
      </div>
      {variables.length > 0 && (
        <div className="saved-variables-preview">
          <h2>Visualización de Variables Guardadas</h2>
          <div className="variables-grid">
            {variables.map((variable) => (
              <div key={variable.id} className="variable-preview">
                <h4>{variable.nombre}</h4>
                <div className="mini-plot">
                  <Plot
                    data={generatePreviewPlot(variable)}
                    layout={{
                      margin: { l: 30, r: 20, t: 5, b: 30 },
                      xaxis: { title: '', range: variable.rango },
                      yaxis: { title: '', range: [0, 1.1] },
                      showlegend: false,
                      autosize: true
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className="variable-actions">
                  <button className="segundo-boton" onClick={() => handleEditVariable(variable)}>Editar</button>
                  <button className="segundo-boton" onClick={() => handleDeleteVariable(variable.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div >
        <ul className="nav-reglas">
          <li>
            <Link to="/reglas"><FaCogs />  Ir a Reglas →</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Variables;