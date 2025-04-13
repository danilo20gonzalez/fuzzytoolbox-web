// src/components/Dashboard.jsx
import { motion } from 'framer-motion';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h1>🎯 FuzzyToolbox Web</h1>
      <p>¡Bienvenido a tu caja de herramientas de lógica difusa!</p>
      <button className="btn">Explorar</button>
    </motion.div>
  );
}

export default Dashboard;
