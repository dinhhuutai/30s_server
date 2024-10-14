const cron = require("node-cron");
const axios = require("axios");
const parseDate = require("./parseDate");
const KqxsController = require("../app/controllers/KqxsController");
const moment = require("moment");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const payBaoLo = require("./pay/payBaoLo");
const payDauDuoi = require("./pay/payDauDuoi");
const payXiuChu = require("./pay/payXiuChu");
const payDau = require("./pay/payDau");
const payDuoi = require("./pay/payDuoi");
const payXiuChuDau = require("./pay/payXiuChuDau");
const payXiuChuDuoi = require("./pay/payXiuChuDuoi");
const payDaThang = require("./pay/payDaThang");
const payDaXien = require("./pay/payDaXien");
const payBaylo = require("./pay/payBayLo");
const MemberController = require("../app/controllers/MemberController");
const RevenueController = require("../app/controllers/RevenueController");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");

function autoFindResultKQXSMN() {
    const fetchLotteryResults = async () => {
        try {
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth();
            const year = now.getFullYear();
            const dayOfWeek = now.getDay() + 1;

            const resOnlyAdminEdit = await OnlyAdminEditController.findCron();
            const rs = resOnlyAdminEdit.onlyAdminEdit[0];

            if (dayOfWeek === 2) {
                await findKqxs(rs?.urltp, day, month, year, "mn", "tp");
                await findKqxs(rs?.urldt, day, month, year, "mn", "dt");
                await findKqxs(rs?.urlcm, day, month, year, "mn", "cm");
            } else if (dayOfWeek === 3) {
                await findKqxs(rs?.urlbr, day, month, year, "mn", "br");
                await findKqxs(rs?.urlvt, day, month, year, "mn", "vt");
                await findKqxs(rs?.urlbi, day, month, year, "mn", "bi");
            } else if (dayOfWeek === 4) {
                await findKqxs(rs?.urldn, day, month, year, "mn", "dn");
                await findKqxs(rs?.urlct, day, month, year, "mn", "ct");
                await findKqxs(rs?.urlst, day, month, year, "mn", "st");
            } else if (dayOfWeek === 5) {
                await findKqxs(rs?.urltn, day, month, year, "mn", "tn");
                await findKqxs(rs?.urlag, day, month, year, "mn", "ag");
                await findKqxs(rs?.urlbt, day, month, year, "mn", "bt");
            } else if (dayOfWeek === 6) {
                await findKqxs(rs?.urlbu, day, month, year, "mn", "bu");
                await findKqxs(rs?.urlvl, day, month, year, "mn", "vl");
                await findKqxs(rs?.urltv, day, month, year, "mn", "tv");
            } else if (dayOfWeek === 7) {
                await findKqxs(rs?.urltp, day, month, year, "mn", "tp");
                await findKqxs(rs?.urlla, day, month, year, "mn", "la");
                await findKqxs(rs?.urlbp, day, month, year, "mn", "bp");
                await findKqxs(rs?.urlhg, day, month, year, "mn", "hg");
            } else if (dayOfWeek === 1) {
                await findKqxs(rs?.urltg, day, month, year, "mn", "tg");
                await findKqxs(rs?.urlkg, day, month, year, "mn", "kg");
                await findKqxs(rs?.urllt, day, month, year, "mn", "lt");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    const findKqxs = async (url, day, month, year, domain, province) => {
        const response = await axios.get(`${url}`);
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
            await addKqxs(results, domain, province, stt);
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
                data = data.reverse();
                data = data.map((item) => item.split(","));

                let rs = data.reduce((acc, curr) => acc.concat(curr), []);

                const kqxsObj = {
                    domain: domain,
                    province: province,
                    resultDate: results.t.issueList[stt].turnNum,
                    result: rs,
                };

                await KqxsController.createCron(kqxsObj);

                console.log("lấy kết quả xổ số mn success");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    cron.schedule(
        "*/1 16 * * *",
        async (job) => {
            try {
                // Lấy thời gian hiện tại
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();

                // const now1 = new Date("09-19-2024");
                // const date = moment(now1).format("YYYY-MM-DD");
                // const formattedDate = moment(now1).format("DD/MM/YYYY");

                // payRevenue(date, formattedDate, 'mn');

                // Kiểm tra xem có phải trong khoảng thời gian từ 16h đến 18h40 không
                if (hours === 16 && minutes <= 59) {
                    console.log("KQXS");
                    await fetchLotteryResults();
                }
            } catch (error) {
                console.log(error);
            }
        },
        {
            timezone: "Asia/Ho_Chi_Minh", // Thay đổi nếu bạn ở múi giờ khác
        }
    );

    cron.schedule(
        "*/1 16 * * *",
        async (job) => {
            try {
                // Lấy thời gian hiện tại
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();

                // Kiểm tra xem có phải trong khoảng thời gian từ 16h25 đến 17h không
                if (
                    (hours === 16 && minutes >= 25) ||
                    (hours === 17 && minutes === 0)
                ) {
                    console.log("PAY SMS");
                    await paySms("mn");
                }
            } catch (error) {
                console.log(error);
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

            console.log(kqxs);

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
                                        } else if (
                                            e.typePlay === "xiuchudau" ||
                                            e.typePlay === "xiuchudaudao"
                                        ) {
                                            pay = payXiuChuDau(
                                                e,
                                                sms.idMember,
                                                kqxs
                                            );
                                        } else if (
                                            e.typePlay === "xiuchuduoi" ||
                                            e.typePlay === "xiuchuduoidao"
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
                                        } else if (e.typePlay === "baylo") {
                                            pay = payBaylo(
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

                    // console.log(resRevenue.revenue);

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

module.exports = autoFindResultKQXSMN;
