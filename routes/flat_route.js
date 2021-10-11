const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth_controller');
const flatController = require('../controllers/flat_controller');
const flatRequestRouter = require('../routes/flat_request_route')

router.use(authController.protect);

router.use('/:flatId/flat-request',flatRequestRouter)
router.use(authController.restrictTo('admin'));
router.route('/')
.post(flatController.createFlat)
.get(flatController.getAllFlats);

router.route('/:flatId')
.get(flatController.getFlat)
.delete(flatController.deletFlat)
.patch(flatController.updateFlat)

module.exports = router;