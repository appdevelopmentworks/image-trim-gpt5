const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  ping: () => 'pong'
});
