const { Schema, model } = require('mongoose');

const flatSchema = new Schema({
    building:{
        type: Schema.ObjectId,
        ref: 'Building'
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    flatNo : {
        type: Number,
        min: 1,
        required: [true,'flat no required'],
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },

    resedents: [{
        type: Schema.ObjectId,
        ref: 'User',
    }],
    
   
});
flatSchema.index({flatNo: 1,building: 1},{unique: true});

// flatSchema.pre(/^find/,function(next){
//     this.populate({
//         path: 'owner',
//         select: '-_id'
//     })
// })

const Flat = new model('Flat',flatSchema);

module.exports = Flat;