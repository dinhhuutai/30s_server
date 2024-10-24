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
const payBaylo = require("./pay/payBayLo");
const payTamlo = require("./pay/payTamLo");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");
//const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-core");

function autoFindResultKQXSMB() {
    const fetchLotteryResults = async () => {
        try {
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth();
            const year = now.getFullYear();

            const resOnlyAdminEdit = await OnlyAdminEditController.findCron();
            const rs = resOnlyAdminEdit.onlyAdminEdit[0];

            await findKQXSMB(rs?.urlmb, day, month, year, "mb");
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    async function findKQXSMB(url, day, month, year, province) {
        // Khởi động trình duyệt
        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });
        //const browser = await puppeteer.launch();

        const page = await browser.newPage();

        // Tới trang kết quả xổ số Minh Ngọc
        await page.goto(url, {
            waitUntil: "domcontentloaded",
        });

        const results = await page.evaluate(() => {
            let ngay = document.querySelector(
                "#box_tructiepkqxs td.ngay span"
            )?.innerText;
            ngay = ngay.slice(6);

            let [day, month, year] = ngay?.split("/").map(Number);

            if ((year + "").length === 2) {
                year = Number("20" + year);
            }

            ngay = day + "/" + month + "/" + year;

            const rs = [];

            for (let i = 1; i <= 8; i++) {
                let num = document.querySelector(
                    `#box_tructiepkqxs div.content tr tbody td.giai${
                        i === 8 ? "db" : i
                    }`
                )?.innerText;

                num = num?.split("\n");

                if (num) {
                    rs.push(...num);
                }
            }

            // Trả về giá trị để in ra ngoài
            return {
                resultDate: ngay,
                rs,
            };
        });

        const nowKQXS = parseDate(results.resultDate);
        const dayKQXS = nowKQXS.getDate();
        const monthKQXS = nowKQXS.getMonth();
        const yearKQXS = nowKQXS.getFullYear();

        if (
            results.rs.length > 0 &&
            day === dayKQXS &&
            month === monthKQXS &&
            year === yearKQXS
        ) {
            await addKqxs(results, province);
        }

        // In kết quả ra console
        console.log("Ngày:", results); // In ra ngày của kết quả xổ số

        // Đóng trình duyệt
        await browser.close();
    }

    const addKqxs = async (results, province) => {
        try {
            const kqxs = await KqxsController.findCron({
                resultDate: results.resultDate,
                province: province,
            });

            if (kqxs.length === 0) {
                const kqxsObj = {
                    domain: "mb",
                    province: province,
                    resultDate: results.resultDate,
                    result: results.rs,
                };

                await KqxsController.createCron(kqxsObj);

                await paySms("mb");

                console.log("lấy kết quả xổ số mb success");
            } else if (
                kqxs[0].result.length < 27 ||
                kqxs[0].result[kqxs[0].result.length - 1] === ""
            ) {
                const kqxsObj = {
                    id: kqxs[0]._id,
                    result: results.rs,
                };

                await KqxsController.updateCron(kqxsObj);

                await paySms("mb");

                console.log("cập nhật kết quả xổ số mb success");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    cron.schedule(
        "*/1 18 * * *",
        async (job) => {
            try {
                // Lấy thời gian hiện tại
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();

                // Kiểm tra xem có phải trong khoảng thời gian từ 16h đến 18h40 không
                if (hours === 18 && minutes >= 10 && minutes <= 40) {
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

            if (kqxs.length >= 1) {
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
                                        } else if (e.typePlay === "tamlo") {
                                            pay = payTamlo(
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

        //console.log('members: ', members);
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
                    } else {
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
                            domain: domain,
                            diem2con,
                            diem34con,
                            tongxac,
                            tongtrung,
                            revenue,
                        };

                        await RevenueController.updateCron(
                            resRevenue.revenue[0]._id,
                            form
                        );
                    }
                })
            );
        }
    };
}

module.exports = autoFindResultKQXSMB;
