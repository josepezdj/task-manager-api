const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            validator.isAlpha(value)
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(value.toString().length < 7){
                throw new Error('Password must be at least 7 characters long.')
            }
            if(value.toLowerCase().includes('password')) {
                throw new Error("Password cannot contain the word 'password' ")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true,
    versionKey: false
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Hash the plain password provided by the user.
userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }    
    
    next();
});

// Delete user's tasks when user is removed.
userSchema.pre('remove', async function(req, res, next) {
    await Task.deleteMany({owner: this._id});
    next()
});

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: '1 day' });

    this.tokens = this.tokens.concat({ token })
    await this.save();

    return token
};
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar
    return userObject
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user) {
        throw new Error('Unable to log in.')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to log in.')
    }
    return user
};

const User = mongoose.model('User', userSchema);

module.exports = User;