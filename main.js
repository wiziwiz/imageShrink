const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron")
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const log = require('electron-log')
// const slash = require('slash')

// know your env
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production'
const isWin = process.platform === 'win32'

let mainWindow
let aboutWindow


function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 800 : 500,
        height: 600,
        icon:'./assets/icons/Icon_256x256.png',
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences:{
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow () {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon:'./assets/icons/Icon_256x256.png',
        resizable: false,
        backgroundColor: 'white',
    })

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    aboutWindow.loadFile('./app/about.html')
}

const shrinkImage = async ({imgPath, quality, dest}) => {
    try {
        // const imagemin = (await import('imagemin')).default;
        const slash = (await import('slash')).default;
        const pngQuality = quality / 100
        console.log("type : ", typeof(imgPath), "path: ",imgPath, " dest: ", dest)
        const path = slash(imgPath)
        const files = await imagemin([path], {
            destination: dest,
            plugins:[
                imageminMozjpeg({quality}),
                imageminPngquant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })
        console.log("Files: ", files)
        log.info(files)
        // shell.openItem(slash(dest))
        shell.openPath(slash(dest))

        mainWindow.webContents.send('image:done')
    } catch (error) {
        console.log(error)
        log.error(error)
    }

}

ipcMain.on('image:minimize', (event, options) => {
    options.dest = path.join(os.homedir(), 'imageshrink')
    shrinkImage(options)
    console.log(" MAIN : imgPath: ", options.imgPath, "quality: ", options.quality)

})

app.on('ready', () => {
    createMainWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
      })
    mainWindow.on('ready', () => mainWindow = null)

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)
    if(isDev) {
        mainWindow.webContents.openDevTools()
    }
    // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
    // globalShortcut.register('Ctrl+Shift+I', () => mainWindow.toggleDevTools())
})


const menu = [
    // ...(isMac? [{ role: 'appMenu' }] : [])
        // label: 'File',
        // submenu: [
        //     {
        //         label: 'Quit',
        //         accelerator : 'CmdOrCtrl+W',
        //         click: () => app.quit()
        //     }
        // ]
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                }
            ]
        },
        { role: 'fileMenu' },
        ...(isDev
           ? [
            {
                label: 'Developer',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { type: 'separator' },
                    { role: 'toggledevtools' },
                ],
            }
        ] : [])
]



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

