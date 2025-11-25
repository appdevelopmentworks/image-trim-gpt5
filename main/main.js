const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const rendererUrl = process.env.RENDERER_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'electron-icon.png')
    : path.join(__dirname, '..', 'assets', 'electron-icon.png');

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#111827',
    icon: iconPath,
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

ipcMain.handle('desktop:save-file', async (_event, payload) => {
  const filename = payload?.filename || 'output';
  const buffer = payload?.buffer;
  if (!buffer) {
    throw new Error('No buffer provided for save-file');
  }

  const defaultPath = path.join(app.getPath('downloads'), filename);
  const ext = path.extname(filename).replace('.', '');
  const filters = ext ? [{ name: `${ext.toUpperCase()} Files`, extensions: [ext] }] : undefined;

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'ファイルを保存',
    defaultPath,
    filters
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await fs.writeFile(filePath, Buffer.from(buffer));
  return { canceled: false, filePath };
});
