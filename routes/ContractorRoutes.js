const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/ContractorController');
const verifyToken = require('../helpers/check-token');
const verifyId = require('../helpers/check-id');
const checkBody = require('../helpers/check-body');
const { imageUpload } = require('../helpers/image-upload');

//POST
router.post('/', [
    body('name').notEmpty(),
    body('username').isLength({ min: 5 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('cnpj').isLength({ min: 14}),
    body('password').isLength({ min: 6 }),
], 
checkBody, controller.post);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], checkBody, controller.login);

//GET
router.get('/', controller.get);

//Patch 
router.patch('/change-password', [
    body('password').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
], 
verifyToken, controller.changePassword);

router.patch('/change-pfp', verifyToken, imageUpload.single("image"), controller.changePfp);

router.patch('/favorite-dev/:id', verifyId, controller.favoriteDev);

router.patch('/remove-dev/:id', verifyId, controller.removeDev);

router.patch("/", [
    body('username').isLength({ min: 5 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
], verifyToken, checkBody, controller.edit);

//Delete
router.delete('/', verifyToken, controller.delete);

module.exports = router;