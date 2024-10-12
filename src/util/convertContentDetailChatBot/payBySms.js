const payBaoLo = require("../pay/payBaoLo");
const payBayLo = require("../pay/payBayLo");
const payDaThang = require("../pay/payDaThang");
const payDaXien = require("../pay/payDaXien");
const payDau = require("../pay/payDau");
const payDauDuoi = require("../pay/payDauDuoi");
const payDuoi = require("../pay/payDuoi");
const payXiuChu = require("../pay/payXiuChu");
const payXiuChuDau = require("../pay/payXiuChuDau");
const payXiuChuDuoi = require("../pay/payXiuChuDuoi");

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
        } else if (
            e.typePlay === "xiuchudau" ||
            e.typePlay === "xiuchudaudao"
        ) {
            pay = payXiuChuDau(e, infoPlayer, kqxs);
        } else if (
            e.typePlay === "xiuchuduoi" ||
            e.typePlay === "xiuchuduoidao"
        ) {
            pay = payXiuChuDuoi(e, infoPlayer, kqxs);
        } else if (e.typePlay === "da(thang)") {
            pay = payDaThang(e, infoPlayer, kqxs);
        } else if (e.typePlay === "da(xien)") {
            pay = payDaXien(e, infoPlayer, kqxs);
        } else if (e.typePlay === "baylo") {
            pay = payBayLo(e, infoPlayer, kqxs);
        }

        return { ...e, ...pay };
    });

    return sms;
}

module.exports = payBySms;
