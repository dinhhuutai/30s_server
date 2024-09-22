const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KqxsSchema = new Schema({
    encodeId: {
        type: String,
        require: [true, "encodeId Song no underfined"],
        unique: true,
    },
    domain: {
        type: String,
    },
    province: {
        type: String,
    },
    resultDate: {
        type: String,
    },
    result: {
        type: Array,
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

module.exports = mongoose.model("kqxs", KqxsSchema);
