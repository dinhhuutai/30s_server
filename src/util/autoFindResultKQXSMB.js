const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment");
const parseDate = require("./parseDate");
const KqxsController = require("../app/controllers/KqxsController");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const RevenueController = require("../app/controllers/RevenueController");
const MemberController = require("../app/controllers/MemberController");
const payBaoLo = require("./pay/payBaoLo");
const payDauDuoi = require("./pay/payDauDuoi");
const payXiuChu = require("./pay/payXiuChu");
const payDau = require("./pay/payDau");
const payDuoi = require("./pay/payDuoi");
const payXiuChuDau = require("./pay/payXiuChuDau");
const payXiuChuDuoi = require("./pay/payXiuChuDuoi");
const payDaThang = require("./pay/payDaThang");
const payDaXien = require("./pay/payDaXien");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");

function autoFindResultKQXSMB() {
    const fetchLotteryResults = async () => {
        try {
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth();
            const year = now.getFullYear();

            const resOnlyAdminEdit = await OnlyAdminEditController.findCron();
            const rs = resOnlyAdminEdit.onlyAdminEdit[0];

            const response = await axios.get(`${rs?.urlmb}`);
            const results = response.data;

            let stt = 0;
            results.t.issueList.map((item, index) => {
                const nowKQXS = parseDate(item.turnNum);
                const dayKQXS = nowKQXS.getDate();
                const monthKQXS = nowKQXS.getMonth();
                const yearKQXS = nowKQXS.getFullYear();

                if (
                    results &&
                    day === dayKQXS &&
                    month === monthKQXS &&
                    year === yearKQXS
                ) {
                    stt = index;
                }
            });

            const nowKQXS = parseDate(results.t.issueList[stt].turnNum);

            const dayKQXS = nowKQXS.getDate();
            const monthKQXS = nowKQXS.getMonth();
            const yearKQXS = nowKQXS.getFullYear();

            if (
                results &&
                day === dayKQXS &&
                month === monthKQXS &&
                year === yearKQXS
            ) {
                await addKqxs(results, "mb", "mb", stt);
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    const addKqxs = async (results, domain, province, stt) => {
        try {
            const kqxs = await KqxsController.findCron({
                resultDate: results.t.issueList[stt].turnNum,
                province: province,
            });

            if (kqxs.length === 0) {
                let data = JSON.parse(results.t.issueList[stt].detail);
                data = data.map((item) => item.split(","));

                let rs = data.reduce((acc, curr) => acc.concat(curr), []);

                const firstElement = rs.shift();
                rs.push(firstElement);

                const kqxsObj = {
                    domain: domain,
                    province: province,
                    resultDate: results.t.issueList[stt].turnNum,
                    result: rs,
                };

                await KqxsController.createCron(kqxsObj);

                console.log("lấy kết quả xổ số mb success");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    cron.schedule(
        "*/1 18 * * *",
        (job) => {
            // Lấy thời gian hiện tại
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Kiểm tra xem có phải trong khoảng thời gian từ 16h đến 18h40 không
            if (hours === 18 && minutes <= 59) {
                fetchLotteryResults();
            }
        },
        {
            timezone: "Asia/Ho_Chi_Minh", // Thay đổi nếu bạn ở múi giờ khác
        }
    );

    cron.schedule(
        "*/5 18 * * *",
        (job) => {
            // Lấy thời gian hiện tại
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Kiểm tra xem có phải trong khoảng thời gian từ 16h25 đến 17h không
            if (
                (hours === 18 && minutes >= 25) ||
                (hours === 19 && minutes === 0)
            ) {
                paySms("mb");
            }
        },
        {
            timezone: "Asia/Ho_Chi_Minh", // Thay đổi nếu bạn ở múi giờ khác
        }
    );

    const paySms = async (domain) => {
        try {
            const now = new Date();

            const formattedDate = moment(now).format("DD/MM/YYYY");

            const resKQXS = await KqxsController.findKqxsByDateCron(
                formattedDate
            );

            const kqxs = [];
            if (resKQXS.success) {
                resKQXS.data.map((e) => {
                    if (e.domain === domain) {
                        kqxs.push(e);
                    }
                });
            }

            if (kqxs.length >= 3) {
                const date = moment(now).format("YYYY-MM-DD");
                const smsMany = await SmsController.findSmsByStatusCron(
                    domain,
                    date
                );

                if (smsMany.success && smsMany.sms.length > 0) {
                    await Promise.all(
                        smsMany?.sms?.map(async (sms, index) => {
                            let smsDetails =
                                await SmsDetailController.findSmsDetailByIdSmsCron(
                                    sms._id
                                );

                            smsDetails = await Promise.all(
                                smsDetails?.smsDetails?.map(
                                    async (e, index) => {
                                        let pay = {};

                                        if (
                                            e.typePlay === "baolo" ||
                                            e.typePlay === "baolodao"
                                        ) {
                                            pay = payBaoLo(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (e.typePlay === "dauduoi") {
                                            pay = payDauDuoi(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (
                                            e.typePlay === "xiuchu" ||
                                            e.typePlay === "xiuchudao"
                                        ) {
                                            pay = payXiuChu(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (e.typePlay === "dau") {
                                            pay = payDau(e, sms.idMember, kqxs);
                                        } else if (e.typePlay === "duoi") {
                                            pay = payDuoi(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (e.typePlay === "xiuchudau") {
                                            pay = payXiuChuDau(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (
                                            e.typePlay === "xiuchuduoi"
                                        ) {
                                            pay = payXiuChuDuoi(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (e.typePlay === "da(thang)") {
                                            pay = payDaThang(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (e.typePlay === "da(xien)") {
                                            pay = payDaXien(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        }

                                        await SmsDetailController.updateCron(
                                            e._id,
                                            pay
                                        );

                                        return { ...e, ...pay };
                                    }
                                )
                            );

                            let tongtrung = 0;

                            smsDetails?.map((e) => {
                                tongtrung += e.tientrung;
                            });

                            const form = {
                                statusSms: "Đã xổ",
                                tongtrung,
                                revenue: sms.idMember.runNumber
                                    ? tongtrung - sms.tongxac
                                    : sms.tongxac - tongtrung,
                            };

                            await SmsController.updateCron(sms._id, form);
                        })
                    );

                    await payRevenue(date, formattedDate, domain);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const payRevenue = async (date, formattedDate, domain) => {
        const members = await MemberController.findAllMemberCron();

        if (members.success) {
            await Promise.all(
                members?.memberAll?.map(async (member, index) => {
                    const smsManyOfMember =
                        await SmsController.findSmsByIdMemberCron(
                            member._id,
                            domain,
                            date
                        );

                    //console.log(smsManyOfMember);

                    const resRevenue =
                        await RevenueController.findRevenueByCron(
                            member._id,
                            formattedDate,
                            domain
                        );

                    //console.log(resRevenue.revenue);

                    if (resRevenue.revenue.length < 1) {
                        let diem2con = 0;
                        let diem34con = 0;
                        let tongxac = 0;
                        let tongtrung = 0;
                        let revenue = 0;

                        smsManyOfMember?.sms?.map((e) => {
                            diem2con += e.diem2con;
                            diem34con += e.diem34con;
                            tongxac += e.tongxac;
                            tongtrung += e.tongtrung;
                            revenue += e.revenue;
                        });

                        const form = {
                            idMember: member._id,
                            idUser: member.idUser,
                            domain: domain,
                            diem2con,
                            diem34con,
                            tongxac,
                            tongtrung,
                            revenue,
                            resultDate: formattedDate,
                        };

                        await RevenueController.createCron(form);
                    }
                })
            );
        }
    };
}

module.exports = autoFindResultKQXSMB;
