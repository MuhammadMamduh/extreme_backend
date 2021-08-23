const multer = require('multer');

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match('\.(jpg|jpeg|png|gif)$'))
        {
            return cb(new Error('Images with the following [ jpg | jpeg | png | gif ] formats ONLY could be uploaded'));
        }

        cb(undefined, true);
    }
})

module.exports = upload;