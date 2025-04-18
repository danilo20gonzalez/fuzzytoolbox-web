import { useState, useEffect, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import { 
  Slider, Select, MenuItem, TextField, Button, 
  FormControl, InputLabel, FormHelperText,
  IconButton, Tooltip, Snackbar, Alert, Typography, Box, Divider, Paper,
  Grid, Card, CardContent, CardActions, Switch, FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const FUZZY_TYPES = {
  triangular: {
    name: 'Triangular',
    points: 3,
    description: 'Define una función con tres puntos (izquierda, centro, derecha)'
  },
  trapezoidal: {
    name: 'Trapezoidal',
    points: 4,
    description: 'Define una función con cuatro puntos (izq, plataforma inicial, plataforma final, der)'
  },
  gaussiana: {
    name: 'Gaussiana',
    points: 2,
    description: 'Define una función con media y desviación estándar'
  }
};

const COLOR_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#20B2AA', '#8A2BE2', 
  '#FF4500', '#32CD32', '#BA55D3', '#00CED1'
];

function TriangularPointsEditor({ points, range, onChange }) {
  return (
    <Grid container spacing={2}>
      {['Izquierda', 'Centro', 'Derecha'].map((label, index) => (
        <Grid item xs={4} key={index}>
          <TextField
            label={label}
            type="number"
            value={points[index] || ''}
            onChange={(e) => onChange(index, parseFloat(e.target.value))}
            fullWidth
            inputProps={{ 
              min: range[0], 
              max: range[1],
              step: 0.1
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function TrapezoidalPointsEditor({ points, range, onChange }) {
  return (
    <Grid container spacing={2}>
      {['Izquierda', 'Inicio Meseta', 'Fin Meseta', 'Derecha'].map((label, index) => (
        <Grid item xs={3} key={index}>
          <TextField
            label={label}
            type="number"
            value={points[index] || ''}
            onChange={(e) => onChange(index, parseFloat(e.target.value))}
            fullWidth
            inputProps={{ 
              min: range[0], 
              max: range[1],
              step: 0.1
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function GaussianParamsEditor({ points, range, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Media (centro)"
          type="number"
          value={points[0] || ''}
          onChange={(e) => onChange(0, parseFloat(e.target.value))}
          fullWidth
          inputProps={{ 
            min: range[0], 
            max: range[1],
            step: 0.1
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Desviación Estándar"
          type="number"
          value={points[1] || ''}
          onChange={(e) => onChange(1, parseFloat(e.target.value))}
          fullWidth
          inputProps={{ 
            min: 0.1,
            step: 0.1
          }}
        />
      </Grid>
    </Grid>
  );
}

function VariablesWindow() {
  // Referencias
  const plotRef = useRef(null);
  
  // Estados principales
  const [variables, setVariables] = useState([]);
  const [currentVariable, setCurrentVariable] = useState({
    nombre: '',
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
  const [graphEditMode, setGraphEditMode] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [visibleSets, setVisibleSets] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Estado para errores y notificaciones
  const [errors, setErrors] = useState({
    nombre: '',
    conjunto: ''
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Cargar variables al iniciar
  useEffect(() => {
    fetchVariables();
  }, []);

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

  // Inicializar puntos cuando se asigna nombre al conjunto
  useEffect(() => {
    if (currentSet.nombre && currentSet.puntos.length === 0) {
      initializePoints();
    }
  }, [currentSet.nombre, currentVariable.tipo, currentVariable.rango]);

  // Mostrar notificación
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Cargar variables desde el backend
  const fetchVariables = async () => {
    setLoading(true);
    try {
      const response = await variableService.getAllVariables();
      setVariables(response.data);
      showNotification('Variables cargadas correctamente', 'success');
    } catch (error) {
      console.error("Error al cargar variables:", error);
      showNotification('Error al cargar variables: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar puntos según tipo de función
  const initializePoints = useCallback(() => {
    const [min, max] = currentVariable.rango;
    const range = max - min;
    
    let newPoints = [];
    
    switch(currentVariable.tipo) {
      case 'triangular':
        newPoints = [min, min + range/2, max];
        break;
      case 'trapezoidal':
        newPoints = [min, min + range/4, min + range*3/4, max];
        break;
      case 'gaussiana':
        newPoints = [min + range/2, range/6];
        break;
      default:
        newPoints = [min, min + range/2, max];
    }
    
    setCurrentSet(prev => ({
      ...prev,
      puntos: newPoints
    }));
  }, [currentVariable.rango, currentVariable.tipo]);

  // Validar nombre
  const validateName = (name, type = 'variable') => {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return 'El nombre es obligatorio';
    }
    
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return 'Solo se permiten letras, números y espacios';
    }
    
    if (type === 'variable' && variables) {
      const exists = variables.some(v => v.nombre === name && currentVariable?.id !== v.id);
      if (exists) return 'Ya existe una variable con este nombre';
    }
    
    if (type === 'conjunto' && currentVariable.conjuntos) {
      const exists = currentVariable.conjuntos.some(
        c => c.nombre === name && currentSet?.originalName !== name
      );
      if (exists) return 'Ya existe un conjunto con este nombre';
    }
    
    return '';
  };

  // Validar puntos según tipo de función
  const validatePoints = (points, tipo) => {
    const [min, max] = currentVariable.rango;
    
    if (points.some(p => p < min || p > max)) {
      return { isValid: false, errorMessage: `Todos los puntos deben estar entre ${min} y ${max}` };
    }
    
    const typeConfig = FUZZY_TYPES[tipo];
    if (!typeConfig) {
      return { isValid: false, errorMessage: 'Tipo de función no reconocido' };
    }
    
    if (points.length !== typeConfig.points) {
      return { isValid: false, errorMessage: `Una función ${typeConfig.name} requiere ${typeConfig.points} puntos` };
    }
    
    if (tipo === 'triangular' && !(points[0] <= points[1] && points[1] <= points[2])) {
      return { isValid: false, errorMessage: 'Los puntos deben mantener el orden Izquierda ≤ Centro ≤ Derecha' };
    }
    
    if (tipo === 'trapezoidal' && !(points[0] <= points[1] && points[1] <= points[2] && points[2] <= points[3])) {
      return { isValid: false, errorMessage: 'Los puntos deben mantener el orden Izquierda ≤ Inicio Meseta ≤ Fin Meseta ≤ Derecha' };
    }
    
    if (tipo === 'gaussiana' && points[1] <= 0) {
      return { isValid: false, errorMessage: 'La desviación estándar debe ser positiva' };
    }
    
    return { isValid: true, errorMessage: '' };
  };

  // Manejar cambios en la variable
  const handleVariableChange = (field, value) => {
    if (field === 'nombre') {
      const error = validateName(value, 'variable');
      setErrors(prev => ({ ...prev, nombre: error }));
    }
    
    setCurrentVariable(prev => ({ ...prev, [field]: value }));
  };

  // Manejar cambios en el conjunto
  const handleSetChange = (field, value) => {
    if (field === 'nombre') {
      const error = validateName(value, 'conjunto');
      setErrors(prev => ({ ...prev, conjunto: error }));
    }
    
    setCurrentSet(prev => ({ ...prev, [field]: value }));
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
    
    // Para funciones triangular/trapezoidal, mantener el orden
    if (['triangular', 'trapezoidal'].includes(currentVariable.tipo)) {
      if (index > 0 && newPoints[index] < newPoints[index-1]) {
        newPoints[index] = newPoints[index-1];
      }
      if (index < newPoints.length - 1 && newPoints[index] > newPoints[index+1]) {
        newPoints[index] = newPoints[index+1];
      }
    }

    setCurrentSet(prev => ({ ...prev, puntos: newPoints }));
  };

  // Actualizar gráfico
  const updatePlot = useCallback(() => {
    if (plotRef.current) {
      plotRef.current.plotly.react(
        plotRef.current.el,
        generatePlotData(),
        {
          ...plotLayout,
          title: `Variable: ${currentVariable.nombre || 'Nueva Variable'}`
        },
        plotConfig
      );
    }
  }, [currentVariable, currentSet, visibleSets, selectedSet]);

  // Calcular función de pertenencia
  const calculateMembership = (xValues, points, type) => {
    switch(type) {
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
  };

  // Generar datos para el gráfico
  const generatePlotData = useCallback(() => {
    const [min, max] = currentVariable.rango;
    const x = Array.from({ length: 200 }, (_, i) => min + (max - min) * i / 199);
    
    // Conjuntos existentes visibles
    const existingSets = currentVariable.conjuntos
      .filter(conjunto => visibleSets[conjunto.nombre] !== false)
      .map((conjunto, idx) => {
        const y = calculateMembership(x, conjunto.puntos, conjunto.tipo || currentVariable.tipo);
        
        return {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          fill: 'tozeroy',
          name: conjunto.nombre,
          line: { 
            color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
            width: selectedSet === conjunto.nombre ? 3 : 2
          },
          hoverinfo: 'name+x+y'
        };
      });
    
    // Conjunto actual si tiene nombre y puntos
    if (currentSet.nombre && currentSet.puntos.length > 0) {
      const y = calculateMembership(x, currentSet.puntos, currentVariable.tipo);
      
      const currentSetTrace = {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: currentSet.nombre,
        line: { 
          color: COLOR_PALETTE[currentVariable.conjuntos.length % COLOR_PALETTE.length],
          dash: selectedSet === currentSet.nombre ? null : 'dash',
          width: selectedSet === currentSet.nombre ? 3 : 2
        },
        hoverinfo: 'name+x+y'
      };
      
      return [...existingSets, currentSetTrace];
    }
    
    return existingSets;
  }, [currentVariable, currentSet, visibleSets, selectedSet]);

  // Configuración del gráfico
  const plotLayout = {
    title: {
      text: `Variable: ${currentVariable.nombre || 'Nueva Variable'}`,
      font: { size: 18 }
    },
    xaxis: {
      title: 'Valor',
      range: currentVariable.rango,
      gridcolor: '#f0f0f0'
    },
    yaxis: {
      title: 'Grado de Pertenencia',
      range: [0, 1.1],
      gridcolor: '#f0f0f0'
    },
    margin: { l: 50, r: 50, b: 50, t: 70 },
    showlegend: true,
    legend: { x: 1, xanchor: 'right', y: 1 },
    dragmode: graphEditMode ? 'select' : 'zoom',
    hovermode: 'closest',
    plot_bgcolor: '#fafafa',
    paper_bgcolor: '#fff'
  };

  const plotConfig = {
    responsive: true,
    editable: graphEditMode,
    modeBarButtonsToAdd: graphEditMode ? ['drawline', 'drawopenpath', 'eraseshape'] : [],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: `variable_${currentVariable.nombre || 'nueva'}`,
      height: 600,
      width: 800,
      scale: 2
    }
  };

  // Manejar clic en el gráfico
  const handleGraphClick = (data) => {
    if (!graphEditMode || !data.points?.[0]) return;
    
    const clickedSet = data.points[0].data.name;
    setSelectedSet(prev => prev === clickedSet ? null : clickedSet);
    
    // Si es un conjunto existente, cargarlo para edición
    const existingSet = currentVariable.conjuntos.find(c => c.nombre === clickedSet);
    if (existingSet) {
      setCurrentSet({
        nombre: existingSet.nombre,
        originalName: existingSet.nombre,
        puntos: [...existingSet.puntos]
      });
      
      // Si el tipo es diferente, actualizar el tipo de variable
      if (existingSet.tipo && existingSet.tipo !== currentVariable.tipo) {
        setCurrentVariable(prev => ({ ...prev, tipo: existingSet.tipo }));
      }
    }
  };

  // Guardar conjunto
  const handleSaveSet = () => {
    if (!currentSet.nombre) {
      showNotification('Ingresa un nombre para el conjunto', 'warning');
      return;
    }
    
    if (errors.conjunto) {
      showNotification(errors.conjunto, 'error');
      return;
    }
    
    const { isValid, errorMessage } = validatePoints(currentSet.puntos, currentVariable.tipo);
    if (!isValid) {
      showNotification(errorMessage, 'error');
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
      showNotification('Conjunto actualizado', 'success');
    } else {
      updatedConjuntos.push(newSet);
      showNotification('Conjunto creado', 'success');
    }
    
    setCurrentVariable(prev => ({ ...prev, conjuntos: updatedConjuntos }));
    setCurrentSet({ nombre: '', puntos: [], originalName: null });
    setSelectedSet(null);
    
    // Actualizar visibilidad
    setVisibleSets(prev => ({ ...prev, [newSet.nombre]: true }));
  };

  // Guardar variable
  const handleSaveVariable = async () => {
    if (errors.nombre) {
      showNotification(errors.nombre, 'error');
      return;
    }
    
    if (!currentVariable.nombre) {
      showNotification('Ingresa un nombre para la variable', 'warning');
      return;
    }
    
    if (currentVariable.conjuntos.length === 0) {
      showNotification('Añade al menos un conjunto', 'warning');
      return;
    }
    
    setLoading(true);
    
    try {
      if (currentVariable.id) {
        await variableService.updateVariable(currentVariable.id, currentVariable);
        setVariables(prev => prev.map(v => v.id === currentVariable.id ? currentVariable : v));
        showNotification('Variable actualizada', 'success');
      } else {
        const response = await variableService.createVariable(currentVariable);
        setVariables(prev => [...prev, response.data]);
        showNotification('Variable creada', 'success');
      }
      
      // Resetear estado
      setCurrentVariable({
        nombre: '',
        rango: [0, 100],
        tipo: 'triangular',
        conjuntos: []
      });
      
      setCurrentSet({ nombre: '', puntos: [], originalName: null });
      setGraphEditMode(false);
      setSelectedSet(null);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      showNotification('Error al guardar la variable: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Editar variable existente
  const handleEditVariable = async (variableId) => {
    setLoading(true);
    try {
      const response = await variableService.getVariableById(variableId);
      setCurrentVariable(response.data);
      setCurrentSet({ nombre: '', puntos: [], originalName: null });
      setGraphEditMode(false);
      setSelectedSet(null);
      showNotification('Variable cargada para edición', 'info');
    } catch (error) {
      console.error("Error al cargar:", error);
      showNotification('Error al cargar la variable: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar variable
  const handleDeleteVariable = async (variableId) => {
    if (!window.confirm('¿Eliminar esta variable permanentemente?')) return;
    
    setLoading(true);
    try {
      await variableService.deleteVariable(variableId);
      setVariables(prev => prev.filter(v => v.id !== variableId));
      
      if (currentVariable.id === variableId) {
        setCurrentVariable({
          nombre: '',
          rango: [0, 100],
          tipo: 'triangular',
          conjuntos: []
        });
        setCurrentSet({ nombre: '', puntos: [], originalName: null });
      }
      
      showNotification('Variable eliminada', 'success');
    } catch (error) {
      console.error("Error al eliminar:", error);
      showNotification('Error al eliminar la variable: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
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
    
    showNotification('Conjunto eliminado', 'info');
  };

  // Toggle visibilidad de conjunto
  const toggleSetVisibility = (setName) => {
    setVisibleSets(prev => ({
      ...prev,
      [setName]: !prev[setName]
    }));
  };

  return (
    <div className="variables-window">
      <Typography variant="h4" gutterBottom>
        Editor de Variables Difusas
      </Typography>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={notification.severity} 
          onClose={handleCloseNotification}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* Panel de edición */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Definición de Variable
            </Typography>
            
            <TextField
              label="Nombre de la Variable"
              value={currentVariable.nombre}
              onChange={(e) => handleVariableChange('nombre', e.target.value)}
              error={!!errors.nombre}
              helperText={errors.nombre || " "}
              fullWidth
              margin="normal"
              disabled={loading}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Rango: [{currentVariable.rango[0]}, {currentVariable.rango[1]}]
              </Typography>
              <Slider
                value={currentVariable.rango}
                onChange={(e, newValue) => handleVariableChange('rango', newValue)}
                valueLabelDisplay="auto"
                min={-100}
                max={1000}
                step={1}
                disabled={loading}
              />
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Función</InputLabel>
              <Select
                value={currentVariable.tipo}
                onChange={(e) => handleVariableChange('tipo', e.target.value)}
                label="Tipo de Función"
                disabled={loading}
              >
                {Object.entries(FUZZY_TYPES).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {FUZZY_TYPES[currentVariable.tipo].description}
              </FormHelperText>
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Definir Conjunto
            </Typography>
            
            <TextField
              label="Nombre del Conjunto"
              value={currentSet.nombre}
              onChange={(e) => handleSetChange('nombre', e.target.value)}
              error={!!errors.conjunto}
              helperText={errors.conjunto || " "}
              fullWidth
              margin="normal"
              disabled={loading}
            />
            
            {currentSet.nombre && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Parámetros del Conjunto
                </Typography>
                
                {currentVariable.tipo === 'triangular' && (
                  <TriangularPointsEditor 
                    points={currentSet.puntos} 
                    range={currentVariable.rango}
                    onChange={handlePointChange}
                  />
                )}
                
                {currentVariable.tipo === 'trapezoidal' && (
                  <TrapezoidalPointsEditor
                    points={currentSet.puntos}
                    range={currentVariable.rango}
                    onChange={handlePointChange}
                  />
                )}
                
                {currentVariable.tipo === 'gaussiana' && (
                  <GaussianParamsEditor
                    points={currentSet.puntos}
                    range={currentVariable.rango}
                    onChange={handlePointChange}
                  />
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSet}
                disabled={
                  !currentSet.nombre || 
                  !!errors.conjunto || 
                  currentSet.puntos.length !== FUZZY_TYPES[currentVariable.tipo].points ||
                  loading
                }
              >
                Guardar Conjunto
              </Button>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={graphEditMode}
                    onChange={() => setGraphEditMode(!graphEditMode)}
                    color="primary"
                  />
                }
                label="Edición gráfica"
              />
            </Box>
            
            {currentVariable.conjuntos.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Conjuntos Definidos
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {currentVariable.conjuntos.map((conjunto, idx) => (
                    <Card 
                      key={idx} 
                      sx={{ 
                        mb: 1,
                        borderLeft: `4px solid ${COLOR_PALETTE[idx % COLOR_PALETTE.length]}`,
                        bgcolor: selectedSet === conjunto.nombre ? 'action.hover' : 'background.paper'
                      }}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleSetVisibility(conjunto.nombre)}
                          >
                            {visibleSets[conjunto.nombre] !== false ? 
                              <VisibilityIcon fontSize="small" /> : 
                              <VisibilityOffIcon fontSize="small" />}
                          </IconButton>
                          
                          <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
                            {conjunto.nombre}
                          </Typography>
                          
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setCurrentSet({
                                  nombre: conjunto.nombre,
                                  originalName: conjunto.nombre,
                                  puntos: [...conjunto.puntos]
                                });
                                setSelectedSet(conjunto.nombre);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteSet(conjunto.nombre)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveVariable}
                disabled={
                  !currentVariable.nombre || 
                  currentVariable.conjuntos.length === 0 || 
                  !!errors.nombre || 
                  loading
                }
                size="large"
                fullWidth
              >
                {currentVariable.id ? 'Actualizar Variable' : 'Guardar Variable'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Panel de visualización */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ height: '400px', mb: 2 }}>
              <Plot
                ref={plotRef}
                data={generatePlotData()}
                layout={plotLayout}
                config={plotConfig}
                style={{ width: '100%', height: '100%' }}
                onClick={handleGraphClick}
                onInitialized={(figure, graphDiv) => {
                  plotRef.current = graphDiv;
                }}
                onUpdate={(figure) => {
                  if (plotRef.current) {
                    handlePlotUpdate(figure);
                  }
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Instrucciones:</strong> {graphEditMode ? 
                'Modifica la curva directamente en el gráfico arrastrando los puntos. Selecciona un conjunto para editarlo.' : 
                'Habilita la edición gráfica para modificar las curvas directamente.'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Variables Guardadas
            </Typography>
            
            {variables.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay variables guardadas. Crea una nueva variable para comenzar.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {variables.map((variable) => (
                  <Grid item xs={12} sm={6} md={4} key={variable.id}>
                    <Card 
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: currentVariable.id === variable.id ? '2px solid #1976d2' : undefined
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {variable.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rango: [{variable.rango[0]}, {variable.rango[1]}]
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Conjuntos: {variable.conjuntos.length}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditVariable(variable.id)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteVariable(variable.id)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchVariables}
                disabled={loading}
              >
                Recargar Variables
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default VariablesWindow;