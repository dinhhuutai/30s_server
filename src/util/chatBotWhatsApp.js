const request = require("request");
const moment = require("moment");
const KqxsController = require("../app/controllers/KqxsController");
const convertContentDetail = require("./convertContentDetailChatBot/convertContentDetail");
const MemberController = require("../app/controllers/MemberController");
const payBySms = require("./convertContentDetailChatBot/payBySms");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const UserController = require("../app/controllers/UserController");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");

async function chatBotWhatsApp(app) {
    const resOnlyAdminEdit = await OnlyAdminEditController.findCron();
    const rs = resOnlyAdminEdit.onlyAdminEdit[0];

    app.post("/webhook/whatsapp", async (req, res) => {
        try {
            const message = req.body.messages[0]?.text.body;
            const chatId = req.body.messages[0]?.chat_id;
            let sdtSend = req.body.messages[0]?.from;
            sdtSend = sdtSend.replace(/^84/, "0");

            console.log(req.body);
            if (message === "/id") {
                const options = {
                    method: "POST",
                    url: `https://gate.whapi.cloud/messages/text?token=${rs?.tokenChatBotWhatsApp}`,
                    headers: {
                        accept: "application/json",
                        "content-type": "application/json",
                    },
                    body: {
                        to: chatId,
                        body: chatId,
                    },
                    json: true,
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                });
            } else {
                console.log(sdtSend);
                if (sdtSend !== "0906411676") {
                    console.log(message);
                    const tongxac = await handleSms(message, chatId, sdtSend);
                }
            }

            res.sendStatus(200);
        } catch (error) {
            console.log(error);
        }
    });
}

async function handleSms(content, chatId, sdtSend) {
    let resSms;
    const dateCreate = new Date();
    const currentHour = dateCreate.getHours();
    const currentMinutes = dateCreate.getMinutes();

    const resUser = await UserController.findUserByPhoneWhatsAppCron(sdtSend);

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

        const resMember = await MemberController.findMemberByIdWhatsAppCron(
            chatId
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
                typeSms: "WhatsApp",
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
                typeSms: "WhatsApp",
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

module.exports = chatBotWhatsApp;
