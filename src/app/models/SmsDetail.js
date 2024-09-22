const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SmsDetailSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    idSms: {
        ref: "sms",
        type: mongoose.Schema.Types.ObjectId,
    },
    content: {
        type: String,
    },
    domain: {
        type: String,
    },
    province: {
        type: Array,
    },
    number: {
        type: Array,
    },
    typePlay: {
        type: String,
    },
    price: {
        type: Number,
    },
    diem: {
        type: Number,
    },
    tienxac: {
        type: Number,
    },
    tientrung: {
        type: Number,
    },
    resultDate: {
        type: Date,
    },
    dayOfWeek: {
        type: Number,
    },
    quantityLike: {
        type: Number,
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

module.exports = mongoose.model("smsDetails", SmsDetailSchema);
