import { useState, useRef } from 'react';
import Papa from 'papaparse';
import '../styles/DataProcessor.css';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCheck, FaTimes, FaTable, FaEdit } from 'react-icons/fa';
import "../styles/DataProcessor.css"

const CargaDatos = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [detectadas, setDetectadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Manejar la selección de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');
    setDetectadas([]);
    
    if (selectedFile) {
      // Validar que sea un archivo CSV
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Por favor, carga un archivo CSV válido');
        return;
      }
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`Error al analizar el CSV: ${results.errors[0].message}`);
            return;
          }
          
          setParsedData(results.data);
          setSuccess(`Archivo procesado correctamente. Se encontraron ${results.data.length} filas y ${Object.keys(results.data[0]).length} columnas.`);
        },
        error: (error) => {
          setError(`Error al procesar el archivo: ${error.message}`);
        }
      });
    }
  };

  // Detectar columnas y generar variables automáticamente
  const detectarVariables = () => {
    if (!parsedData || parsedData.length === 0) {
      setError('No hay datos para procesar');
      return;
    }

    try {
      // Obtener las columnas del CSV
      const columnas = Object.keys(parsedData[0]);
      
      // Generar variables detectadas
      const variablesDetectadas = columnas.map(columna => {
        // Obtener todos los valores de la columna
        const valores = parsedData.map(row => row[columna]).filter(val => val !== undefined && val !== null);
        
        // Calcular rango
        const min = Math.min(...valores);
        const max = Math.max(...valores);
        
        // Determinar si es numérica o categórica
        const esNumerica = valores.every(val => typeof val === 'number');
        
        // Por defecto todas son de entrada excepto la última que es de salida
        const tipoVariable = columna === columnas[columnas.length - 1] ? 'salida' : 'entrada';
        
        return {
          nombre: columna,
          tipoVariable: tipoVariable,
          rango: esNumerica ? [min, max] : [0, valores.length - 1],
          tipo: 'triangular',
          esNumerica: esNumerica,
          valoresUnicos: esNumerica ? [] : [...new Set(valores)].sort(),
          conjuntos: []
        };
      });
      
      setDetectadas(variablesDetectadas);
    } catch (error) {
      console.error(error);
      setError(`Error al detectar variables: ${error.message}`);
    }
  };

  // Generar conjuntos automáticamente para variables numéricas
  const generarConjuntos = (variables) => {
    return variables.map(variable => {
      if (!variable.esNumerica) {
        // Para variables categóricas, crear un conjunto por cada valor único
        const conjuntos = variable.valoresUnicos.map((valor, idx) => {
          return {
            nombre: `${valor}`,
            puntos: variable.tipo === 'triangular' 
              ? [idx - 0.5, idx, idx + 0.5] 
              : variable.tipo === 'trapezoidal'
                ? [idx - 0.5, idx - 0.2, idx + 0.2, idx + 0.5]
                : [idx, 0.2], // gaussiana
            tipo: variable.tipo
          };
        });
        
        return {
          ...variable,
          conjuntos
        };
      } else {
        // Para variables numéricas dividir en 3 conjuntos por defecto
        const [min, max] = variable.rango;
        const rango = max - min;
        
        let conjuntos = [];
        
        if (variable.tipo === 'triangular') {
          conjuntos = [
            {
              nombre: 'Bajo',
              puntos: [min, min, min + rango/3],
              tipo: 'triangular'
            },
            {
              nombre: 'Medio',
              puntos: [min + rango/6, min + rango/2, min + rango*5/6],
              tipo: 'triangular'
            },
            {
              nombre: 'Alto',
              puntos: [min + rango*2/3, max, max],
              tipo: 'triangular'
            }
          ];
        } else if (variable.tipo === 'trapezoidal') {
          conjuntos = [
            {
              nombre: 'Bajo',
              puntos: [min, min, min + rango/4, min + rango/2],
              tipo: 'trapezoidal'
            },
            {
              nombre: 'Medio',
              puntos: [min + rango/4, min + rango*2/5, min + rango*3/5, min + rango*3/4],
              tipo: 'trapezoidal'
            },
            {
              nombre: 'Alto',
              puntos: [min + rango/2, min + rango*3/4, max, max],
              tipo: 'trapezoidal'
            }
          ];
        } else if (variable.tipo === 'gaussiana') {
          conjuntos = [
            {
              nombre: 'Bajo',
              puntos: [min + rango/6, rango/6],
              tipo: 'gaussiana'
            },
            {
              nombre: 'Medio',
              puntos: [min + rango/2, rango/6],
              tipo: 'gaussiana'
            },
            {
              nombre: 'Alto',
              puntos: [min + rango*5/6, rango/6],
              tipo: 'gaussiana'
            }
          ];
        }
        
        return {
          ...variable,
          conjuntos
        };
      }
    });
  };

  // Cambiar tipo de variable (entrada/salida)
  const cambiarTipoVariable = (index, nuevoTipo) => {
    setDetectadas(prevVars => {
      const nuevasVars = [...prevVars];
      nuevasVars[index] = {
        ...nuevasVars[index],
        tipoVariable: nuevoTipo
      };
      return nuevasVars;
    });
  };

  // Cambiar tipo de función (triangular, trapezoidal, gaussiana)
  const cambiarTipoFuncion = (index, nuevoTipo) => {
    setDetectadas(prevVars => {
      const nuevasVars = [...prevVars];
      nuevasVars[index] = {
        ...nuevasVars[index],
        tipo: nuevoTipo
      };
      return nuevasVars;
    });
  };

  // Enviar variables al backend y redirigir al componente Variables
  const enviarAlBackend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar que hay al menos una variable de entrada y salida
      const variablesEntrada = detectadas.filter(v => v.tipoVariable === 'entrada');
      const variablesSalida = detectadas.filter(v => v.tipoVariable === 'salida');
      
      if (variablesEntrada.length === 0) {
        throw new Error('Debe haber al menos una variable de entrada');
      }
      
      if (variablesSalida.length === 0) {
        throw new Error('Debe haber al menos una variable de salida');
      }
      
      // Generar conjuntos para todas las variables
      const variablesConConjuntos = generarConjuntos(detectadas);
      
      // Enviar cada variable al backend
      for (const variable of variablesConConjuntos) {
        // Preparar el formato JSON según lo requerido por el backend
        const variableData = {
          nombre: variable.nombre,
          tipoVariable: variable.tipoVariable,
          rango: variable.rango,
          tipo: variable.tipo,
          conjuntos: variable.conjuntos.map(conjunto => ({
            nombre: conjunto.nombre,
            puntos: conjunto.puntos,
            tipo: conjunto.tipo
          }))
        };
        
        // Enviar al backend
        const response = await fetch('http://localhost:8000/variables/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variableData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error al enviar variable ${variable.nombre}: ${errorData.message || response.statusText}`);
        }
      }
      
      // Si se llega a este punto, todas las variables se enviaron correctamente
      setSuccess('Variables enviadas correctamente. Redirigiendo al editor de variables...');
      
      // Redirigir al componente Variables después de 2 segundos
      setTimeout(() => {
        navigate('/variables');
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar el formulario
  const reiniciarFormulario = () => {
    setFile(null);
    setParsedData(null);
    setDetectadas([]);
    setError('');
    setSuccess('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="carga-datos-container">
      <h2><FaUpload /> Carga de Datos para Lógica Difusa</h2>
      
      {error && <div className="error-message"><FaTimes /> {error}</div>}
      {success && <div className="success-message"><FaCheck /> {success}</div>}
      
      {/* Paso 1: Carga de archivo */}
      <div className="section">
        <h3>1. Selecciona un archivo CSV con tus datos</h3>
        <div className="file-upload">
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".csv"
            ref={fileInputRef}
            className="file-input"
          />
          <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
            Seleccionar archivo
          </button>
          {file && <span className="file-name">{file.name}</span>}
        </div>
      </div>
      
      {/* Paso 2: Vista previa de datos */}
      {parsedData && parsedData.length > 0 && (
        <div className="section">
          <h3>2. Vista previa de datos</h3>
          <div className="data-preview">
            <div className="preview-header">
              <span><FaTable /> Se han detectado {Object.keys(parsedData[0]).length} columnas y {parsedData.length} filas</span>
              <button className="detect-btn" onClick={detectarVariables}>
                Detectar Variables <FaEdit />
              </button>
            </div>
            
            {/* Tabla de vista previa */}
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(parsedData[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(parsedData[0]).map(key => (
                        <td key={`${idx}-${key}`}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <div className="more-rows">
                  ... y {parsedData.length - 5} filas más
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Paso 3: Configuración de variables */}
      {detectadas.length > 0 && (
        <div className="section">
          <h3>3. Configura las variables detectadas</h3>
          
          <div className="variables-detected">
            {detectadas.map((variable, index) => (
              <div key={index} className="variable-card">
                <div className="variable-header">
                  <h4>{variable.nombre}</h4>
                  <span className={`tag ${variable.esNumerica ? 'numeric' : 'categorical'}`}>
                    {variable.esNumerica ? 'Numérica' : 'Categórica'}
                  </span>
                </div>
                
                <div className="variable-details">
                  {variable.esNumerica ? (
                    <div className="range">
                      <span>Rango: [{variable.rango[0]}, {variable.rango[1]}]</span>
                    </div>
                  ) : (
                    <div className="categories">
                      <span>Valores: {variable.valoresUnicos.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="variable-controls">
                    <div className="control-group">
                      <label>Tipo Variable:</label>
                      <select 
                        value={variable.tipoVariable}
                        onChange={(e) => cambiarTipoVariable(index, e.target.value)}
                      >
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                      </select>
                    </div>
                    
                    <div className="control-group">
                      <label>Función:</label>
                      <select 
                        value={variable.tipo}
                        onChange={(e) => cambiarTipoFuncion(index, e.target.value)}
                      >
                        <option value="triangular">Triangular</option>
                        <option value="trapezoidal">Trapezoidal</option>
                        <option value="gaussiana">Gaussiana</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Paso 4: Acciones finales */}
      {detectadas.length > 0 && (
        <div className="section actions">
          <h3>4. Finalizar y enviar</h3>
          <div className="action-buttons">
            <button 
              className="btn-generate" 
              onClick={enviarAlBackend}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Generar Variables y Enviar'}
            </button>
            <button className="btn-reset" onClick={reiniciarFormulario}>
              Reiniciar
            </button>
          </div>
          <p className="info-text">
            <strong>Nota:</strong> Al enviar, se crearán automáticamente conjuntos difusos para cada variable. 
            Podrás modificarlos en detalle en el editor de variables.
          </p>
        </div>
      )}
    </div>
  );
};

export default CargaDatos;