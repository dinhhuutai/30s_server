const TelegramBot = require("node-telegram-bot-api");
const moment = require("moment");
const KqxsController = require("../app/controllers/KqxsController");
const convertContentDetail = require("./convertContentDetailChatBot/convertContentDetail");
const MemberController = require("../app/controllers/MemberController");
const payBySms = require("./convertContentDetailChatBot/payBySms");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const UserController = require("../app/controllers/UserController");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");

async function chatBotTelegram() {
    const resOnlyAdminEdit = await OnlyAdminEditController.findCron();
    const rs = resOnlyAdminEdit.onlyAdminEdit[0];

    // replace the value below with the Telegram token you receive from @BotFather
    const token =
        rs?.tokenChatBotTelegram ||
        "7485300336:AAFtQlfcz5B-m2EkwHy-qzsvM2t3SLp2oTI";

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {
        polling: true,
    });

    // Listen for any kind of message. There are different kinds of
    // messages.

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const messageId = msg.message_id;

        if (msg.text === "/id") {
            bot.sendMessage(chatId, `${chatId}`);
        } else {
            const tongxac = await handleSms(msg.text, chatId, userId);

            if (tongxac && tongxac > 0) {
                bot.sendMessage(chatId, `Tiền xác tin: ${tongxac}`, {
                    reply_to_message_id: messageId,
                });
            }
        }
    });
}

async function handleSms(content, idTelegram, userId) {
    let resSms;
    const dateCreate = new Date();
    const currentHour = dateCreate.getHours();
    const currentMinutes = dateCreate.getMinutes();

    const resUser = await UserController.findUserByIdTelegramCron(userId);

    if (resUser.user) {
        return;
    }

    try {
        const formattedDate = moment(dateCreate).format("DD/MM/YYYY");
        const resKQXS = await KqxsController.findKqxsByDateCron(formattedDate);

        const mn = [];
        const mt = [];
        const mb = [];
        if (resKQXS.success) {
            resKQXS?.data.map((e) => {
                if (e.domain === "mb") {
                    mb.push(e);
                } else if (e.domain === "mt") {
                    mt.push(e);
                } else if (e.domain === "mn") {
                    mn.push(e);
                }
            });
        }

        let { arr, errorSyntax } = convertContentDetail(content, dateCreate);
        let smsDetailList = arr;

        let mien = smsDetailList[0] && smsDetailList[0].domain;
        let kqxs = mien === "mn" ? mn : mien === "mt" ? mt : mb;

        const resMember = await MemberController.findMemberByIdTelegramCron(
            idTelegram
        );
        smsDetailList = payBySms(smsDetailList, resMember?.member, kqxs);

        let tongxac = 0;
        let tongtrung = 0;
        let tongdiem = 0;
        let diem2con = 0;
        let diem34con = 0;

        smsDetailList.map((e) => {
            tongxac += e.tienxac;
            tongtrung += e.tientrung;
            tongdiem += e.diem;
            if (e.number[0].length === 2) {
                diem2con += e.diem;
            } else {
                diem34con += e.diem;
            }
        });

        let form = {};
        const date = moment(dateCreate).format("YYYY-MM-DD");
        let dateTmp = new Date(date);

        dateTmp.setUTCHours(0, 0, 0, 0);

        if (
            (mien === "mn" &&
                (currentHour < 16 ||
                    (currentHour === 16 && currentMinutes < 15))) ||
            (mien === "mt" &&
                (currentHour < 17 ||
                    (currentHour === 17 && currentMinutes < 15))) ||
            (mien === "mb" &&
                (currentHour < 18 ||
                    (currentHour === 18 && currentMinutes < 15)))
        ) {
            form = {
                idUser: resMember?.member.idUser,
                idMember: resMember?.member._id,
                domain: mien,
                content,
                statusSms:
                    errorSyntax || tongxac < 0 ? "Chưa xử lý" : "Đang xử lý",
                resultDate: dateTmp,
                diem2con,
                diem34con,
                tongdiem,
                tongxac,
                typeSms: "Telegram",
            };
        } else {
            form = {
                idUser: resMember?.member.idUser,
                idMember: resMember?.member._id,
                domain: mien,
                content,
                statusSms: "Chưa xử lý",
                resultDate: dateTmp,
                diem2con,
                diem34con,
                tongdiem,
                tongxac,
                tongtrung,
                revenue,
                typeSms: "Telegram",
            };
        }

        resSms = await SmsController.createCron(form);

        if (resSms.success) {
            smsDetailList = smsDetailList.map((e) => {
                return { ...e, idSms: resSms.sms._id };
            });

            const resSmsDetail = await SmsDetailController.createCron(
                smsDetailList
            );

            if (resSmsDetail.success) {
                return tongxac;
            } else {
                await SmsController.updateCron(resSms?.sms._id, {
                    statusSms: "Chưa xử lý",
                });

                await SmsDetailController.deleteCron(resSms?.sms._id);
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await SmsController.updateCron(resSms?.sms._id, {
            statusSms: "Chưa xử lý",
        });

        await SmsDetailController.deleteCron(resSms?.sms._id);
    }
}

module.exports = chatBotTelegram;
