const payBaoLo = require("../payChatBot/payBaoLo");
const payDaThang = require("../payChatBot/payDaThang");
const payDaXien = require("../payChatBot/payDaXien");
const payDau = require("../payChatBot/payDau");
const payDauDuoi = require("../payChatBot/payDauDuoi");
const payDuoi = require("../payChatBot/payDuoi");
const payXiuChu = require("../payChatBot/payXiuChu");
const payXiuChuDau = require("../payChatBot/payXiuChuDau");
const payXiuChuDuoi = require("../payChatBot/payXiuChuDuoi");

function payBySms(sms, infoPlayer, kqxs) {
    sms = sms.map((e, index) => {
        let pay = {};

        if (e.typePlay === "baolo" || e.typePlay === "baolodao") {
            pay = payBaoLo(e, infoPlayer, kqxs);
        } else if (e.typePlay === "dauduoi") {
            pay = payDauDuoi(e, infoPlayer, kqxs);
        } else if (e.typePlay === "xiuchu" || e.typePlay === "xiuchudao") {
            pay = payXiuChu(e, infoPlayer, kqxs);
        } else if (e.typePlay === "dau") {
            pay = payDau(e, infoPlayer, kqxs);
        } else if (e.typePlay === "duoi") {
            pay = payDuoi(e, infoPlayer, kqxs);
        } else if (e.typePlay === "xiuchudau") {
            pay = payXiuChuDau(e, infoPlayer, kqxs);
        } else if (e.typePlay === "xiuchuduoi") {
            pay = payXiuChuDuoi(e, infoPlayer, kqxs);
        } else if (e.typePlay === "da(thang)") {
            pay = payDaThang(e, infoPlayer, kqxs);
        } else if (e.typePlay === "da(xien)") {
            pay = payDaXien(e, infoPlayer, kqxs);
        }

        return { ...e, ...pay };
    });

    return sms;
}

module.exports = payBySms;
