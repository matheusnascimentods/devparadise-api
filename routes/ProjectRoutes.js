const router = require('express').Router();

const controller = require('../controllers/ProjectController');
const verifyToken = require('../helpers/check-token');
const verifyId = require('../helpers/check-id');
const { imageUpload } = require('../helpers/image-upload');

//POST
router.post('/', verifyToken, imageUpload.array("images"), controller.publish)

//GET
router.get("/me", verifyToken, controller.myProjects);

router.get('/', controller.get);

//PATCH
router.patch('/favorite', verifyToken, controller.favorite)
router.patch('/:id', verifyToken, verifyId, imageUpload.array("images"), controller.update)

//DELETE
router.delete('/:id', verifyToken, verifyId, controller.delete);

module.exports = router;