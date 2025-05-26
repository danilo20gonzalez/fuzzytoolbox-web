# test_vs_code.py
# Simulación de conexión externa al motor lógico local (instalado)

import requests
import time

# Simular una lectura cada 2 segundos
for i in range(5):
    print(f"\n[Simulación {i + 1}] Enviando datos al motor lógico difuso...")
    
    # Entradas de ejemplo (pueden venir de sensores en un proyecto real)
    datos = {
        "Temperatura": 30.5 + i,
        "Humedad": 60 + i
    }

    print("Enviando datos...", datos)
    try:
        # Enviar al backend de la aplicación instalada (en localhost:8000)
        res = requests.post("http://localhost:8000/evaluar/", json=datos)
        print("Codigo:", res.status_code)
        print("Respuesta:", res.text)
        if res.status_code == 200:
            salida = res.json()
            print("✅ Resultado:", salida)
        else:
            print("⚠️ Error en la respuesta:", res.status_code, res.text)

    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al motor lógico. ¿La app está abierta?")

    time.sleep(2)