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
const payBaylo = require("./pay/payBayLo");
const SmsController = require("../app/controllers/SmsController");
const SmsDetailController = require("../app/controllers/SmsDetailController");
const MemberController = require("../app/controllers/MemberController");
const RevenueController = require("../app/controllers/RevenueController");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");
const puppeteer = require("puppeteer");

function autoFindResultKQXSMT() {
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
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "py");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "hu");
            } else if (dayOfWeek === 3) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "dl");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "qn");
            } else if (dayOfWeek === 4) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "dg");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "kh");
            } else if (dayOfWeek === 5) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "bd");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "qt");
                await findKQXSMT(rs?.urlmt, 3, day, month, year, "qb");
            } else if (dayOfWeek === 6) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "gl");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "nt");
            } else if (dayOfWeek === 7) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "dg");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "qg");
                await findKQXSMT(rs?.urlmt, 3, day, month, year, "do");
            } else if (dayOfWeek === 1) {
                await findKQXSMT(rs?.urlmt, 1, day, month, year, "kt");
                await findKQXSMT(rs?.urlmt, 2, day, month, year, "kh");
                await findKQXSMT(rs?.urlmt, 3, day, month, year, "hu");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    async function findKQXSMT(url, vt, day, month, year, province) {
        // Khởi động trình duyệt
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Tới trang kết quả xổ số Minh Ngọc
        await page.goto(url, {
            waitUntil: "domcontentloaded",
        });

        let results;

        if (vt === 1) {
            results = await page.evaluate(() => {
                const ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                const rs = [];

                for (let i = 8; i >= 0; i--) {
                    let num = document.querySelector(
                        `#box_tructiepkqxs div.content td + td table td .giai${
                            i === 0 ? "db" : i
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
        } else if (vt === 2) {
            results = await page.evaluate(() => {
                const ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                const rs = [];

                for (let i = 8; i >= 0; i--) {
                    let num = document.querySelector(
                        `#box_tructiepkqxs div.content td + td table td + td .giai${
                            i === 0 ? "db" : i
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
        } else if (vt === 3) {
            results = await page.evaluate(() => {
                const ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                const rs = [];

                for (let i = 8; i >= 0; i--) {
                    let num = document.querySelector(
                        `#box_tructiepkqxs div.content td + td table td + td + td .giai${
                            i === 0 ? "db" : i
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
        } else if (vt === 4) {
            results = await page.evaluate(() => {
                const ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                const rs = [];

                for (let i = 8; i >= 0; i--) {
                    let num = document.querySelector(
                        `#box_tructiepkqxs div.content td + td table td + td + td + td .giai${
                            i === 0 ? "db" : i
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
        }

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
                    domain: "mt",
                    province: province,
                    resultDate: results.resultDate,
                    result: results.rs,
                };

                await KqxsController.createCron(kqxsObj);

                await paySms("mt");

                console.log("lấy kết quả xổ số mt success");
            } else if (
                kqxs[0].result.length < 18 ||
                kqxs[0].result[kqxs[0].result.length - 1] === ""
            ) {
                const kqxsObj = {
                    id: kqxs[0]._id,
                    result: results.rs,
                };

                await KqxsController.updateCron(kqxsObj);

                await paySms("mt");

                console.log("cập nhật kết quả xổ số mt success");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    cron.schedule(
        "*/1 17 * * *",
        async (job) => {
            try {
                // Lấy thời gian hiện tại
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();

                // Kiểm tra xem có phải trong khoảng thời gian từ 16h đến 18h40 không
                if (hours === 17 && minutes >= 10 && minutes <= 40) {
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
