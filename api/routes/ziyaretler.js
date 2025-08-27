const router = require('express').Router();
const ctrl = require('../controllers/visitController');
const { authRequired } = require('../middleware/auth');

router.get('/', authRequired, ctrl.list);
router.post('/', authRequired, ctrl.create);
router.put('/:id', authRequired, ctrl.update);
router.delete('/:id', authRequired, ctrl.remove);

module.exports = router;


