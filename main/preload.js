const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  ping: () => 'pong',
  saveFile: (payload) => ipcRenderer.invoke('desktop:save-file', payload)
});
