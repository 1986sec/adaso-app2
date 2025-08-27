const router = require('express').Router();
const ctrl = require('../controllers/searchController');
const { authRequired } = require('../middleware/auth');

router.get('/', authRequired, ctrl.search);
router.get('/suggestions', authRequired, ctrl.suggestions);

module.exports = router;


