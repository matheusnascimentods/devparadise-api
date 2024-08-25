const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/DevController');
const verifyToken = require('../helpers/check-token');
const verifyId = require('../helpers/check-id');
const checkBody = require('../helpers/check-body');
const { imageUpload } = require('../helpers/image-upload');

//POST
router.post('/', [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('username').isLength({ min: 5 }).trim().escape(),
    body('phone').isMobilePhone(),
    body('email').isEmail().normalizeEmail(),
    body('cpf').isLength({ min: 11}),
    body('password').isLength({ min: 6 }),
], checkBody, controller.post);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], checkBody, controller.login);

//GET
router.get("/get-user", controller.getUserByToken);

router.get("/get-projects/:id", verifyId, controller.getDevProjects);

router.get("/", controller.get);

//PATCH
router.patch("/change-password", [
    body('password').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
],
verifyToken, checkBody, controller.changePassword);

router.patch("/change-pfp", verifyToken, imageUpload.single("image"), controller.changePfp);

router.patch("/", [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('username').isLength({ min: 5 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone(),
], verifyToken, checkBody, controller.edit);

//DELETE
router.delete('/', verifyToken, controller.delete);

module.exports = router;