const express = require('express')
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads');
    },
    filename: function (req,file,cb){
        cb(null,req.user._id+ file.originalname);
    }
});
const fileFilter = (req,file,cb)=>{
    if( file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/svg+xml' || 
        file.mimetype === 'application/octet-stream') {
        cb(null,true)
    }else{
        cb(null,false)
    }
    
}
const upload = multer({
    storage,
    limits:{fileSize: 1024 * 1024 *100},
    fileFilter: fileFilter
});
const userController = require('../controllers/user_controller');
const authController = require('../controllers/auth_controller');


router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);

router.use(authController.protect);
router.post('/logout',authController.logout);
router.patch('/updateEmail',authController.updateEmail);
router.patch('/updateMe',upload.single('profileImage'),userController.updateMe);

router.use(authController.restrictTo('admin'))
router.route('/')
.post(userController.createUser)
.get(userController.getAllUsers);

router.route('/:userId')
.get(userController.getUserById)
.delete(userController.deletUser)
.patch(userController.updateUser)


module.exports = router;