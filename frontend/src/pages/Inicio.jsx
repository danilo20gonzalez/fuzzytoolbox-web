// src/pages/Inicio.jsx
import '../styles/Pages.css';

function Inicio() {
  return (
    <div className="page-container">
      <h1>🎯 Bienvenido a FuzzyToolbox</h1>
      <p>Explora, experimenta y aprende lógica difusa con herramientas visuales.</p>

      <div className="inicio-buttons">
        <a className="btn" href="/variables">Comenzar con Variables</a>
        <a className="btn" href="/simulador">Ir al Simulador</a>
      </div>
    </div>
  );
}

export default Inicio;
