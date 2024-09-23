const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/ProjectController');
const verifyToken = require('../helpers/check-token');
const verifyId = require('../helpers/check-id');
const checkBody = require('../helpers/check-body');
const { imageUpload } = require('../helpers/image-upload');

//POST
router.post('/', verifyToken, imageUpload.array("images"), controller.addProject)

//GET
router.get('/get-by-id/:id', verifyId, controller.getById);
router.get('/get-images/:id', verifyId, controller.getImages);
router.get('/', controller.get);

//PATCH
router.patch('/favorite', verifyToken, controller.favorite)
router.patch('/:id', verifyToken, verifyId, imageUpload.array("images"), controller.editProject)

//DELETE
router.delete('/:id', verifyToken, verifyId, controller.deleteProject);

module.exports = router;