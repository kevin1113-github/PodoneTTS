import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, Menu, nativeImage, shell, Tray } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

import fs from 'fs/promises'
import { createServer } from 'http'
import * as path from 'path'
import { URL } from 'url'

const BASE_URL = is.dev ? 'http://localhost:5173' : 'http://localhost:3000'

let tray: Tray | null = null
let forceQuit: boolean = false

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

function createWindow(): BrowserWindow {
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

  mainWindow.on('close', (event) => {
    if (!forceQuit) {
      // 사용자가 메뉴에서 '종료'를 누른 게 아니라면
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.loadURL(BASE_URL + '/electron')
  // is.dev && mainWindow.webContents.openDevTools()'
  return mainWindow
}

function createTray(mainWindow: BrowserWindow): void {
  // 1. 아이콘 이미지 경로 설정 (resources 폴더 등에 위치)
  // Vite 환경에서는 public 폴더나 build 시 포함될 경로를 고려해야 합니다.
  const iconPath = path.join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  // 2. 트레이 생성
  tray = new Tray(icon)

  // 3. 우클릭 컨텍스트 메뉴 설정
  const contextMenu = Menu.buildFromTemplate([
    { label: '열기', click: () => mainWindow.show() },
    {
      label: '종료',
      click: () => {
        forceQuit = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('포도네 TTS')
  tray.setContextMenu(contextMenu)

  // 4. 트레이 아이콘 클릭 시 앱 보이기
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

app.whenReady().then(() => {
  createServerInstance()
  electronApp.setAppUserModelId('com.kevin1113dev.podone-tts')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()
  createTray(mainWindow) // 트레이 생성 함수 호출

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
