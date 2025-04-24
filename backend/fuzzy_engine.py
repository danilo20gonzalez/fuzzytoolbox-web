from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import skfuzzy as fuzz
import json
import os

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the filename for persistence
DATA_FILE = "fuzzy_variables.json"

class Variable(BaseModel):
    nombre: str
    rango: list[float]
    tipo: str
    conjuntos: list[dict]
    id: int = None

class FuzzyEngine:
    def __init__(self):
        self.variables = {}
        self.load_from_file()
    
    def load_from_file(self):
        """Load variables from file if it exists"""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for var_data in data:
                        var = Variable(**var_data)
                        self.variables[var.nombre] = var
            except Exception as e:
                print(f"Error loading variables from file: {e}")
    
    def save_to_file(self):
        """Save all variables to file"""
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([var.dict() for var in self.variables.values()], f, ensure_ascii=False, indent=2)
    
    def agregar_variable(self, variable):
        """Add or update a variable and save to file"""
        self.variables[variable.nombre] = variable
        self.save_to_file()
    
    def eliminar_variable(self, nombre_variable):
        """Delete a variable and save to file"""
        if nombre_variable in self.variables:
            del self.variables[nombre_variable]
            self.save_to_file()
            return True
        return False
    
    def calcular_pertinencia_variable(self, nombre_variable, valor):
        if nombre_variable in self.variables:
            variable = self.variables[nombre_variable]
            pertinencia = {}
            for conjunto in variable.conjuntos:
                if variable.tipo == 'triangular':
                    a, b, c = conjunto['puntos']
                    pertinencia[conjunto['nombre']] = fuzz.trimf(np.array([valor]), [a, b, c])[0]
                elif variable.tipo == 'trapezoidal':
                    a, b, c, d = conjunto['puntos']
                    pertinencia[conjunto['nombre']] = fuzz.trapmf(np.array([valor]), [a, b, c, d])[0]
                elif variable.tipo == 'gaussiana':
                    media, desviacion = conjunto['puntos']
                    pertinencia[conjunto['nombre']] = fuzz.gaussmf(np.array([valor]), media, desviacion)[0]
            return pertinencia
        else:
            return None

# Initialize the fuzzy engine
engine = FuzzyEngine()

@app.get("/variables/")
async def obtener_variables():
    return list(engine.variables.values())

@app.post("/variables/")
async def crear_variable(variable: Variable):
    # Ensure variable has an ID
    if not variable.id:
        # Generate a new ID if not provided
        existing_ids = [v.id for v in engine.variables.values() if v.id is not None]
        new_id = 1
        if existing_ids:
            new_id = max(existing_ids) + 1
        variable.id = new_id
    
    engine.agregar_variable(variable)
    return {"mensaje": "Variable creada correctamente", "variable": variable}

@app.get("/variables/{nombre_variable}")
async def obtener_variable(nombre_variable: str):
    if nombre_variable in engine.variables:
        return engine.variables[nombre_variable]
    else:
        raise HTTPException(status_code=404, detail="Variable no encontrada")

@app.put("/variables/{nombre_variable}")
async def actualizar_variable(nombre_variable: str, variable: Variable):
    # Preserve the ID if the variable exists
    if nombre_variable in engine.variables:
        existing_id = engine.variables[nombre_variable].id
        if not variable.id:
            variable.id = existing_id
        
    engine.agregar_variable(variable)
    return {"mensaje": "Variable actualizada correctamente", "variable": variable}

@app.delete("/variables/{variable_id}")
async def eliminar_variable(variable_id: int):
    # Buscar la variable por ID
    variable_a_eliminar = None
    for nombre, var in engine.variables.items():
        if var.id == variable_id:
            variable_a_eliminar = nombre
            break
    
    if variable_a_eliminar:
        engine.eliminar_variable(variable_a_eliminar)
        return {"mensaje": "Variable eliminada correctamente"}
    else:
        raise HTTPException(status_code=404, detail="Variable no encontrada")


@app.post("/variables/{nombre_variable}/calcular_pertinencia")
async def calcular_pertinencia(nombre_variable: str, valor: float):
    pertinencia = engine.calcular_pertinencia_variable(nombre_variable, valor)
    if pertinencia is not None:
        return pertinencia
    else:
        raise HTTPException(status_code=404, detail="Variable no encontrada")
