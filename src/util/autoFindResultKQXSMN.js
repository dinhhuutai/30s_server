require("dotenv").config();
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
const payTamlo = require("./pay/payTamLo");
const MemberController = require("../app/controllers/MemberController");
const RevenueController = require("../app/controllers/RevenueController");
const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");
const puppeteer =
    process.env.NODE_ENV === "production"
        ? require("puppeteer-core")
        : require("puppeteer");
//const puppeteer = require("puppeteer-core");

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
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "tp");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "dt");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "cm");
            } else if (dayOfWeek === 3) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "br");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "vt");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "bi");
            } else if (dayOfWeek === 4) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "dn");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "ct");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "st");
            } else if (dayOfWeek === 5) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "tn");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "ag");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "bt");
            } else if (dayOfWeek === 6) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "vl");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "bu");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "tv");
            } else if (dayOfWeek === 7) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "tp");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "la");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "bp");
                await findKQXSMN(rs?.urlmn, 4, day, month, year, "hg");
            } else if (dayOfWeek === 1) {
                await findKQXSMN(rs?.urlmn, 1, day, month, year, "tg");
                await findKQXSMN(rs?.urlmn, 2, day, month, year, "kg");
                await findKQXSMN(rs?.urlmn, 3, day, month, year, "lt");
            }
        } catch (error) {
            console.error("Lỗi khi lấy kết quả xổ số:", error);
        }
    };

    async function findKQXSMN(url, vt, day, month, year, province) {
        // Khởi động trình duyệt
        // const browser = await puppeteer.launch({
        //     executablePath: "/usr/bin/google-chrome",
        // });
        const browser =
            process.env.NODE_ENV === "production"
                ? await puppeteer.launch({
                      executablePath: "/usr/bin/google-chrome",
                      headless: true,
                  })
                : await puppeteer.launch({ headless: false });

        const page = await browser.newPage();

        // Tới trang kết quả xổ số Minh Ngọc
        await page.goto(url, {
            waitUntil: "networkidle2", // Đợi không còn yêu cầu mạng trong 500ms
            timeout: 60000,
        });

        let results;

        if (vt === 1) {
            results = await page.evaluate(() => {
                let ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                let [day, month, year] = ngay?.split("/").map(Number);

                if ((year + "").length === 2) {
                    year = Number("20" + year);
                }
                if (day < 10) {
                    day = "0" + day;
                }
                if (month < 10) {
                    month = "0" + month;
                }

                ngay = day + "/" + month + "/" + year;

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
                let ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                let [day, month, year] = ngay?.split("/").map(Number);

                if ((year + "").length === 2) {
                    year = Number("20" + year);
                }
                if (day < 10) {
                    day = "0" + day;
                }
                if (month < 10) {
                    month = "0" + month;
                }

                ngay = day + "/" + month + "/" + year;

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
                let ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                let [day, month, year] = ngay?.split("/").map(Number);

                if ((year + "").length === 2) {
                    year = Number("20" + year);
                }
                if (day < 10) {
                    day = "0" + day;
                }
                if (month < 10) {
                    month = "0" + month;
                }

                ngay = day + "/" + month + "/" + year;

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
                let ngay = document.querySelector(
                    "#box_tructiepkqxs div.content td td.ngay"
                )?.innerText;

                let [day, month, year] = ngay?.split("/").map(Number);

                if ((year + "").length === 2) {
                    year = Number("20" + year);
                }
                if (day < 10) {
                    day = "0" + day;
                }
                if (month < 10) {
                    month = "0" + month;
                }

                ngay = day + "/" + month + "/" + year;

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

        // In kết quả ra console
        console.log("Ngày:", results);

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

        // Đóng trình duyệt
        await browser.close();
    }

    const addKqxs = async (results, province) => {
        try {
            const kqxs = await KqxsController.findCron({
                resultDate: results.resultDate,
                province: province,
            });

            console.log(kqxs);

            if (kqxs.length === 0) {
                const kqxsObj = {
                    domain: "mn",
                    province: province,
                    resultDate: results.resultDate,
                    result: results.rs,
                };

                await KqxsController.createCron(kqxsObj);

                await paySms("mn");

                console.log("lấy kết quả xổ số mn success");
            } else if (
                kqxs[0].result.length < 18 ||
                kqxs[0].result[kqxs[0].result.length - 1] === ""
            ) {
                const kqxsObj = {
                    id: kqxs[0]._id,
                    result: results.rs,
                };

                await KqxsController.updateCron(kqxsObj);

                await paySms("mn");

                console.log("cập nhật kết quả xổ số mn success");
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
                if (hours === 16 && minutes >= 10 && minutes <= 40) {
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

                    console.log(
                        "resRevenue111111111111111111111111111: ",
                        resRevenue.revenue
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

module.exports = autoFindResultKQXSMN;
