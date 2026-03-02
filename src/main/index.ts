import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import * as path from 'path'
import { createServer } from 'http'
import { URL } from 'url'
import fs from 'fs/promises'

const BASE_URL = is.dev ? 'http://localhost:5173' : 'http://localhost:3000'

const server = createServer((req, res) => {
  console.log('Incoming request:', req.url)
  const baseURL = `http://${req.headers.host}/`
  const reqUrl = new URL(req.url || '/', baseURL)
  const pathname = reqUrl.pathname

  console.log(`Request for ${pathname}`)
  const filePath = path.join(__dirname, '../renderer', pathname)

  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ico': 'image/x-icon'
  }

  fs.readFile(filePath)
    .then((data) => {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' })
      res.end(data)
    })
    .catch(() => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      const data = join(__dirname, '../renderer/index.html')
      fs.readFile(data)
        .then((data) => {
          res.end(data)
        })
        .catch((err) => {
          console.error(err)
          res.writeHead(400)
          res.end('404 Not Found')
        })
    })
})

function createServerInstance(): void {
  server.listen(3000, () => {
    console.log(`Server listening on ${BASE_URL}`)
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: !is.dev,
    autoHideMenuBar: !is.dev,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    title: '포도네 TTS'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.loadURL(BASE_URL + '/electron')
  // is.dev && mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createServerInstance()
  electronApp.setAppUserModelId('com.kevin1113dev.podone-tts')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
