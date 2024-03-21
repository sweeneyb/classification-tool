// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge } = require('electron');


var data = {"total":9556,"objectIDs":[844978,490012,485821,207021]}
// Define your constants
const MY_CONSTANT = 'Hello from preload!';

// Expose constants to the renderer process
contextBridge.exposeInMainWorld(
  'myAPI', {
    MY_CONSTANT: MY_CONSTANT,
    data: data
  }
);