const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const monument = require('monument');

const { Schema } = mongoose;

// Schema
const userSchema = new Schema
(
    {
        username:
        {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password:
        {
            type: String,
            trim: true,
            minlength: 7,

            // extra unneeded validation now
            // validate(value){
            //     if(value.toLowerCase().includes('password'))
            //     {
            //         throw new Error('Password should NOT contain the word [password]');
            //     }
            // }
        },
        role:
        {
            type: String,
            unique:false, // ADMIN - GUEST
            required: true,
            trim: true,
            uppercase: true,
            validate(value){
                if(!(value == "ADMIN" || value == "GUEST"))
                {
                    throw new Error('Role should be either ADMIN or GUEST');
                }
            }
        },
        phone:
        {
            type: String,
            validate(value) {
                if(!validator.isMobilePhone(value, "any"))
                {
                    throw new Error('This is NOT a valid phone number');
                }
            }
        },
        tokens:[{
                token:{
                    type: String,
                    required: true,
                }
            }],
        avatar: {
            type: Buffer,
            required: false,
        },
        // articles:[{ type: Schema.Types.ObjectId, ref: 'Article' }]
    },
    {
        timestamps: true
    }
);
// ______________________

userSchema.virtual('articles', {
    ref: 'Monument',
    localField: '_id',
    foreignField: 'createdBy'
})
// ______________________________________________________________________________________

// Middleware
userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    // delete userObject.avatar;


    return userObject;
}

userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8); 
    }

    next();
});

userSchema.pre('remove', async function(next){
    const user = this;

    // no need in the current business, we don't want to delete from the website monuments after deleteing staff memebers
    // await monument.deleteMany({owner:user._id});

    next();
});
// ______________________________________________________________________________________

userSchema.statics.findUserByCredentials = async (username, password) => {
    
    const user = await User.findOne({username});
    if(!user){
        throw new Error('Invalid Email or Password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);

    if(!isMatch){
        throw new Error('Invalid Username or Password');
    }

    return user;
}

// validate user
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET);

    user.tokens.push({token});
    await user.save(); // & here save actually does update

    return token;
}

const User = mongoose.model('User', userSchema);
module.exports = User;