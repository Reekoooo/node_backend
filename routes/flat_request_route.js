const express = require('express')
const router = express.Router({mergeParams: true});
const authController = require('../controllers/auth_controller');
const flatRequestController = require('../controllers/flat_Request_controller');

// /flat-request

router.use(authController.protect);
router.route('/my-requests/')
.post(flatRequestController.createFlatRequest,flatRequestController.creatRawFlatRequest)
.get(flatRequestController.getMyFlatRequests,flatRequestController.getAllRawFlatRequests);

router.get('/my-requests/:flatRequestId',flatRequestController.getMyFlatRequest);
router.patch('/my-requests/:flatRequestId/cancel',flatRequestController.cancelMyFlatRequest);

router.get('/building-requests',flatRequestController.isMyBuilding,flatRequestController.getAllBuildingFlatRequests,flatRequestController.getAllRawFlatRequests);
router.get('/building-requests/:flatRequestId',flatRequestController.isMyBuilding,flatRequestController.getOneRawFlatRequest)
router.patch('/building-requests/:flatRequestId/accept',flatRequestController.isMyBuilding,flatRequestController.acceptBuildingFlatRequest)
router.patch('/building-requests/:flatRequestId/reject',flatRequestController.isMyBuilding,flatRequestController.rejectBuildingFlatRequest,flatRequestController.updateRawFlatRequest)

router.get('/join-requests',flatRequestController.isMyFlat,flatRequestController.getAllFlatJoinRequests,flatRequestController.getAllRawFlatRequests);
router.get('/join-requests/:flatRequestId',flatRequestController.isMyFlat,flatRequestController.getOneRawFlatRequest);
router.patch('/join-requests/:flatRequestId/accept',flatRequestController.isMyFlat,flatRequestController.acceptFlatJoinRequest);
router.patch('/join-requests/:flatRequestId/reject',flatRequestController.isMyFlat,flatRequestController.rejectFlatJoinRequest,flatRequestController.updateRawFlatRequest);

router.use(authController.restrictTo('admin'));
router.route('/')
.post(flatRequestController.creatRawFlatRequest)
.get(flatRequestController.getAllRawFlatRequests);

router.route('/:flatRequestId')
.get(flatRequestController.getOneRawFlatRequest)
.patch(flatRequestController.updateRawFlatRequest)
.delete(flatRequestController.deletRawFlatRequest);

module.exports = router;