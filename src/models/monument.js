const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const monumentSchema = new Schema
(
    {
        Artist: 
        {
            type: String,
            required: true,
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
    const article = this;
    const articleObject = article.toObject();
    
    delete articleObject.image;

    return articleObject;
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