const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OnlyAdminEditSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    urltp: {
        type: String,
    },
    urldt: {
        type: String,
    },
    urlcm: {
        type: String,
    },
    urlbr: {
        type: String,
    },
    urlvt: {
        type: String,
    },
    urlbi: {
        type: String,
    },
    urldn: {
        type: String,
    },
    urlct: {
        type: String,
    },
    urlst: {
        type: String,
    },
    urltn: {
        type: String,
    },
    urlag: {
        type: String,
    },
    urlbt: {
        type: String,
    },
    urlbu: {
        type: String,
    },
    urlvl: {
        type: String,
    },
    urltv: {
        type: String,
    },
    urlla: {
        type: String,
    },
    urlbp: {
        type: String,
    },
    urlhg: {
        type: String,
    },
    urltg: {
        type: String,
    },
    urlkg: {
        type: String,
    },
    urllt: {
        type: String,
    },
    urlpy: {
        type: String,
    },
    urlhu: {
        type: String,
    },
    urldl: {
        type: String,
    },
    urlqn: {
        type: String,
    },
    urldg: {
        type: String,
    },
    urlkh: {
        type: String,
    },
    urlqb: {
        type: String,
    },
    urlbd: {
        type: String,
    },
    urlqt: {
        type: String,
    },
    urlgl: {
        type: String,
    },
    urlnt: {
        type: String,
    },
    urlqg: {
        type: String,
    },
    urldo: {
        type: String,
    },
    urlkt: {
        type: String,
    },
    urlmb: {
        type: String,
    },
    codeRegister: {
        type: String,
    },
    tokenChatBotTelegram: {
        type: String,
    },
});

module.exports = mongoose.model("onlyAdminEdits", OnlyAdminEditSchema);
