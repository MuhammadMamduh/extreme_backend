const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const monumentSchema = new Schema
(
    {
        artist: 
        {
            type: String,
            required: 'please enter the Artist',
            trim: true,
        },
        
        description:
        {
            type: String,
            required: true,
        },

        picture:
        {
            type: Buffer,
            required: false,
        },

        deleted:
        {
            type: Boolean,
            default: false
        },

        createdBy:
        {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true // This will automatically add, createdAt & updatedAt fields in the collection
    }
);
// _____________________________________________________________________________

// Middleware
monumentSchema.methods.toJSON = function (){
    const monument = this;
    const monumentObject = monument.toObject();
    
    delete monumentObject.image;

    return monumentObject;
}
// _____________________________________________________________________________

monumentSchema.statics.validateId = (id) => {
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return true;
      }
      return false;
}
const Monument = mongoose.model('Monument', monumentSchema);
module.exports = Monument;