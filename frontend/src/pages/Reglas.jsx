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
  const [editMode, setEditMode] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(null);
  const [filterText, setFilterText] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    // Simulación de variables y conjuntos cargados
    const demoInputVars = [
      {
        id: 1,
        nombre: 'Temperatura',
        conjuntos: ['Frío', 'Templado', 'Caliente']
      },
      {
        id: 2,
        nombre: 'Humedad',
        conjuntos: ['Baja', 'Media', 'Alta']
      }
    ];
    
    const demoOutputVars = [
      {
        id: 3,
        nombre: 'Ventilador',
        conjuntos: ['Apagado', 'Baja', 'Media', 'Alta']
      }
    ];
    
    const demoRules = [
      {
        id: 1,
        antecedentes: [
          { variable: 'Temperatura', conjunto: 'Caliente', negado: false },
          { variable: 'Humedad', conjunto: 'Alta', negado: false }
        ],
        consecuentes: [
          { variable: 'Ventilador', conjunto: 'Alta', negado: false }
        ],
        peso: 1.0,
        operador: 'AND'
      }
    ];
    
    setVariables(demoInputVars);
    setOutputVariables(demoOutputVars);
    setRules(demoRules);
    
    // Inicializar regla actual
    resetCurrentRule(demoInputVars, demoOutputVars);
  }, []);
  
  // Resetear la regla actual
  const resetCurrentRule = useCallback((inputVars, outputVars) => {
    const inputs = inputVars || variables;
    const outputs = outputVars || outputVariables;
    
    const newAntecedentes = inputs.map(variable => ({
      variable: variable.nombre,
      conjunto: '',
      negado: false
    }));
    
    const newConsecuentes = outputs.map(variable => ({
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
    
    setEditMode(false);
    setSelectedRuleIndex(null);
  }, [variables, outputVariables]);
  
  // Mostrar mensaje
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
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
      showMessage('La regla debe tener al menos un antecedente definido');
      return false;
    }
    
    // Verificar que al menos un consecuente esté definido
    const hasValidConsecuentes = currentRule.consecuentes.some(
      cons => cons.conjunto && cons.conjunto !== ''
    );
    
    if (!hasValidConsecuentes) {
      showMessage('La regla debe tener al menos un consecuente definido');
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
      showMessage('Regla actualizada correctamente');
    } else {
      // Crear nueva regla
      updatedRules.push({
        ...updatedRule,
        id: Date.now()
      });
      showMessage('Regla creada correctamente');
    }
    
    setRules(updatedRules);
    resetCurrentRule();
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
    showMessage('Regla cargada para edición');
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
    
    showMessage('Regla eliminada');
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    resetCurrentRule();
    showMessage('Edición cancelada');
  };
  
  // Obtener conjuntos para una variable
  const getConjuntosForVariable = (variableName) => {
    const variable = 
      variables.find(v => v.nombre === variableName) || 
      outputVariables.find(v => v.nombre === variableName);
    
    return variable ? variable.conjuntos : [];
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
      <h1>Editor de Reglas Difusas</h1>
      
      {message && <div className="message">{message}</div>}
      
      <div className="main-content">
        {/* Editor de reglas */}
        <div className="rule-editor">
          <h2>{editMode ? 'Editar Regla' : 'Nueva Regla'}</h2>
          
          <div className="editor-section">
            <h3>SI</h3>
            
            {currentRule.antecedentes.map((antecedente, index) => {
              const conjuntos = getConjuntosForVariable(antecedente.variable);
              
              return (
                <div className="rule-row" key={`ant-${index}`}>
                  <div className="variable-name">{antecedente.variable}</div>
                  
                  <div className="condition-controls">
                    <label className="negation">
                      <input
                        type="checkbox"
                        checked={antecedente.negado}
                        onChange={(e) => updateAntecedente(index, 'negado', e.target.checked)}
                      />
                      NO
                    </label>
                    
                    <select
                      value={antecedente.conjunto}
                      onChange={(e) => updateAntecedente(index, 'conjunto', e.target.value)}
                    >
                      <option value="">-- No usado --</option>
                      {conjuntos.map((conjunto, i) => (
                        <option key={i} value={conjunto}>{conjunto}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
            
            <div className="operator-select">
              <label>Operador:</label>
              <select
                value={currentRule.operador}
                onChange={(e) => setCurrentRule({...currentRule, operador: e.target.value})}
              >
                <option value="AND">AND (Y)</option>
                <option value="OR">OR (O)</option>
              </select>
            </div>
          </div>
          
          <div className="editor-section">
            <h3>ENTONCES</h3>
            
            {currentRule.consecuentes.map((consecuente, index) => {
              const conjuntos = getConjuntosForVariable(consecuente.variable);
              
              return (
                <div className="rule-row" key={`cons-${index}`}>
                  <div className="variable-name">{consecuente.variable}</div>
                  
                  <div className="condition-controls">
                    <label className="negation">
                      <input
                        type="checkbox"
                        checked={consecuente.negado}
                        onChange={(e) => updateConsecuente(index, 'negado', e.target.checked)}
                      />
                      NO
                    </label>
                    
                    <select
                      value={consecuente.conjunto}
                      onChange={(e) => updateConsecuente(index, 'conjunto', e.target.value)}
                    >
                      <option value="">-- No usado --</option>
                      {conjuntos.map((conjunto, i) => (
                        <option key={i} value={conjunto}>{conjunto}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="editor-section">
            <h3>Peso de la Regla</h3>
            <div className="weight-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentRule.peso}
                onChange={(e) => setCurrentRule({...currentRule, peso: parseFloat(e.target.value)})}
              />
              <span>{currentRule.peso.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="rule-preview">
            <h3>Vista previa</h3>
            <div className="preview-box">
              {generateRuleText(currentRule)}
            </div>
          </div>
          
          <div className="button-group">
            <button className="save-button" onClick={handleSaveRule}>
              {editMode ? 'Actualizar Regla' : 'Guardar Regla'}
            </button>
            
            {editMode && (
              <button className="cancel-button" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        
        {/* Lista de reglas */}
        <div className="rules-list-panel">
          <div className="panel-header">
            <h2>Reglas Definidas</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar reglas..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <button 
                className="clear-search" 
                onClick={() => setFilterText('')}
                style={{ visibility: filterText ? 'visible' : 'hidden' }}
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="rules-list">
            {filteredRules.length === 0 ? (
              <div className="empty-state">
                No hay reglas definidas o que coincidan con la búsqueda.
              </div>
            ) : (
              filteredRules.map((rule, index) => (
                <div 
                  key={rule.id} 
                  className={`rule-item ${selectedRuleIndex === index ? 'selected' : ''}`}
                >
                  <div className="rule-content">
                    <div className="rule-number">R{index + 1}</div>
                    <div className="rule-text">{generateRuleText(rule)}</div>
                  </div>
                  
                  <div className="rule-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditRule(index)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteRule(index)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="summary-section">
            <div className="rules-count">
              Total de reglas: {rules.length}
              {filterText && ` (mostrando ${filteredRules.length})`}
            </div>
            
            <button 
              className="new-rule-button"
              onClick={() => {
                resetCurrentRule();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              + Nueva Regla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reglas;