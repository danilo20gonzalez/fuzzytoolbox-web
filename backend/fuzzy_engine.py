from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import skfuzzy as fuzz

app = FastAPI()

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

class Variable(BaseModel):
    nombre: str
    rango: list[float]
    tipo: str
    conjuntos: list[dict]

class FuzzyEngine:
    def __init__(self):
        self.variables = {}

    def agregar_variable(self, variable):
        self.variables[variable.nombre] = variable

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

engine = FuzzyEngine()

@app.post("/variables/")
async def crear_variable(variable: Variable):
    engine.agregar_variable(variable)
    return {"mensaje": "Variable creada correctamente"}

@app.get("/variables/")
async def obtener_variables():
    return list(engine.variables.values())

@app.get("/variables/{nombre_variable}")
async def obtener_variable(nombre_variable: str):
    if nombre_variable in engine.variables:
        return engine.variables[nombre_variable]
    else:
        raise HTTPException(status_code=404, detail="Variable no encontrada")

@app.put("/variables/{nombre_variable}")
async def actualizar_variable(nombre_variable: str, variable: Variable):
    if nombre_variable in engine.variables:
        engine.variables[nombre_variable] = variable
        return {"mensaje": "Variable actualizada correctamente"}
    else:
        raise HTTPException(status_code=404, detail="Variable no encontrada")

@app.delete("/variables/{nombre_variable}")
async def eliminar_variable(nombre_variable: str):
    if nombre_variable in engine.variables:
        del engine.variables[nombre_variable]
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