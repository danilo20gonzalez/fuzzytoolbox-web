# test_vs_code.py
# Enviar datos uno por uno al motor lógico local instalado
# usando la cola de entradas pendientes

import requests
import time

# Lista de datos simulados (como si vinieran de sensores)
datos_entrada = [
    {"Temperatura": 30.5, "Humedad": 65.0},
    {"Temperatura": 32.0, "Humedad": 68.0},
    {"Temperatura": 28.0, "Humedad": 55.0},
]

print("🚀 Enviando datos uno por uno al motor lógico difuso...")

for i, entrada in enumerate(datos_entrada):
    print(f"\n➡️ Enviando entrada {i + 1}: {entrada}")

    # Enviar entrada pendiente al backend
    try:
        res = requests.post("http://localhost:8000/enviar_entrada/", json=entrada)
        respuesta = res.json()
        print("📨 Respuesta:", respuesta["status"])

        # Si el backend está ocupado, esperar y reintentar
        while respuesta["status"] == "Ocupado":
            print("⏳ Esperando a que se libere el motor lógico...")
            time.sleep(2)
            res = requests.post("http://localhost:8000/enviar_entrada/", json=entrada)
            respuesta = res.json()
            print("📨 Reintento:", respuesta["status"])

        print("✅ Entrada aceptada. Esperando evaluación desde la app...")

        # Esperar a que se evalúe la entrada actual
        evaluado = False
        while not evaluado:
            time.sleep(2)
            check = requests.get("http://localhost:8000/ultimo_resultado/").json()
            if check.get("entradas") == entrada:
                print("✅ Resultado recibido:", check["resultado"])
                evaluado = True

    except Exception as e:
        print("❌ Error al enviar entrada:", e)