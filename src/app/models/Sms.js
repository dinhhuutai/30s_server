const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SmsSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    idUser: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
    },
    idMember: {
        ref: "members",
        type: mongoose.Schema.Types.ObjectId,
    },
    domain: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    contentEdit: {
        type: String,
        require: true,
    },
    locationError: {
        type: Array,
    },
    typeSms: {
        type: String,
    },
    diem2con: {
        type: Number,
    },
    diem34con: {
        type: Number,
    },
    tongdiem: {
        type: Number,
    },
    tongxac: {
        type: Number,
    },
    tongtrung: {
        type: Number,
    },
    statusSms: {
        type: String,
    },
    errorSyntax: {
        type: String,
    },
    revenue: {
        type: Number,
    },
    resultDate: {
        type: Date,
    },
    deleted: {
        type: Boolean,
        default: false,
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

SmsSchema.index([{ "createDate": 1 }], { expireAfterSeconds: 604800 })

module.exports = mongoose.model("sms", SmsSchema);
