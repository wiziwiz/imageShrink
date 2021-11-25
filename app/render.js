const form = document.getElementById('image-form')
const slider = document.getElementById('slider')
const img = document.getElementById('img')

form.addEventListener('submit', event => {
    event.preventDefault()
    const imgPath = img.files[0].path
    const quality = slider.value

    console.log("imgPath: ", imgPath, "quality: ", quality)

})
