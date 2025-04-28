import axios from 'axios';
import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Inicio from './pages/Inicio'; // ✅
import Variables from './pages/Variables';
import Reglas from './pages/Reglas';
import Simulador from './pages/Simulador';
import './App.css';

function App() {
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
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Inicio />} /> {/* 👈 Corregido */}
          <Route path="/variables" element={<Variables />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="/simulador" element={<Simulador />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
