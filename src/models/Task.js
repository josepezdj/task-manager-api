const mongoose = require('mongoose');

const { Schema } = require('mongoose');

const taskSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});



const Task = mongoose.model('Task', taskSchema);

module.exports = Task;