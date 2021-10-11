const { Schema, model } = require('mongoose');
const AppError = require('../util/app_error');

const flatRequestSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required : [true,'user is required ...!']
    },
    respondedBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    flatNo: {
        type : Number,
        min : 1,
        required: [true,'No flat found in your request ']
    },
    building: {
        type: Schema.ObjectId,
        ref: 'Building',
        required: [true ,'No building found in your request']
    },
    status: {
        type: String,
        enum:['SENT','CANCELED','ACCEPTED','REJECTED'],
        default: 'SENT',
    },
    flat: {
        type: Schema.ObjectId,
        ref: 'Flat'
    }
});

flatRequestSchema.methods.accept = function(user){
    if (this.status !== 'SENT') throw (new AppError(`request already ${this.status}`,400))
    this.status = 'ACCEPTED'
    this.respondedBy = user;
}

flatRequestSchema.index({flatNo: 1,building: 1,user: 1},{unique: true});

const FlatRequest = model('FlatRequest',flatRequestSchema);

module.exports = FlatRequest;