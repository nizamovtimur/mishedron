const { app, BrowserWindow } = require('electron');
const { head } = require('got');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './js/preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    // win.removeMenu();
    win.loadFile('./html/preloader.html');
    //win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length == 0) {
        createWindow();
    }
})
