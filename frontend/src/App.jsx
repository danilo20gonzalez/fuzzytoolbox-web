import axios from 'axios';
import { useEffect } from 'react';
import Dashboard from './components/Dashboard'; // 👈 Importas el componente
import './App.css'; // (Opcional, si tienes estilos globales para App)

function App() {
  useEffect(() => {
    axios.get('http://localhost:8000/')
      .then(response => {
        console.log('Respuesta del backend:', response.data);
      })
      .catch(error => {
        console.error('Error al conectar con la API:', error);
      });
  }, []);

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
