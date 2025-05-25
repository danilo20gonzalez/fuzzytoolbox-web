# fuzzy_core.py

import json
import os
import numpy as np
import skfuzzy as fuzz
from skfuzzy import trimf, trapmf, gaussmf, defuzz
from skfuzzy.defuzzify.exceptions import EmptyMembershipError
from pydantic import BaseModel


DATA_FILE = "fuzzy_variables.json"
REGLAS_FILE = "reglas.json"

class Variable(BaseModel):
    nombre: str
    rango: list[float]
    tipo: str  # 'triangular', 'trapezoidal', 'gaussiana'
    conjuntos: list[dict]
    tipoVariable: str
    id: int = None


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
                print(f"[ERROR] Al cargar variables: {e}")

    def load_rules(self):
        if os.path.exists(REGLAS_FILE):
            try:
                with open(REGLAS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ERROR] Al cargar reglas: {e}")
        return []

    def evaluar(self, entradas: dict) -> dict:
        reglas = self.load_rules()
        if not reglas:
            raise ValueError("No hay reglas definidas.")

        fuzzificados = {}
        for nombre_var, valor in entradas.items():
            if nombre_var not in self.variables:
                raise ValueError(f"Variable '{nombre_var}' no encontrada")
            variable = self.variables[nombre_var]
            pertinencias = {}
            for conjunto in variable.conjuntos:
                puntos = conjunto["puntos"]
                tipo = conjunto.get("tipo", variable.tipo)
                if tipo == "triangular":
                    pertenencia = trimf(np.array([valor]), np.array(puntos))[0]
                elif tipo == "trapezoidal":
                    pertenencia = trapmf(np.array([valor]), np.array(puntos))[0]
                elif tipo == "gaussiana":
                    pertenencia = gaussmf(np.array([valor]), *puntos)[0]
                else:
                    pertenencia = 0
                pertinencias[conjunto["nombre"]] = pertenencia
            fuzzificados[nombre_var] = pertinencias

        salidas_agregadas = {}
        for regla in reglas:
            activaciones = []
            for ant in regla["antecedentes"]:
                variable = ant["variable"]
                conjunto = ant["conjunto"]
                negado = ant["negado"]
                grado = fuzzificados.get(variable, {}).get(conjunto, 0)
                grado = 1 - grado if negado else grado
                activaciones.append(grado)
            activacion_regla = min(activaciones) if regla["operador"] == "AND" else max(activaciones)
            activacion_regla *= regla.get("peso", 1.0)
            for cons in regla["consecuentes"]:
                variable = cons["variable"]
                conjunto = cons["conjunto"]
                negado = cons["negado"]
                key = (variable, conjunto)
                grado_actual = salidas_agregadas.get(key, 0)
                nuevo_grado = 1 - activacion_regla if negado else activacion_regla
                salidas_agregadas[key] = max(grado_actual, nuevo_grado)

        resultados = {}
        for (var_nombre, conjunto_nombre), grado in salidas_agregadas.items():
            variable = self.variables[var_nombre]
            conjunto = next((c for c in variable.conjuntos if c["nombre"] == conjunto_nombre), None)
            if not conjunto:
                continue
            puntos = conjunto["puntos"]
            x = np.linspace(variable.rango[0], variable.rango[1], 1000)
            tipo = conjunto.get("tipo", variable.tipo)
            if tipo == "triangular":
                mf = trimf(x, np.array(puntos))
            elif tipo == "trapezoidal":
                mf = trapmf(x, np.array(puntos))
            elif tipo == "gaussiana":
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
            variable = self.variables[var_nombre]
            x = np.linspace(variable.rango[0], variable.rango[1], 1000)
            try:
                if np.sum(mf_total) == 0:
                    salida_final[var_nombre] = 0
                else:
                    salida_final[var_nombre] = defuzz(x, mf_total, 'centroid')
            except EmptyMembershipError:
                salida_final[var_nombre] = 0

        return salida_final
