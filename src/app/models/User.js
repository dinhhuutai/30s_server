const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    name: {
        type: String,
        require: true,
    },
    codeName: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    phone: {
        type: String,
    },
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    idTelegram: {
        type: Number,
    },
    quantityStorage: {
        type: Number,
    },
    refreshToken: {
        type: String,
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    updateDate: {
        type: Date,
        default: Date.now,
    },
    autoFindData: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model("users", UserSchema);
