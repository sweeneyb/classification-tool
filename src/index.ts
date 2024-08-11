import { session, app, BrowserWindow, ipcMain, net } from 'electron';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
    // Define Content Security Policy
    // TODO figure out the script-src CSP to allow handlers
  const contentSecurityPolicy = `
    default-src 'self';
    img-src https://collectionapi.metmuseum.org/;
    style-src 'self';
    script-src 'self' 'unsafe-inline'; 
  `;
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurityPolicy] 
      }
    })
  })
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.whenReady().then(() => {
  ipcMain.handle('ping', (event: Electron.IpcMainInvokeEvent, category: String) => {
    console.log("handle: ping")
    'pong '+ category
  })
  ipcMain.handle('get-data', (event: Electron.IpcMainInvokeEvent, category: String) => {
    console.log("handle: get-data")
    const myPromise = new Promise((resolve, reject) => {
      var completeData = '';
      const request = net.request('https://collectionapi.metmuseum.org/public/collection/v1/search?q='+category)
      request.on('response', (response) => {
        // console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
          completeData+= chunk
        })
        response.on('end', () => {
          const jsondata = JSON.parse(completeData)
          // console.log("jsondata: ", jsondata)
          resolve(jsondata)
        })
        
      })
      request.end()
    });
    
    return myPromise
  } )
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
