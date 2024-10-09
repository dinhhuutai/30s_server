const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    idUser: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
    },
    name: {
        type: String,
    },
    codeName: {
        type: String,
        require: true,
    },
    phone: {
        type: Array,
    },
    idTelegram: {
        type: Number,
    },
    idWhatsApp: {
        type: String,
    },
    runNumber: {
        type: Boolean,
        default: false,
    },
    co2conMN: {
        type: Number,
    },
    codauduoiMN: {
        type: Number,
    },
    codathangMN: {
        type: Number,
    },
    codaxienMN: {
        type: Number,
    },
    co3conMN: {
        type: Number,
    },
    co4conMN: {
        type: Number,
    },
    coxiuchuMN: {
        type: Number,
    },
    trung2conMN: {
        type: Number,
    },
    trungdauduoiMN: {
        type: Number,
    },
    trungdathangMN: {
        type: Number,
    },
    trungdaxienMN: {
        type: Number,
    },
    trung3conMN: {
        type: Number,
    },
    trung4conMN: {
        type: Number,
    },
    trungxiuchuMN: {
        type: Number,
    },
    co2conMT: {
        type: Number,
    },
    codauduoiMT: {
        type: Number,
    },
    codathangMT: {
        type: Number,
    },
    codaxienMT: {
        type: Number,
    },
    co3conMT: {
        type: Number,
    },
    co4conMT: {
        type: Number,
    },
    coxiuchuMT: {
        type: Number,
    },
    trung2conMT: {
        type: Number,
    },
    trungdauduoiMT: {
        type: Number,
    },
    trungdathangMT: {
        type: Number,
    },
    trungdaxienMT: {
        type: Number,
    },
    trung3conMT: {
        type: Number,
    },
    trung4conMT: {
        type: Number,
    },
    trungxiuchuMT: {
        type: Number,
    },
    co2conMB: {
        type: Number,
    },
    codauduoiMB: {
        type: Number,
    },
    codathangMB: {
        type: Number,
    },
    codaxienMB: {
        type: Number,
    },
    co3conMB: {
        type: Number,
    },
    co4conMB: {
        type: Number,
    },
    coxiuchuMB: {
        type: Number,
    },
    trung2conMB: {
        type: Number,
    },
    trungdauduoiMB: {
        type: Number,
    },
    trungdathangMB: {
        type: Number,
    },
    trungdaxienMB: {
        type: Number,
    },
    trung3conMB: {
        type: Number,
    },
    trung4conMB: {
        type: Number,
    },
    trungxiuchuMB: {
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

module.exports = mongoose.model("members", MemberSchema);
