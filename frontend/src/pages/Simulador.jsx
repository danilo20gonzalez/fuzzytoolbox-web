import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import '../styles/Resultados.css'

function Simulador() {
  const [inputVars, setInputVars] = useState([]);
  const [outputVars, setOutputVars] = useState([]);
  const [allVars, setAllVars] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [resultados, setResultados] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [pertenenciasEntrada, setPertenenciasEntrada] = useState({});
  const [cargando, setCargando] = useState(false);
  const [funcionesMembresia, setFuncionesMembresia] = useState({});
  const [mostrarTodos, setMostrarTodos] = useState({}); // Para controlar qué variables muestran todos los conjuntos juntos

  // Colores para gráficas
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"];

  // Cargar variables
  useEffect(() => {
    setCargando(true);
    fetch("http://localhost:8000/variables/")
      .then(res => res.json())
      .then(data => {
        const entradas = data.filter(v => v.tipoVariable === "entrada");
        const salidas = data.filter(v => v.tipoVariable === "salida");

        // Crear un objeto con todas las variables para referencia fácil
        const varsObj = {};
        data.forEach(v => {
          varsObj[v.nombre] = v;
        });

        setInputVars(entradas);
        setOutputVars(salidas);
        setAllVars(varsObj);

        // Inicializar inputValues
        const inicial = {};
        entradas.forEach(v => {
          inicial[v.nombre] = v.rango[0];  // valor mínimo como predeterminado
        });
        setInputValues(inicial);

        // Inicializar el estado de mostrarTodos
        const mostrarTodosInicial = {};
        entradas.forEach(v => {
          mostrarTodosInicial[v.nombre] = false; // Por defecto, mostrar gráficos separados
        });
        setMostrarTodos(mostrarTodosInicial);

        // Generar funciones de membresía para visualización
        generarFuncionesMembresia(varsObj);
      })
      .catch(() => setMensaje("Error al cargar variables"))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/entrada_pendiente/")
        .then(res => res.json())
        .then(data => {
          if (data.entradas) {
            setInputValues(prev => {
              const nuevos = {};
              for (const [clave, valor] of Object.entries(data.entradas)) {
                nuevos[clave] = parseFloat(valor);
              }
              return { ...prev, ...nuevos };
            });
          }
        })
        .catch((err) => {
          console.error("Error obteniendo entrada pendiente:", err);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generar datos para las funciones de membresía
  const generarFuncionesMembresia = (variables) => {
    const funciones = {};

    Object.values(variables).forEach(variable => {
      const { nombre, rango, conjuntos } = variable;
      const min = rango[0];
      const max = rango[1];
      const paso = (max - min) / 100;

      const datosConjuntos = [];

      // Generar 100 puntos para cada rango
      for (let x = min; x <= max; x += paso) {
        const punto = { x };

        // Calcular valor de pertenencia para cada conjunto
        conjuntos.forEach(conjunto => {
          const { nombre: nombreConjunto, puntos, tipo: tipoConjunto } = conjunto;
          const tipo = tipoConjunto || variable.tipo; // Usa el tipo del conjunto si existe, sino el de la variable

          let valor = 0;

          if (tipo === "triangular") {
            // Función triangular: a, b, c
            if (x <= puntos[0] || x >= puntos[2]) {
              valor = 0;
            } else if (x <= puntos[1]) {
              valor = (x - puntos[0]) / (puntos[1] - puntos[0]);
            } else {
              valor = (puntos[2] - x) / (puntos[2] - puntos[1]);
            }
          } else if (tipo === "trapezoidal") {
            // Función trapezoidal: a, b, c, d
            if (x <= puntos[0] || x >= puntos[3]) {
              valor = 0;
            } else if (x >= puntos[1] && x <= puntos[2]) {
              valor = 1;
            } else if (x < puntos[1]) {
              valor = (x - puntos[0]) / (puntos[1] - puntos[0]);
            } else {
              valor = (puntos[3] - x) / (puntos[3] - puntos[2]);
            }
          } else if (tipo === "gaussiana") {
            // Función gaussiana: media, desviación
            const media = puntos[0];
            const desv = puntos[1];
            valor = Math.exp(-Math.pow((x - media) / desv, 2) / 2);
          }

          punto[nombreConjunto] = valor;
        });

        datosConjuntos.push(punto);
      }

      funciones[nombre] = datosConjuntos;
    });

    setFuncionesMembresia(funciones);
  };

  // Manejar cambios en los inputs
  const handleChange = (nombre, valor) => {
    setInputValues(prev => ({
      ...prev,
      [nombre]: parseFloat(valor)
    }));

    // Calcular pertenencias para este valor
    calcularPertenenciaVariable(nombre, parseFloat(valor));
  };

  // Calcular pertenencia de una variable
  const calcularPertenenciaVariable = async (nombre, valor) => {
    try {
      const response = await fetch(`http://localhost:8000/variables/${nombre}/calcular_pertinencia?valor=${valor}`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Error al calcular pertenencia");
      const data = await response.json();

      setPertenenciasEntrada(prev => ({
        ...prev,
        [nombre]: data
      }));
    } catch (error) {
      console.error("Error al calcular pertenencia:", error);
    }
  };

  // Calcular pertenencias para todas las variables de entrada
  const calcularTodasPertenencias = async () => {
    const pertenencias = {};
    for (const [nombre, valor] of Object.entries(inputValues)) {
      try {
        const response = await fetch(`http://localhost:8000/variables/${nombre}/calcular_pertinencia?valor=${valor}`, {
          method: "POST"
        });

        if (response.ok) {
          const data = await response.json();
          pertenencias[nombre] = data;
        }
      } catch (error) {
        console.error(`Error al calcular pertenencia para ${nombre}:`, error);
      }
    }

    setPertenenciasEntrada(pertenencias);
  };

  // Enviar para evaluación
  const evaluarSistemaDifuso = async () => {
    setCargando(true);
    setMensaje("Evaluando sistema difuso...");

    try {
      // Primero calculamos todas las pertenencias
      await calcularTodasPertenencias();

      const response = await fetch("http://localhost:8000/evaluar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputValues)
      });

      if (!response.ok) throw new Error("Error al evaluar");
      const data = await response.json();
      setResultados(data);
      setMensaje("Evaluación realizada con éxito");
    } catch (error) {
      setMensaje("Error al evaluar el sistema difuso");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Formatear los datos para la visualización de pertenencias
  const formatearDatosPertenencia = (variable, pertenencias) => {
    if (!pertenencias) return [];

    return Object.entries(pertenencias).map(([conjunto, valor]) => ({
      conjunto,
      valor: parseFloat(valor.toFixed(2))
    }));
  };

  // Crear datos para la línea de referencia en gráficas de funciones de membresía
  const obtenerLineaReferencia = (nombreVar) => {
    if (!inputValues[nombreVar]) return null;
    return inputValues[nombreVar];
  };

  // Alternar entre mostrar todos los conjuntos juntos o separados
  const toggleMostrarTodos = (nombreVar) => {
    setMostrarTodos(prev => ({
      ...prev,
      [nombreVar]: !prev[nombreVar]
    }));
  };

  return (
    <div className="evaluador-container">
      <h1>Simulador de Sistema Difuso</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <div className="panel-entradas">
        <h3>Variables de Entrada</h3>

        <div className="contenedor-entra">
          {inputVars.map((variable, index) => (
            <div key={variable.nombre} className="variable-entrada">
              <div className="control-input">
                <label>{variable.nombre} ({variable.rango[0]} - {variable.rango[1]}): </label>
                <input
                  type="number"
                  value={inputValues[variable.nombre] || ""}
                  onChange={(e) => handleChange(variable.nombre, e.target.value)}
                  min={variable.rango[0]}
                  max={variable.rango[1]}
                  step="0.1"
                />
                <input
                  type="range"
                  value={inputValues[variable.nombre] || variable.rango[0]}
                  onChange={(e) => handleChange(variable.nombre, e.target.value)}
                  min={variable.rango[0]}
                  max={variable.rango[1]}
                  step="0.1"
                />
                <button
                  onClick={() => toggleMostrarTodos(variable.nombre)}
                  className="boton-toggle"
                >
                  {mostrarTodos[variable.nombre] ? "Mostrar Separados" : "Mostrar Todos Juntos"}
                </button>
              </div>

              {/* Gráfica de función de membresía - UNIFICADA (opcional) */}
              {funcionesMembresia[variable.nombre] && mostrarTodos[variable.nombre] && (
                <div className="grafica-membresia">
                  <h4>Todos los conjuntos de {variable.nombre}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={funcionesMembresia[variable.nombre]}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        domain={[variable.rango[0], variable.rango[1]]}
                        type="number"
                        allowDecimals={true}
                      />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      {variable.conjuntos.map((conjunto, i) => (
                        <Line
                          key={conjunto.nombre}
                          type="monotone"
                          dataKey={conjunto.nombre}
                          stroke={colors[i % colors.length]}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                      {inputValues[variable.nombre] && (
                        <ReferenceLine
                          x={inputValues[variable.nombre]}
                          stroke="red"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          label={{ value: inputValues[variable.nombre], position: 'top' }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gráficas SEPARADAS por conjunto */}
              {funcionesMembresia[variable.nombre] && !mostrarTodos[variable.nombre] && (
                <div className="graficas-por-conjunto">
                  <h4>Conjuntos de {variable.nombre}</h4>
                  <div className="grid-graficas">
                    {variable.conjuntos.map((conjunto, i) => (
                      <div key={conjunto.nombre} className="grafica-conjunto">
                        <h5>{conjunto.nombre}</h5>
                        <ResponsiveContainer width="100%" height={150}>
                          <LineChart
                            data={funcionesMembresia[variable.nombre]}
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="x"
                              domain={[variable.rango[0], variable.rango[1]]}
                              type="number"
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey={conjunto.nombre}
                              stroke={colors[i % colors.length]}
                              dot={false}
                              strokeWidth={2}
                            />
                            {inputValues[variable.nombre] && (
                              <ReferenceLine
                                x={inputValues[variable.nombre]}
                                stroke="red"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                label={{
                                  value: inputValues[variable.nombre],
                                  position: 'top',
                                  fontSize: 10
                                }}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>

                        {/* Mostrar valor de pertenencia para este conjunto */}
                        {pertenenciasEntrada[variable.nombre] && (
                          <div className="valor-pertenencia-individual">
                            Pertenencia: <strong>{(pertenenciasEntrada[variable.nombre][conjunto.nombre] || 0).toFixed(2)}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pertenencias calculadas - Barras */}
              {pertenenciasEntrada[variable.nombre] && (
                <div className="pertenencias-calculadas">
                  <h4>Pertenencias</h4>
                  <div className="barras-pertenencia">
                    {Object.entries(pertenenciasEntrada[variable.nombre]).map(([conjunto, valor], i) => (
                      <div key={conjunto} className="barra-container">
                        <div className="barra-label">{conjunto}</div>
                        <div className="barra-valor" style={{
                          width: `${valor * 100}%`,
                          backgroundColor: colors[i % colors.length]
                        }}>
                          {valor.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={evaluarSistemaDifuso}
          disabled={cargando}
          className="boton-evaluar"
        >
          {cargando ? "Evaluando..." : "Evaluar Sistema Difuso"}
        </button>
      </div>

      {resultados && (
        <div className="panel-resultados">
          <h3>Resultados de la Evaluación</h3>

          <div className="valores-salida">
            {/* Modificado: Mostrar todas las variables de salida */}
            {outputVars.map((variable) => {
              const valor = resultados[variable.nombre];

              // Solo mostrar si tenemos un resultado para esta variable
              if (valor === undefined) return null;

              return (
                <div key={variable.nombre} className="resultado-variable">
                  <h4>{variable.nombre}</h4>
                  <div className="valor-resultado">{valor.toFixed(2)}</div>

                  {/* Gráfica para variable de salida */}
                  {funcionesMembresia[variable.nombre] && (
                    <div className="grafica-resultado">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart
                          data={funcionesMembresia[variable.nombre]}
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="x"
                            domain={[variable.rango[0], variable.rango[1]]}
                            type="number"
                          />
                          <YAxis domain={[0, 1]} />
                          <Tooltip />
                          <Legend />
                          {variable.conjuntos.map((conjunto, i) => (
                            <Line
                              key={conjunto.nombre}
                              type="monotone"
                              dataKey={conjunto.nombre}
                              stroke={colors[i % colors.length]}
                              dot={false}
                            />
                          ))}
                          <ReferenceLine
                            x={valor}
                            stroke="red"
                            strokeWidth={2}
                            label={{ value: valor.toFixed(2), position: 'top' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulador;