const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth_controller');
const buildingController = require('../controllers/building_controller');
const flatRequestRouter = require('../routes/flat_request_route');

router.use('/:buildingId/flat-request',flatRequestRouter);

router.use(authController.protect);

router.route('/profile')
.post(buildingController.createProfile)
.get(buildingController.getAllProfiles,buildingController.getAllBuildings);

router.route('/profile/:buildingId')
.get(buildingController.getProfile)
.patch(buildingController.updateProfile);

router.use(authController.restrictTo('admin'));
router.route('/')
.post(buildingController.createBuilding)
.get(buildingController.getAllBuildings);

router.route('/:buildingId')
.get(buildingController.getBuildingById)
.delete(buildingController.deletBuilding)
.patch(buildingController.updateBuilding)

module.exports = router;