import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

const validateVariable = (variable) => {
  if (!variable || typeof variable !== 'object') {
    throw new Error('Variable inválida');
  }
};

const validateId = (id) => {
  if (!id || typeof id !== 'string') {
    throw new Error('Id inválido');
  }
};

const fuzzyService = {
  async createVariable(variable) {
    try {
      validateVariable(variable);
      const response = await api.post('/variables', variable);
      return response.data;
    } catch (error) {
      console.error(`Error al crear variable: ${error.message}`);
      throw error;
    }
  },

  async getAllVariables() {
    try {
      const response = await api.get('/variables');
      return response.data;
    } catch (error) {
      console.error(`Error al obtener variables: ${error.message}`);
      throw error;
    }
  },

  async updateVariableById(id, variable) {
    try {
      validateId(id);
      validateVariable(variable);
      const response = await api.put(`/variables/${id}`, variable);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar variable: ${error.message}`);
      throw error;
    }
  },

  async deleteVariableById(id) {
    try {
      validateId(id);
      const response = await api.delete(`/variables/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar variable: ${error.message}`);
      throw error;
    }
  },

  async applyFuzzyLogic(variable) {
    try {
      validateVariable(variable);
      const response = await api.post('/aplicar_logica_difusa', variable);
      return response.data;
    } catch (error) {
      console.error(`Error al aplicar lógica difusa: ${error.message}`);
      throw error;
    }
  },
};

export default fuzzyService;