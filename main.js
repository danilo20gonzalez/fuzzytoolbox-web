const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'resources/icon.png') 
    });
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (pythonProcess) {
            pythonProcess.kill();
        }
    });
}


app.whenReady().then(() => {
    // Iniciar el servidor FastAPI
    const pythonExecutable = 'python';
    let scriptPath;

    if (app.isPackaged) {
        // Si la aplicación está empaquetada, la ruta está dentro de app.asar
        scriptPath = path.join(process.resourcesPath , 'app', 'backend', 'main.py');
    } else {
        // Si la aplicación no está empaquetada (en desarrollo), la ruta es relativa
        scriptPath = path.join(__dirname, 'backend', 'main.py');
    }

    console.log(`Attempting to start backend with: ${pythonExecutable} ${scriptPath}`); // Añade este log

    pythonProcess = spawn(pythonExecutable, [scriptPath]);

    if (pythonProcess) {
        console.log('Backend process started successfully.');
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Backend stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Backend stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
        });
    } else {
        console.error('Failed to start backend process.');
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});