# FuzzyFlow

Aplicación de escritorio multiplataforma (Electron) para crear, simular y visualizar sistemas de lógica difusa (fuzzy logic): variables lingüísticas, conjuntos borrosos, reglas y evaluación/defuzzificación, con un manual de usuario integrado.

## Estructura

- **Shell de escritorio**: Electron (`main.js`, `preload.js`). Levanta la ventana, carga el frontend compilado y arranca el backend Python como proceso hijo.
- **Frontend**: React 19 + Vite 6, Material UI, TailwindCSS, Plotly/Recharts, React Router. Código en `frontend/src/` (páginas: Inicio, Variables, Reglas, Simulador, DataProcessor, Manual).
- **Backend**: Python (FastAPI + Uvicorn + scikit-fuzzy). Código en `backend/fuzzy_engine.py` (API REST y motor de inferencia difusa) y `backend/main.py` (entry point).
- **Persistencia**: archivos JSON planos junto al backend (`backend/fuzzy_variables.json`, `backend/reglas.json`, `backend/fuzzy_system.json`) — no hay base de datos.

## Requisitos

- Node.js 18+ y npm
- Python 3.10+ (probado con 3.13/3.14)

## Cómo empezar

### 1. Backend (API FastAPI)

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

cd backend
uvicorn fuzzy_engine:app --reload
```

> Importante: el servidor debe iniciarse con `fuzzy_engine:app` (no `backend.main:app`) y con el directorio de trabajo dentro de `backend/`, porque `main.py` importa `fuzzy_engine` de forma relativa. Ejecutarlo desde la raíz del repo falla con `ModuleNotFoundError: No module named 'fuzzy_engine'`.
>
> Por defecto queda disponible en `http://localhost:8000`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Por defecto queda disponible en `http://localhost:5173` (el backend solo acepta CORS desde este origen en desarrollo).

### 3. Aplicación de escritorio completa (Electron)

Desde la raíz del repo:

```bash
npm install
npm run dev
```

Esto levanta Electron y el servidor de desarrollo de Vite en paralelo (`concurrently`).

## Scripts disponibles (raíz)

- `npm run dev` — Electron + Vite en modo desarrollo
- `npm run build` — build de producción del frontend
- `npm run electron-build` — empaqueta el instalador de Windows (NSIS) con electron-builder

## Funcionalidades principales

- **Variables**: alta/edición/borrado de variables lingüísticas difusas y sus conjuntos (triangular, trapezoidal, gaussiano).
- **Reglas**: definición de reglas difusas (si-entonces) con operadores AND/OR, negación y peso.
- **Simulador**: evaluación del sistema con valores de entrada y visualización de funciones de membresía (Plotly).
- **DataProcessor**: carga masiva de entradas desde archivos CSV.
- **Manual**: guía de uso integrada en la propia aplicación (`/manual/*`).

## Licencia

MIT — ver [LICENSE](LICENSE).
