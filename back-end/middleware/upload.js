const multer = require('multer');

// //Set up multiple files to cache files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // uniqe filename
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: Infinity }
});
module.exports = upload;
