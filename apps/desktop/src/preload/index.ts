import { contextBridge } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add your IPC methods here
  // Example:
  // sendMessage: (message: string) => ipcRenderer.send('message', message),
  // onMessage: (callback: (event: any, message: string) => void) =>
  //   ipcRenderer.on('message', callback),
})
