const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    uId: {
        type: String,
        required: true,
    },
    wallet: {
        type: String,
        required: true
    }
},
{timestamps: true}
);

const UserDb = mongoose.model('UserDb', userSchema);

module.exports = UserDb;