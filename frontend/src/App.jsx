import axios from 'axios';
import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import ManualSidebar from './components/BarManual';

import Inicio from './pages/Inicio';
import Variables from './pages/Variables';
import Reglas from './pages/Reglas';
import Simulador from './pages/Simulador';
import DataProcessor from './pages/DataProcessor';
import ManualInicio from './pages/ManualInicio';
import ManualVariablesDifusas from './pages/ManualVariablesDifusas';
import ManualReglas from './pages/ManualReglas';
import ManualResultados from './pages/ManualResultados';
import ManualCargarDatos from './pages/ManualCargarDatos';

import './App.css';

// Componente interno para manejar la lógica de navegación
function AppContent() {
  const location = useLocation();
  const isManualRoute = location.pathname.startsWith('/manual');

  useEffect(() => {
    axios.get('http://localhost:8000/variables/')
      .then(response => {
        console.log('Respuesta del backend:', response.data);
      })
      .catch(error => {
        console.error('Error al conectar con la API:', error);
      });
  }, []);

  return (
    <>
      {/* Mostrar Navbar solo si NO estamos en rutas del manual */}
      {!isManualRoute && <Navbar />}
      
      {/* Mostrar ManualSidebar solo si estamos en rutas del manual */}
      {isManualRoute && <ManualSidebar />}
      
      <div className={`App ${isManualRoute ? 'with-sidebar' : ''}`}>
        <Routes>
          {/* Rutas principales */}
          <Route path="/" element={<Inicio />} />
          <Route path="/variables" element={<Variables />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/dataProcessor" element={<DataProcessor />} />
          
          {/* Rutas del manual */}
          <Route path="/manual/inicio" element={<ManualInicio />} />
          <Route path="/manual/variables" element={<ManualVariablesDifusas />} />
          <Route path="/manual/reglas" element={<ManualReglas />} />
          <Route path="/manual/resultados" element={<ManualResultados />} />
          <Route path="/manual/cargarDatos" element={<ManualCargarDatos />} />
          
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
