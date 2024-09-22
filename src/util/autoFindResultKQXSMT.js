const cron = require("node-cron");
const axios = require("axios");
const parseDate = require("./parseDate");
const KqxsController = require("../app/controllers/KqxsController");
const moment = require("moment");
const payBaoLo = require("./pay/payBaoLo");
const payDauDuoi = require("./pay/payDauDuoi");
const payXiuChu = require("./pay/payXiuChu");
const payDau = require("./pay/payDau");
const payDuoi = require("./pay/payDuoi");
const payXiuChuDau = require("./pay/payXiuChuDau");
const payXiuChuDuoi = require("./pay/payXiuChuDuoi");
const payDaThang = require("./pay/payDaThang");
const payDaXien = require("./pay/payDaXien");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const MemberController = require("../app/controllers/MemberController");
const RevenueController = require("../app/controllers/RevenueController");

function autoFindResultKQXSMT() {
    const fetchLotteryResults = async () => {
        try {
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth();
            const year = now.getFullYear();
            const dayOfWeek = now.getDay() + 1;

            if (dayOfWeek === 2) {
                await findKqxs("phye", day, month, year, "mt", "py");
                await findKqxs("thth", day, month, year, "mt", "hu");
            } else if (dayOfWeek === 3) {
                await findKqxs("dalak", day, month, year, "mt", "dl");
                await findKqxs("quna", day, month, year, "mt", "qn");
            } else if (dayOfWeek === 4) {
                await findKqxs("dana", day, month, year, "mt", "dg");
                await findKqxs("khho", day, month, year, "mt", "kh");
            } else if (dayOfWeek === 5) {
                await findKqxs("qubi", day, month, year, "mt", "qb");
                await findKqxs("bidi", day, month, year, "mt", "bd");
                await findKqxs("qutr", day, month, year, "mt", "qt");
            } else if (dayOfWeek === 6) {
                await findKqxs("gila", day, month, year, "mt", "gl");
                await findKqxs("nith", day, month, year, "mt", "nt");
            } else if (dayOfWeek === 7) {
                await findKqxs("dana", day, month, year, "mt", "dg");
                await findKqxs("qung", day, month, year, "mt", "qg");
                await findKqxs("dano", day, month, year, "mt", "do");
            } else if (dayOfWeek === 1) {
                await findKqxs("khho", day, month, year, "mt", "kh");
                await findKqxs("kotu", day, month, year, "mt", "kt");
                await findKqxs("thth", day, month, year, "mt", "hu");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    const findKqxs = async (url, day, month, year, domain, province) => {
        const response = await axios.get(
            `https://xoso188.net/api/front/open/lottery/history/list/1/${url}`
        );
        const results = response.data;

        const nowKQXS = parseDate(results.t.issueList[0].turnNum);
        const dayKQXS = nowKQXS.getDate();
        const monthKQXS = nowKQXS.getMonth();
        const yearKQXS = nowKQXS.getFullYear();

        if (
            results &&
            day === dayKQXS &&
            month === monthKQXS &&
            year === yearKQXS
        ) {
            await addKqxs(results, domain, province);
        }
    };

    const addKqxs = async (results, domain, province) => {
        try {
            const kqxs = await KqxsController.findCron({
                resultDate: results.t.issueList[0].turnNum,
                province: province,
            });

            if (kqxs.length === 0) {
                let data = JSON.parse(results.t.issueList[0].detail);
                data = data.reverse();
                data = data.map((item) => item.split(","));

                let rs = data.reduce((acc, curr) => acc.concat(curr), []);

                const kqxsObj = {
                    domain: domain,
                    province: province,
                    resultDate: results.t.issueList[0].turnNum,
                    result: rs,
                };

                await KqxsController.createCron(kqxsObj);

                console.log("lấy kết quả xổ số mt success");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    cron.schedule(
        "*/1 17 * * *",
        (job) => {
            // Lấy thời gian hiện tại
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Kiểm tra xem có phải trong khoảng thời gian từ 16h đến 18h40 không
            if (hours === 17 && minutes <= 59) {
                fetchLotteryResults();
            }
        },
        {
            timezone: "Asia/Ho_Chi_Minh", // Thay đổi nếu bạn ở múi giờ khác
        }
    );

    cron.schedule(
        "*/5 17 * * *",
        (job) => {
            // Lấy thời gian hiện tại
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Kiểm tra xem có phải trong khoảng thời gian từ 16h25 đến 17h không
            if (
                (hours === 17 && minutes >= 25) ||
                (hours === 18 && minutes === 0)
            ) {
                paySms("mt");
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

module.exports = autoFindResultKQXSMT;
