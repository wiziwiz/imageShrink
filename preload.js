const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const os = require('os')
const M = require('materialize-css');

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('output-path').innerText = path.join(
        os.homedir(),
        'imageshrink'
    )

    const form = document.getElementById('image-form')
    const slider = document.getElementById('slider')
    const img = document.getElementById('img')

    form.addEventListener('submit', event => {
        event.preventDefault()
        const imgPath = img.files[0].path
        const quality = slider.value

        ipcRenderer.send('image:minimize', {
            imgPath,
            quality
        })


    })

    ipcRenderer.on('image:done', () => {
        M.toast({
            html: `image resized to ${slider.value}% quality`
        })
     })

})

