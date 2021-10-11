const { Schema, model } = require('mongoose');


const buildingProfile = new Schema({
    name:{
        type: String,
        required: [true,'Building must have a name']
    },
    
    address: {
        type: String,
        required: [true,'Building address is missing']
    },

});

const buildingSchema = new Schema({
    profile: buildingProfile,
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    }
    
});


const Building = new model('Building',buildingSchema);

module.exports = Building;
