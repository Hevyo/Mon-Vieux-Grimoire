const multer = require('multer')
const fs = require('fs')
const sharpMulter = require('sharp-multer')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const multerFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true)
  } else (
    callback(null, false)
  )
}

const newFilenameFunction = (originalname_filename, options) => {
    const newname = `${originalname_filename.split(' ').join('_')}-${Date.now()}.${options.fileFormat}`
    return newname;
  };

const storage = sharpMulter({
    destination: (req, file, callback) => callback(null, 'images'),
  
    imageOptions: {
      fileFormat: "webp",
      quality: 60,
    },

    filename: newFilenameFunction
})

module.exports = multer({storage: storage, fileFilter: multerFilter}).single('image')
