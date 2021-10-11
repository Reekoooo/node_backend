const crypto = require('crypto');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userProfileSchema = new Schema({
    firstName: { 
        type: String ,
        required: [true,'First name is required'],
        trim: true,
        minLength: [2,'Too short'],
        maxLength: [20,'Too long']

    },
    lastName: { 
        type: String ,
        required: [true,'Last name is required'],
        trim: true,
        minLength: [2,'Too short'],
        maxLength: [20,'Too long']

    },
    profileImage:{
        type: String
    }
});

const userSchema = new Schema({
    email: { 
        type: String,
        unique: true,
        required: [true, 'email is required'],
        lowercase: true,
        trim: true, 
        validate: [validator.isEmail,'Email format is wrong']
    },

    role: {
        type: String,
        enum: ['user','admin'],
        default : 'user' 
    },
    buildingOwner:[{
        type: Schema.ObjectId,
        ref: 'Building',
    }],
    flatOwner:[{
        type: Schema.ObjectId,
        ref: 'Flat'
    
    }],
    flatResident:[{
        type: Schema.ObjectId,
        ref: 'Flat'
    }],
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters long'],
        trim : true ,
        select: false,
    },
    passwordConfirm : {
        type : String,
        required : [true,'confirm password required'],
        validate: {
            validator:function(el){
                return el === this.password;
            } ,
            message: 'Passwords must be the same'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,

    profile: userProfileSchema,
    fcm:[
       { type: String}
    ]
    


});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    if(!this.isNew){
        this.passwordChangedAt = Date.now()- 1000;
    }
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter = function (tokenTimestamp){
    const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    if (passwordChangedTimestamp > tokenTimestamp) return true; 
    return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this .passwordResetExpires = Date.now() + 10 *60 *1000;

    return resetToken;
};



const User = model('User', userSchema)

module.exports = User

