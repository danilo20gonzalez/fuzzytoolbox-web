import { useState, useEffect, useCallback } from 'react';
import '../styles/Reglas.css';
import { Link } from 'react-router-dom';
import { FaProjectDiagram, FaCogs, FaPlay, FaQuestion } from 'react-icons/fa';

function Reglas() {
  // Estados principales
  const [variables, setVariables] = useState([]);
  const [outputVariables, setOutputVariables] = useState([]);
  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState({
    id: null,
    antecedentes: [],
    consecuentes: [],
    operador: 'AND'
  });

  // Estado de UI
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [editMode, setEditMode] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' o 'list'
  const [generatedRules, setGeneratedRules] = useState([]);
  const [showGeneratedRulesEditor, setShowGeneratedRulesEditor] = useState(false);

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await fetch('http://localhost:8000/variables/');
        if (!response.ok) throw new Error('Error al cargar variables');
        const data = await response.json();
        setVariables(data);

        // Separar variables de entrada y salida
        const salidas = data.filter(v => v.tipoVariable === 'salida');
        setOutputVariables(salidas);

        // Inicializar la regla actual con todas las variables
        initializeCurrentRule(data, salidas);
      } catch (error) {
        console.error('Error al cargar las variables:', error);
        showMessage('Error al cargar las variables', 'error');
      }
    };

    const fetchReglas = async () => {
      try {
        const response = await fetch('http://localhost:8000/reglas/');
        if (!response.ok) throw new Error('Error al cargar reglas');
        const data = await response.json();
        if (Array.isArray(data)) {
          setRules(data);
        }
      } catch (error) {
        console.error('Error al cargar las reglas:', error);
        showMessage('Error al cargar las reglas', 'error');
      }
    };

    fetchVariables();
    fetchReglas();
  }, []);


  // Inicializar la regla actual
  const initializeCurrentRule = (inputVars, outputVars) => {
    const newAntecedentes = inputVars.map(variable => ({
      variable: variable.nombre,
      conjunto: '',
      negado: false
    }));

    const newConsecuentes = outputVars.map(variable => ({
      variable: variable.nombre,
      conjunto: '',
      negado: false
    }));

    setCurrentRule({
      id: null,
      antecedentes: newAntecedentes,
      consecuentes: newConsecuentes,
      operador: 'AND'
    });
  };

  // Resetear la regla actual
  const resetCurrentRule = useCallback(() => {
    initializeCurrentRule(variables, outputVariables);
    setEditMode(false);
    setSelectedRuleIndex(null);
  }, [variables, outputVariables]);

  // Mostrar mensaje
  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('info');
    }, 3000);
  };

  // Actualizar antecedente
  const updateAntecedente = (index, field, value) => {
    const updatedAntecedentes = [...currentRule.antecedentes];
    updatedAntecedentes[index] = {
      ...updatedAntecedentes[index],
      [field]: value
    };

    setCurrentRule({
      ...currentRule,
      antecedentes: updatedAntecedentes
    });
  };

  // Actualizar consecuente
  const updateConsecuente = (index, field, value) => {
    const updatedConsecuentes = [...currentRule.consecuentes];
    updatedConsecuentes[index] = {
      ...updatedConsecuentes[index],
      [field]: value
    };

    setCurrentRule({
      ...currentRule,
      consecuentes: updatedConsecuentes
    });
  };

  // Validar regla
  const validateRule = () => {
    // Verificar que al menos un antecedente esté definido
    const hasValidAntecedentes = currentRule.antecedentes.some(
      ant => ant.conjunto && ant.conjunto !== ''
    );

    if (!hasValidAntecedentes) {
      showMessage('La regla debe tener al menos un antecedente definido', 'error');
      return false;
    }

    // Verificar que al menos un consecuente esté definido
    const hasValidConsecuentes = currentRule.consecuentes.some(
      cons => cons.conjunto && cons.conjunto !== ''
    );

    if (!hasValidConsecuentes) {
      showMessage('La regla debe tener al menos un consecuente definido', 'error');
      return false;
    }

    return true;
  };

  // Guardar regla
  const handleSaveRule = () => {
    if (!validateRule()) return;

    // Filtrar antecedentes y consecuentes vacíos
    const filteredAntecedentes = currentRule.antecedentes.filter(
      item => item.conjunto && item.conjunto !== ''
    );

    const filteredConsecuentes = currentRule.consecuentes.filter(
      item => item.conjunto && item.conjunto !== ''
    );

    const updatedRule = {
      ...currentRule,
      antecedentes: filteredAntecedentes,
      consecuentes: filteredConsecuentes
    };

    let updatedRules = [...rules];

    if (editMode && selectedRuleIndex !== null) {
      // Actualizar regla existente
      updatedRules[selectedRuleIndex] = {
        ...updatedRule,
        id: rules[selectedRuleIndex].id
      };
      showMessage('Regla actualizada correctamente', 'success');
    } else {
      // Crear nueva regla
      updatedRules.push({
        ...updatedRule,
        id: Date.now()
      });
      showMessage('Regla creada correctamente', 'success');
    }

    setRules(updatedRules);
    resetCurrentRule();

    // Cambiar a la pestaña de lista de reglas después de guardar
    setActiveTab('list');

    // 👉 Aquí es donde debes poner el llamado para enviar al backend
    sendRulesToBackend(updatedRules);
  };

  // Editar regla existente
  const handleEditRule = (index) => {
    const rule = rules[index];

    // Crear antecedentes completos (incluyendo variables vacías)
    const fullAntecedentes = variables.map(variable => {
      const existingAnt = rule.antecedentes.find(
        ant => ant.variable === variable.nombre
      );

      return existingAnt || {
        variable: variable.nombre,
        conjunto: '',
        negado: false
      };
    });

    // Crear consecuentes completos
    const fullConsecuentes = outputVariables.map(variable => {
      const existingCons = rule.consecuentes.find(
        cons => cons.variable === variable.nombre
      );

      return existingCons || {
        variable: variable.nombre,
        conjunto: '',
        negado: false
      };
    });

    setCurrentRule({
      ...rule,
      antecedentes: fullAntecedentes,
      consecuentes: fullConsecuentes
    });

    setEditMode(true);
    setSelectedRuleIndex(index);
    setActiveTab('create');
    showMessage('Regla cargada para edición', 'info');
  };

  const handleDeleteRule = async (index) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;

    // Obtener la regla a eliminar por su ID antes de modificar el estado local
    // Necesitas acceder a la regla específica por su índice para obtener su ID
    const ruleToDelete = rules[index];

    if (!ruleToDelete || ruleToDelete.id === undefined) {
      showMessage('Error: No se pudo encontrar el ID de la regla a eliminar.', 'error');
      return;
    }

    try {
      // Llama al endpoint DELETE de tu API
      const response = await fetch(`http://localhost:8000/reglas/${ruleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        // En este caso no se necesita body para un DELETE por ID
      });

      if (!response.ok) {
        // Si la respuesta no es OK (ej. 404 Not Found, 500 Internal Server Error)
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar la regla en el servidor.');
      }

      // Si la eliminación en el backend fue exitosa, actualiza el estado local
      const updatedRules = [...rules];
      updatedRules.splice(index, 1);
      setRules(updatedRules);

      if (selectedRuleIndex === index) {
        resetCurrentRule();
      }

      showMessage('Regla eliminada correctamente', 'success');

    } catch (error) {
      console.error('Error al eliminar la regla:', error);
      showMessage(`Error al eliminar la regla: ${error.message}`, 'error');
    }
  };
  const handleDeleteAllRules = async () => {
    if (!window.confirm('¿Estás seguro de eliminar TODAS las reglas? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const url = `http://localhost:8000/reglas/todas`;
      const options = {
        method: 'DELETE',
        // <<== ¡CONFIRMA QUE NO HAY HEADERS AQUÍ! ==>>
      };

      console.log("DEBUG: Enviando solicitud DELETE:", url, options); // <<== AÑADE ESTA LÍNEA

      const response = await fetch(url, options);

      if (!response.ok) {
        // ... (tu lógica de manejo de errores mejorada) ...
        let errorMessage = 'Error al eliminar todas las reglas en el servidor.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch (jsonError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setRules([]);
      resetCurrentRule();
      showMessage('Todas las reglas han sido eliminadas correctamente', 'success');

    } catch (error) {
      console.error('Error al eliminar todas las reglas:', error);
      showMessage(`Error al eliminar todas las reglas: ${error.message}`, 'error');
    }
  };
  // Cancelar edición
  const handleCancelEdit = () => {
    resetCurrentRule();
    showMessage('Edición cancelada', 'info');
  };

  // Obtener conjuntos para una variable
  const getConjuntosForVariable = (variableName) => {
    const variable =
      variables.find(v => v.nombre === variableName) ||
      outputVariables.find(v => v.nombre === variableName);

    if (!variable || !variable.conjuntos) return [];

    // Map the conjunto objects to just their names
    return variable.conjuntos.map(conjunto =>
      typeof conjunto === 'object' ? conjunto.nombre : conjunto
    );
  };

  // Filtrar reglas según texto de búsqueda
  const filteredRules = rules.filter(rule => {
    if (!filterText) return true;

    const searchText = filterText.toLowerCase();

    // Buscar en antecedentes
    const matchesAntecedente = rule.antecedentes.some(
      ant => ant.variable.toLowerCase().includes(searchText) ||
        ant.conjunto.toLowerCase().includes(searchText)
    );

    // Buscar en consecuentes
    const matchesConsecuente = rule.consecuentes.some(
      cons => cons.variable.toLowerCase().includes(searchText) ||
        cons.conjunto.toLowerCase().includes(searchText)
    );

    return matchesAntecedente || matchesConsecuente;
  });

  // Generar texto legible de la regla
  const generateRuleText = (rule) => {
    const antecedentesText = rule.antecedentes
      .filter(ant => ant.conjunto !== '')
      .map(ant => {
        const negation = ant.negado ? 'NO ' : '';
        return `${ant.variable} es ${negation}${ant.conjunto}`;
      })
      .join(` ${rule.operador} `);

    const consecuentesText = rule.consecuentes
      .filter(cons => cons.conjunto !== '')
      .map(cons => {
        const negation = cons.negado ? 'NO ' : '';
        return `${cons.variable} es ${negation}${cons.conjunto}`;
      })
      .join(' Y ');

    return `SI ${antecedentesText} ENTONCES ${consecuentesText}`;
  };


  const sendRulesToBackend = async (reglasParaGuardar) => {
    try {
      const response = await fetch('http://localhost:8000/reglas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reglasParaGuardar)
      });

      if (!response.ok) throw new Error('Error al guardar las reglas');
      showMessage('Reglas guardadas en el backend', 'success');
    } catch (error) {
      console.error(error);
      showMessage('No se pudieron guardar las reglas', 'error');
    }
  };

  // Generar reglas automáticas
  // Esta función genera reglas automáticas basadas en las variables de entrada
  const generateAutomaticRules = () => {
    const nuevasReglasGeneradas = [];
    const variablesEntrada = variables.filter(v => v.tipoVariable !== 'salida');

    // Si no hay variables de entrada, no generamos nada
    if (variablesEntrada.length === 0) {
      setShowGeneratedRulesEditor(true);
      setGeneratedRules([]);
      return;
    }

    // Obtenemos todos los conjuntos posibles para cada variable de entrada
    const conjuntosPorVariable = variablesEntrada.map(v => getConjuntosForVariable(v.nombre));

    // Función para generar todas las combinaciones recursivamente
    const generarCombinaciones = (index, currentAntecedentes) => {
      if (index === variablesEntrada.length) {
        if (currentAntecedentes.length > 0) {
          nuevasReglasGeneradas.push({
            id: Date.now() + nuevasReglasGeneradas.length,
            antecedentes: currentAntecedentes,
            consecuentes: outputVariables.map(ov => ({ variable: ov.nombre, conjunto: '', negado: false })),
            operador: 'AND' // Puedes ajustar el operador si lo deseas
          });
        }
        return;
      }

      const variableActual = variablesEntrada[index];
      const conjuntos = conjuntosPorVariable[index];

      // Incluimos la opción de no seleccionar un conjunto para esta variable
      generarCombinaciones(index + 1, [...currentAntecedentes]);

      conjuntos.forEach(conjunto => {
        generarCombinaciones(index + 1, [...currentAntecedentes, { variable: variableActual.nombre, conjunto: conjunto, negado: false }]);
      });
    };

    generarCombinaciones(0, []);
    setGeneratedRules(nuevasReglasGeneradas);
    setShowGeneratedRulesEditor(true);
  };

  const handleCloseGeneratedRulesEditor = () => {
    setShowGeneratedRulesEditor(false);
    setGeneratedRules([]);
  };
  const handleGeneratedRuleConsecuentChange = (ruleIndex, outputIndex, value) => {
    const updatedGeneratedRules = [...generatedRules];
    updatedGeneratedRules[ruleIndex].consecuentes[outputIndex].conjunto = value;
    setGeneratedRules(updatedGeneratedRules);
  };

  const handleGeneratedRuleConsecuentNegationChange = (ruleIndex, outputIndex, checked) => {
    const updatedGeneratedRules = [...generatedRules];
    updatedGeneratedRules[ruleIndex].consecuentes[outputIndex].negado = checked;
    setGeneratedRules(updatedGeneratedRules);
  };

  const saveGeneratedRules = () => {
    const rulesToSave = generatedRules.filter(rule => rule.consecuentes.some(cons => cons.conjunto !== ''));
    setRules([...rules, ...rulesToSave]);
    setShowGeneratedRulesEditor(false);
    setGeneratedRules([]);
    showMessage(`${rulesToSave.length} reglas automáticas guardadas.`, 'success');
    sendRulesToBackend([...rules, ...rulesToSave]);
  };

  ///////////////////////////////



  return (
    <div className="reglas-container">
      <div className="help-button-container">
        <Link to="/manual/reglas" className="help-button">
          <FaQuestion />
        </Link>
      </div>
      <h1>Editor de Reglas Difusas</h1>
      <header className="reglas-header">

        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <span className="tab-icon">1.</span>
            {editMode ? 'Editar Regla' : 'Crear Regla'}
          </button>
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <span className="tab-icon">2.</span>
            Lista de Reglas
          </button>

        </div>
      </header>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {activeTab === 'create' && (
        <div className="rule-creator-panel">
          <h2 className="panel-title">{editMode ? 'Editar Regla' : 'Crear Nueva Regla'}</h2>

          <div className="rule-builder">
            {/* Panel de Variables de Entrada (Antecedentes) */}
            <div className="variables-panel consecuentes-panel">
              <div className="panel-header">
                <h3><span className="step-number">1</span> Variables de Entrada (SI)</h3>
                <p className="panel-description">Selecciona las condiciones de entrada</p>
              </div>

              <div className="panel-content">
                <div className="operator-selector">
                  <span className="operator-label">Operador:</span>
                  <div className="operator-options">
                    <label className={`operator-option ${currentRule.operador === 'AND' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="operador"
                        value="AND"
                        checked={currentRule.operador === 'AND'}
                        onChange={() => setCurrentRule({ ...currentRule, operador: 'AND' })}
                      />
                      <span className="operator-text">Y (AND)</span>
                    </label>
                    <label className={`operator-option ${currentRule.operador === 'OR' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="operador"
                        value="OR"
                        checked={currentRule.operador === 'OR'}
                        onChange={() => setCurrentRule({ ...currentRule, operador: 'OR' })}
                      />
                      <span className="operator-text">O (OR)</span>
                    </label>
                  </div>
                </div>

                <div className="antecedentes-container">
                  {variables
                    .filter(v => v.tipoVariable !== 'salida')
                    .map((variable, variableIndex) => {
                      const antIndex = currentRule.antecedentes.findIndex(
                        ant => ant.variable === variable.nombre
                      );
                      if (antIndex === -1) return null;

                      const antecedente = currentRule.antecedentes[antIndex];
                      const hasConjunto = antecedente.conjunto !== '';

                      return (
                        <div
                          className={`rule-input-card ${hasConjunto ? 'active' : ''}`}
                          key={`ant-${variableIndex}`}
                        >
                          <div className="card-header">
                            <span className="variable-name">{antecedente.variable}</span>
                          </div>
                          <div className="card-content">
                            <select
                              className="conjunto-select"
                              value={antecedente.conjunto}
                              onChange={(e) => updateAntecedente(antIndex, 'conjunto', e.target.value)}
                            >
                              <option value="">-- Seleccionar --</option>
                              {getConjuntosForVariable(antecedente.variable).map((conjunto, i) => (
                                <option key={i} value={conjunto}>{conjunto}</option>
                              ))}
                            </select>

                            <label className="negation-toggle">
                              <input
                                type="checkbox"
                                checked={antecedente.negado}
                                onChange={(e) => updateAntecedente(antIndex, 'negado', e.target.checked)}
                                disabled={!hasConjunto}
                              />
                              <span className="toggle-label">Negar</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Panel de Variables de Salida (Consecuentes) */}
            <div className="variables-panel consecuentes-panel">
              <div className="panel-header">
                <h3><span className="step-number">2</span> Variables de Salida (ENTONCES)</h3>
                <p className="panel-description">Selecciona los resultados esperados</p>
              </div>

              <div className="panel-content">
                <div className="consecuentes-container">
                  {outputVariables.map((variable, variableIndex) => {
                    const consIndex = currentRule.consecuentes.findIndex(
                      cons => cons.variable === variable.nombre
                    );
                    if (consIndex === -1) return null;

                    const consecuente = currentRule.consecuentes[consIndex];
                    const hasConjunto = consecuente.conjunto !== '';

                    return (
                      <div
                        className={`rule-input-card ${hasConjunto ? 'active' : ''}`}
                        key={`cons-${variableIndex}`}
                      >
                        <div className="card-header">
                          <span className="variable-name">{consecuente.variable}</span>
                        </div>
                        <div className="card-content">
                          <select
                            className="conjunto-select"
                            value={consecuente.conjunto}
                            onChange={(e) => updateConsecuente(consIndex, 'conjunto', e.target.value)}
                          >
                            <option value="">-- Seleccionar --</option>
                            {getConjuntosForVariable(consecuente.variable).map((conjunto, i) => (
                              <option key={i} value={conjunto}>{conjunto}</option>
                            ))}
                          </select>

                          <label className="negation-toggle">
                            <input
                              type="checkbox"
                              checked={consecuente.negado}
                              onChange={(e) => updateConsecuente(consIndex, 'negado', e.target.checked)}
                              disabled={!hasConjunto}
                            />
                            <span className="toggle-label">Negar</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa de la regla */}

          <div className="rule-preview-section consecuentes-panel">
            <div className="panel-header">
              <h3><span className="step-number">3</span> Vista Previa</h3>
              <button className='primary-button' onClick={generateAutomaticRules}>
                + Crear Reglas Automaticas
              </button>
            </div>
            <div className="panel-header">
              {generateRuleText(currentRule)}
            </div>
            {showGeneratedRulesEditor && (
              <div className="generated-rules-editor">
                <h3>Editar Reglas Generadas Automáticamente</h3>
                <p>Selecciona los consecuentes para cada regla generada:</p>
                <div className="generated-rules-list">
                  {generatedRules.map((rule, index) => (
                    <div key={rule.id} className="generated-rule-item">
                      <h4>Regla {index + 1}</h4>
                      <div className="antecedente-preview">
                        <h5>Si:</h5>
                        {rule.antecedentes.map((ant, antIndex) => (
                          <span key={`${ant.variable}-${ant.conjunto}-${antIndex}`} className="antecedente-label">
                            {ant.variable} es {ant.negado ? 'NO ' : ''}{ant.conjunto}
                            {antIndex < rule.antecedentes.length - 1 && ` ${rule.operador} `}
                          </span>
                        ))}
                      </div>
                      <div className="consecuentes-selector">
                        <h5>Entonces:</h5>
                        {outputVariables.map((outputVariable, outputIndex) => {
                          const consIndex = rule.consecuentes.findIndex(cons => cons.variable === outputVariable.nombre);
                          const consecuente = rule.consecuentes[consIndex];
                          return (
                            <div key={outputVariable.nombre} className="consecuente-input">
                              <label>{outputVariable.nombre} es:</label>
                              <select
                                value={consecuente.conjunto}
                                onChange={(e) => handleGeneratedRuleConsecuentChange(index, outputIndex, e.target.value)}
                              >
                                <option value="">-- Seleccionar --</option>
                                {getConjuntosForVariable(outputVariable.nombre).map((conjunto, i) => (
                                  <option key={i} value={conjunto}>{conjunto}</option>
                                ))}
                              </select>
                              <label className="negation-toggle">
                                <input
                                  type="checkbox"
                                  checked={consecuente.negado}
                                  onChange={(e) => handleGeneratedRuleConsecuentNegationChange(index, outputIndex, e.target.checked)}
                                  disabled={!consecuente.conjunto}
                                />
                                Negar
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="action-buttons">
                  <button className="primary-button" onClick={saveGeneratedRules}>
                    Guardar Reglas Seleccionadas
                  </button>
                  <button className="secondary-button" onClick={handleCloseGeneratedRulesEditor}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {/* Botones de acción */}
            <div className="action-buttons">
              <button className="primary-button" onClick={handleSaveRule}>
                {editMode ? 'Actualizar Regla' : 'Guardar Regla'}
              </button>
              {editMode && (
                <button className="secondary-button" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>



      )}

      {activeTab === 'list' && (
        <div className="rules-list-panel">
          <h2 className="panel-title">Lista de Reglas</h2>
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar reglas..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="search-input"
              />
              {filterText && (
                <button
                  className="clear-search"
                  onClick={() => setFilterText('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="rules-count">
            {rules.length} {rules.length === 1 ? 'regla' : 'reglas'}
            {filterText && ` (mostrando ${filteredRules.length})`}
          </div>
          <br />
          <div className="rules-list">

            {filteredRules.length === 0 ? (
              <div className="empty-state">
                {rules.length === 0
                  ? (
                    <>
                      <div className="empty-icon">📝</div>
                      <p>No hay reglas definidas.</p>
                      <button
                        className="create-first-rule"
                        onClick={() => setActiveTab('create')}
                      >
                        Crear primera regla
                      </button>
                    </>
                  )
                  : (
                    <>
                      <div className="empty-icon">🔍</div>
                      <p>No hay resultados para tu búsqueda.</p>
                    </>
                  )
                }
              </div>
            ) : (
              <div className="rules-grid">
                {filteredRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className={`rule-card ${selectedRuleIndex === index ? 'selected' : ''}`}
                  >
                    <div className="rule-card-header">
                      <div className="rule-number">Regla {index + 1}</div>
                    </div>
                    <div className="rule-card-content">
                      <div className="rule-text">{generateRuleText(rule)}</div>
                    </div>
                    <div className="rule-card-footer">
                      <button
                        className="rule-card-button edit"
                        onClick={() => handleEditRule(index)}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        className="rule-card-button delete"
                        onClick={() => handleDeleteRule(index)}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <br />
          {rules.length >= 2 && ( // El botón solo se renderiza si hay 2 o más reglas
            <button onClick={handleDeleteAllRules} className="all_rules_delete">
              Eliminar Todas las Reglas
            </button>
          )}
        </div>

      )}

      <div className="panel-actions">
        <ul className="nav-resultados">
          <li>
            <Link to="/simulador"><FaPlay />  Ir a los resultados →</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Reglas;