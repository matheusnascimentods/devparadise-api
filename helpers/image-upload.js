const multer = require("multer");
const path = require("path");

//Destino da image
const imageStorage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        let folder = "";

        if(req.baseUrl.includes('dev')) {
            folder = "devs";
        }

        if(req.baseUrl.includes('contractor')){
            folder = "contractors";
        }

        if(req.baseUrl.includes('project')){
            folder = "projects";
        }

        cb(null, `public/images/${folder}`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpg|jfif|jpeg)$/)) {
            return cb(new Error("Envie JPG ou PNG"));
        }
        cb(undefined, true);
    },
});

module.exports = { imageUpload };