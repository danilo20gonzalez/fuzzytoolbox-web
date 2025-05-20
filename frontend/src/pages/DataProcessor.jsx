import React, { useState } from "react";
import Papa from "papaparse"; // Para procesar CSV
import "../styles/DataProcessor.css"

const DataProcessor = ({ setResultado }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar el cambio de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Procesar el archivo cargado
  const processFile = async () => {
    if (!file) {
      setError("No file selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result;

        if (file.name.endsWith(".csv")) {
          // Convertir CSV a JSON
          Papa.parse(content, {
            complete: (result) => {
              const data = result.data;
              // Asegúrate de que los datos estén en el formato correcto para el backend
              const formattedData = data.map((row) => ({
                "Temperatura ": row.temperatura, // Cambiar según tu CSV
                "Humedad ": row.humedad, // Cambiar según tu CSV
              }));
              processDataWithFuzzyLogic(formattedData);
            },
            header: true, // Usar la primera fila como cabecera
            skipEmptyLines: true, // Ignorar líneas vacías
          });
        } else {
          // Si el archivo es JSON, parsearlo directamente
          const data = JSON.parse(content);
          const formattedData = data.map((entry) => ({
            "Temperatura ": entry.temperatura,
            "Humedad ": entry.humedad,
          }));
          processDataWithFuzzyLogic(formattedData);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError("Error processing the file");
      setLoading(false);
    }
  };

  // Función para procesar los datos con la lógica difusa
  const processDataWithFuzzyLogic = async (data) => {
    // Enviar los datos al backend para que los procese
    const response = await fetch("http://localhost:8000/evaluar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setError("Error al procesar los datos");
      setLoading(false);
      return;
    }

    const resultado = await response.json();
    setResultado(resultado); // Pasar los resultados a "Simulación"
    setLoading(false); // Finalizar el estado de carga
  };

  return (
    <div className="data-processor-container">
      <h2>Procesador de Datos</h2>
      <div className="upload-area">
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="file-input"
        />
        <button
          onClick={processFile}
          className="process-btn"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Procesar Datos"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default DataProcessor;
