const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const rendererUrl = process.env.RENDERER_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#111827',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  void mainWindow.loadURL(rendererUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
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
