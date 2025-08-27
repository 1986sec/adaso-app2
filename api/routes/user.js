const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authRequired } = require('../middleware/auth');

router.get('/profile', authRequired, ctrl.profile);
router.put('/profile', authRequired, ctrl.updateProfile);

module.exports = router;


