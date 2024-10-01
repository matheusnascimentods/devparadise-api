const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/UserController');
const verifyToken = require('../helpers/check-token');
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
], checkBody, controller.signup);

router.post('/login', [
    body('login').notEmpty(),
    body('password').notEmpty()
], checkBody, controller.login);

//GET
router.get("/get-user", controller.getCurrentUser);

router.get("/my-projects", verifyToken, controller.myProjects);

router.get("/", controller.get);

//PATCH
router.patch("/change-password", [
    body('password').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
],
verifyToken, checkBody, controller.changePassword);

router.patch("/", verifyToken, imageUpload.single("image"), controller.edit);

//DELETE
router.delete('/', verifyToken, controller.delete);

module.exports = router;