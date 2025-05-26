from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import skfuzzy as fuzz
from skfuzzy import trimf, trapmf, gaussmf, defuzz
from skfuzzy.defuzzify.exceptions import EmptyMembershipError
import json
import os
from typing import List, Dict, Any

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

# Archivos de persistencia
DATA_FILE = "fuzzy_variables.json"
REGLAS_FILE = "reglas.json"

class Condicion(BaseModel):
    variable: str
    conjunto: str
    negado: bool = False

class Variable(BaseModel):
    nombre: str
    rango: list[float]
    tipo: str
    conjuntos: list[dict]
    tipoVariable: str
    id: int = None

class Regla(BaseModel):
    id: int = None
    antecedentes: List[Condicion] 
    consecuentes: List[Condicion] 
    operador: str
    peso: float = 1.0

class FuzzyEngine:
    def __init__(self):
        self.variables = {}
        self.load_from_file()

    def load_from_file(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for var_data in data:
                        var = Variable(**var_data)
                        self.variables[var.nombre] = var
            except Exception as e:
                print(f"Error loading variables: {e}")

    def save_to_file(self):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([v.dict() for v in self.variables.values()], f, ensure_ascii=False, indent=2)

    def agregar_variable(self, variable):
        self.variables[variable.nombre] = variable
        self.save_to_file()

    def eliminar_variable(self, nombre_variable):
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
                puntos = conjunto['puntos']
                tipo = conjunto.get('tipo', variable.tipo)  
                
                if tipo == 'triangular':
                    pertinencia[conjunto['nombre']] = trimf(np.array([valor]), np.array(puntos))[0]
                elif tipo == 'trapezoidal':
                    pertinencia[conjunto['nombre']] = trapmf(np.array([valor]), np.array(puntos))[0]
                elif tipo == 'gaussiana':
                    pertinencia[conjunto['nombre']] = gaussmf(np.array([valor]), *puntos)[0]
                else:
                    raise ValueError(f"Tipo de función de pertenencia no soportada: {tipo}")
                    
            return pertinencia
        return None
    
    def cargar_reglas(self) -> List[Regla]: 
        try:
            if not os.path.exists(REGLAS_FILE):
                return []
            with open(REGLAS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Regla(**item) for item in data]
        except Exception as e:
            print(f"Error cargando reglas: {e}")
            return []
    def guardar_reglas(self, reglas: List[Regla]): 
        reglas_data = [regla.dict() for regla in reglas]
        with open(REGLAS_FILE, "w", encoding="utf-8") as f:
            json.dump(reglas_data, f, ensure_ascii=False, indent=2)
    
    def eliminar_regla(self, regla_id: int) -> bool: 
        reglas_existentes = self.cargar_reglas()
        reglas_actualizadas = []
        regla_encontrada = False

        for regla in reglas_existentes:
            if regla.id == regla_id:
                regla_encontrada = True
            else:
                reglas_actualizadas.append(regla)
            
        if regla_encontrada:
            self.guardar_reglas(reglas_actualizadas)
            return True
        return False
    
    def eliminar_todas_las_reglas(self): 
        if os.path.exists(REGLAS_FILE):
            os.remove(REGLAS_FILE)
            return True
        return False

engine = FuzzyEngine()

@app.get("/variables/")
async def obtener_variables():
    return list(engine.variables.values())

@app.post("/variables/")
async def crear_variable(variable: Variable):
    if not variable.id:
        existing_ids = [v.id for v in engine.variables.values() if v.id is not None]
        variable.id = max(existing_ids, default=0) + 1
    engine.agregar_variable(variable)
    return {"mensaje": "Variable creada correctamente", "variable": variable}

@app.get("/variables/{nombre_variable}")
async def obtener_variable(nombre_variable: str):
    if nombre_variable in engine.variables:
        return engine.variables[nombre_variable]
    raise HTTPException(status_code=404, detail="Variable no encontrada")

@app.put("/variables/{nombre_variable}")
async def actualizar_variable(nombre_variable: str, variable: Variable):
    if nombre_variable in engine.variables and not variable.id:
        variable.id = engine.variables[nombre_variable].id
    engine.agregar_variable(variable)
    return {"mensaje": "Variable actualizada correctamente", "variable": variable}

@app.delete("/variables/{variable_id}")
async def eliminar_variable(variable_id: int):
    for nombre, var in engine.variables.items():
        if var.id == variable_id:
            engine.eliminar_variable(nombre)
            return {"mensaje": "Variable eliminada correctamente"}
    raise HTTPException(status_code=404, detail="Variable no encontrada")

@app.post("/variables/{nombre_variable}/calcular_pertinencia")
async def calcular_pertinencia(nombre_variable: str, valor: float):
    pertinencia = engine.calcular_pertinencia_variable(nombre_variable, valor)
    if pertinencia is not None:
        return pertinencia
    raise HTTPException(status_code=404, detail="Variable no encontrada")

# ---------- REGLAS JSON ----------



@app.post("/reglas/")
async def guardar_reglas(request: Request):
    reglas = await request.json()
    with open(REGLAS_FILE, "w", encoding="utf-8") as f:
        json.dump(reglas, f, ensure_ascii=False, indent=2)
    return {"mensaje": "Reglas guardadas exitosamente"}

@app.get("/reglas/")
async def obtener_reglas():
    if not os.path.exists(REGLAS_FILE):
        return []
    with open(REGLAS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
@app.delete("/reglas/todas")
async def eliminar_todas_las_reglas_api():
    print("¡DEBUG: Solicitud DELETE /reglas/todas recibida!")
    if engine.eliminar_todas_las_reglas():
        return {"mensaje": "Todas las reglas han sido eliminadas correctamente"}
    else:
        raise HTTPException(status_code=404, detail="El archivo de reglas no existe para ser eliminado")

@app.delete("/reglas/{regla_id}")
async def eliminar_regla_api(regla_id: int): 
    if engine.eliminar_regla(regla_id):
        return {"mensaje": f"Regla con ID {regla_id} eliminada correctamente"}
    else:
        raise HTTPException(status_code=404, detail=f"Regla con ID {regla_id} no encontrada.")




@app.post("/evaluar/")
async def evaluar_sistema_difuso(entradas: dict):
    reglas = engine.cargar_reglas()
    if not reglas:
        raise HTTPException(status_code=400, detail="No hay reglas definidas")

    fuzzificados = {}
    for nombre_var, valor in entradas.items():
        if nombre_var not in engine.variables:
            raise HTTPException(status_code=404, detail=f"Variable '{nombre_var}' no encontrada")
        variable = engine.variables[nombre_var]
        pertinencias = {}
        for conjunto in variable.conjuntos:
            puntos = conjunto["puntos"]
            if variable.tipo == "triangular":
                pertenencia = trimf(np.array([valor]), np.array(puntos))[0]
            elif variable.tipo == "trapezoidal":
                pertenencia = trapmf(np.array([valor]), np.array(puntos))[0]
            elif variable.tipo == "gaussiana":
                pertenencia = gaussmf(np.array([valor]), *puntos)[0]
            else:
                pertenencia = 0
            pertinencias[conjunto["nombre"]] = pertenencia
        fuzzificados[nombre_var] = pertinencias

    salidas_agregadas = {}
    for regla in reglas:
        activaciones = []
        for ant in regla.antecedentes:
            variable = ant.variable
            conjunto = ant.conjunto
            negado = ant.negado
            grado = fuzzificados.get(variable, {}).get(conjunto, 0)
            grado = 1 - grado if negado else grado
            activaciones.append(grado)
        activacion_regla = min(activaciones) if regla.operador == "AND" else max(activaciones)
        activacion_regla *= regla.peso
        for cons in regla.consecuentes:
            variable = cons.variable
            conjunto = cons.conjunto
            negado = cons.negado
            key = (variable, conjunto)
            grado_actual = salidas_agregadas.get(key, 0)
            nuevo_grado = 1 - activacion_regla if negado else activacion_regla
            salidas_agregadas[key] = max(grado_actual, nuevo_grado)

    resultados = {}
    for (var_nombre, conjunto_nombre), grado in salidas_agregadas.items():
        variable = engine.variables[var_nombre]
        conjunto = next((c for c in variable.conjuntos if c["nombre"] == conjunto_nombre), None)
        if not conjunto:
            continue
        puntos = conjunto["puntos"]
        x = np.linspace(variable.rango[0], variable.rango[1], 1000)
        if variable.tipo == "triangular":
            mf = trimf(x, np.array(puntos))
        elif variable.tipo == "trapezoidal":
            mf = trapmf(x, np.array(puntos))
        elif variable.tipo == "gaussiana":
            mf = gaussmf(x, *puntos)
        else:
            continue
        mf_recortada = np.fmin(mf, grado)
        if var_nombre not in resultados:
            resultados[var_nombre] = mf_recortada
        else:
            resultados[var_nombre] = np.fmax(resultados[var_nombre], mf_recortada)

    salida_final = {}
    for var_nombre, mf_total in resultados.items():
        variable = engine.variables[var_nombre]
        x = np.linspace(variable.rango[0], variable.rango[1], 1000)
        try:
            if np.sum(mf_total) == 0:
                salida_final[var_nombre] = 0
            else:
                salida_final[var_nombre] = defuzz(x, mf_total, 'centroid')
        except EmptyMembershipError:
            salida_final[var_nombre] = 0

    return salida_final