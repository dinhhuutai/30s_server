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
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    idTelegram: {
        type: String,
        require: true,
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
});

module.exports = mongoose.model("users", UserSchema);
