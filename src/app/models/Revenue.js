const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RevenueSchema = new Schema({
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
    diem2con: {
        type: Number,
    },
    diem34con: {
        type: Number,
    },
    tongxac: {
        type: Number,
    },
    tongtrung: {
        type: Number,
    },
    revenue: {
        type: Number,
    },
    resultDate: {
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

RevenueSchema.index([{ "createDate": 1 }], { expireAfterSeconds: 604800 })

module.exports = mongoose.model("revenues", RevenueSchema);
