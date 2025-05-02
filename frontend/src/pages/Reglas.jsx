import { useState, useEffect, useCallback } from 'react';
import '../styles/Reglas.css';

function Reglas() {
  // Estados principales
  const [variables, setVariables] = useState([]);
  const [outputVariables, setOutputVariables] = useState([]);
  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState({
    id: null,
    antecedentes: [],
    consecuentes: [],
    peso: 1.0,
    operador: 'AND'
  });

  // Estado de UI
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [editMode, setEditMode] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' o 'list'

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await fetch('http://localhost:8000/variables/');
        if (!response.ok) throw new Error('Error al cargar variables');
        const data = await response.json();
        setVariables(data);
       
        // Separar variables de entrada y salida
        setOutputVariables(data.filter(v => v.tipoVariable === 'salida'));
        
        // Inicializar la regla actual con todas las variables
        initializeCurrentRule(data, data.filter(v => v.tipoVariable === 'salida'));
      } catch (error) {
        console.error('Error al cargar las variables:', error);
        showMessage('Error al cargar las variables', 'error');
      }
    };

    fetchVariables();
  }, []);  // Solo se ejecuta una vez al montar el componente

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
      peso: 1.0,
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

  // Eliminar regla
  const handleDeleteRule = (index) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
   
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
   
    if (selectedRuleIndex === index) {
      resetCurrentRule();
    }
   
    showMessage('Regla eliminada', 'success');
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
   
    return `SI ${antecedentesText} ENTONCES ${consecuentesText} (${rule.peso})`;
  };

  return (
    <div className="reglas-container">
      <header className="reglas-header">
        <h1>Editor de Reglas Difusas</h1>
        <div className="tabs-navigation">
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <span className="tab-icon">✏️</span>
            {editMode ? 'Editar Regla' : 'Crear Regla'}
          </button>
          <button 
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <span className="tab-icon">📋</span>
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
            <div className="variables-panel antecedentes-panel">
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
          <div className="rule-preview-section">
            <h3><span className="step-number">3</span> Vista Previa</h3>
            <div className="rule-preview-box">
              {generateRuleText(currentRule)}
            </div>
          </div>
          
          {/* Configuración de peso */}
          <div className="weight-section">
            <h3><span className="step-number">4</span> Peso de la Regla</h3>
            <div className="weight-container">
              <div className="weight-slider">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentRule.peso}
                  onChange={(e) => setCurrentRule({ ...currentRule, peso: parseFloat(e.target.value) })}
                />
                <div className="weight-scale">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
              <div className="weight-value">{currentRule.peso.toFixed(1)}</div>
            </div>
            <p className="weight-description">
              <span className="weight-info-icon">ℹ️</span>
              El peso determina la influencia de esta regla (1.0 = máxima, 0.0 = mínima)
            </p>
          </div>
          
          
          
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
      )}
      
      {activeTab === 'list' && (
        <div className="rules-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">Lista de Reglas</h2>
            <div className="panel-actions">
              <button 
                className="add-rule-button"
                onClick={() => {
                  resetCurrentRule();
                  setActiveTab('create');
                }}
              >
                <span className="button-icon">+</span>
                Nueva Regla
              </button>
            </div>
          </div>
          
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
            <div className="rules-count">
              {rules.length} {rules.length === 1 ? 'regla' : 'reglas'} 
              {filterText && ` (mostrando ${filteredRules.length})`}
            </div>
          </div>
          
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
                      <div className="rule-weight">Peso: {rule.peso.toFixed(1)}</div>
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
        </div>
      )}
    </div>
  );
}

export default Reglas;