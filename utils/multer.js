const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    },
    fileFilter: function(req, res, cb){
        let ext = path.extname(req.file.originalname)
        if(ext !== '.jpg' || ext !== '.jpeg' || ext !== '.png'){
            cb(new Error('File type is not supported'), false)
            return;
        }
        cb(null, true)
    }
  })
  
const upload = multer({storage: storage})
module.exports = upload