const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot', ctrl.forgot);
router.post('/reset', ctrl.reset);
router.post('/change-password', authRequired, ctrl.changePassword);

module.exports = router;


