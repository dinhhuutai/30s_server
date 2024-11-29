require("dotenv").config();
const Member = require("../models/Member");
const shortid = require("shortid");
const Sms = require("../models/Sms");
const Revenue = require("../models/Revenue");
const puppeteer =
    process.env.NODE_ENV === "production"
        ? require("puppeteer-core")
        : require("puppeteer");
//const puppeteer = require("puppeteer-core");

class MemberController {
    // [POST] /api/v1/member/create
    async create(req, res, next) {
        try {
            const member = new Member({
                ...req.body,
                codeName: req.body.name.toLowerCase(),
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await member.save();

            res.status(200).json({
                success: true,
                member,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/member/findAllMemberByIdUser/:idUser
    async findAllMemberByIdUser(req, res, next) {
        try {
            const members = await Member.find({
                idUser: req.params.idUser,
            }).sort({ createDate: -1 });

            return res.status(200).json({
                success: true,
                members,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/member/findMemberById/:id
    async findMemberById(req, res, next) {
        try {
            const member = await Member.findById(req.params.id);

            return res.status(200).json({
                success: true,
                member,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findMemberByIdTelegramCron(idTelegram) {
        try {
            const member = await Member.findOne({ idTelegram });

            return {
                success: true,
                member,
            };
        } catch (error) {
            return { success: false, message: "Internal server error" };
        }
    }

    async findMemberByIdWhatsAppCron(idWhatsApp) {
        try {
            const member = await Member.findOne({ idWhatsApp });

            return {
                success: true,
                member,
            };
        } catch (error) {
            return { success: false, message: "Internal server error" };
        }
    }

    // [POST] /api/v1/member/findMemberByNameAndPhone/:idUser?name=''&sortName=''&sortCreateDate=''
    async findMemberByNameAndPhone(req, res, next) {
        try {
            const name = req.query.name;

            const sortName = Number(req?.query?.sortName);
            const sortCreateDate = Number(req?.query?.sortCreateDate);

            let sort = { createDate: -1 };
            if (sortName === 1 || sortName === -1) {
                sort = { codeName: sortName };
            } else if (sortCreateDate === 1 || sortCreateDate === -1) {
                sort = { createDate: sortCreateDate };
            }

            const members = await Member.find({
                $or: [
                    { name: { $regex: new RegExp(name, "i") } },
                    { phone: { $elemMatch: { $regex: name } } },
                ],
                idUser: req.params.idUser,
            }).sort(sort);

            return res.status(200).json({
                success: true,
                members,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async delete(req, res, next) {
        try {
            const resDel = await Member.findByIdAndDelete(req.params.id);

            const resDelSms = await Sms.deleteMany({
                idMember: req.params.id,
            });

            const resDelRevenue = await Revenue.deleteMany({
                idMember: req.params.id,
            });

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;

            let codeName = {};

            if (req.body.name) {
                codeName = {
                    codeName: req.body.name.toLowerCase(),
                };
            }

            const member = await Member.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    ...codeName,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                member,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findAllMember(req, res, next) {
        try {
            const memberAll = await Member.find();

            return res.status(200).json({
                success: true,
                memberAll,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findAllMemberCron() {
        try {
            const memberAll = await Member.find();

            return {
                success: true,
                memberAll,
            };
        } catch (error) {
            console.log(error);
        }
    }

    async changeMember(req, res, next) {
        let browser;

        try {
            const idUser = req.body.idUser;
            const username = req.body.username;
            const password = req.body.password;

            // Khởi động trình duyệt
            // browser = await puppeteer.launch({
            //     executablePath: "/usr/bin/google-chrome",
            // });
            browser =
                process.env.NODE_ENV === "production"
                    ? await puppeteer.launch({
                          executablePath: "/usr/bin/google-chrome",
                      })
                    : await puppeteer.launch();
            const page = await browser.newPage();

            // Tới trang đăng nhập
            await page.goto("https://30s.biz/#/login", {
                waitUntil: "domcontentloaded",
            });

            await page.waitForSelector('[formcontrolname="username"]', {
                visible: true,
                timeout: 10000,
            });
            await page.type('[formcontrolname="username"]', username); // Thay 'your-username' bằng tên người dùng thực tế

            // Chờ trường password xuất hiện và điền thông tin
            await page.waitForSelector('[formcontrolname="password"]', {
                visible: true,
                timeout: 10000,
            });
            await page.type('[formcontrolname="password"]', password); // Thay 'your-password' bằng mật khẩu thực tế

            // Nhấn nút "Đăng Nhập"
            await page.waitForSelector(
                "button.btn.btn-success.btn-quirk.btn-block",
                { timeout: 10000 }
            );
            await page.click("button.btn.btn-success.btn-quirk.btn-block");

            // Chờ để đảm bảo đăng nhập thành công
            await page.waitForNavigation({
                waitUntil: "domcontentloaded",
                timeout: 15000,
            });

            console.log("Đăng nhập thành công!");

            // Tới trang kết quả xổ số Minh Ngọc sau khi đăng nhập thành công
            await page.goto("https://30s.biz/#/member", {
                waitUntil: "domcontentloaded",
            });

            // Chờ cho đến khi nút "OK" xuất hiện trong modal
            await page.waitForSelector("button.swal2-confirm.swal2-styled", {
                timeout: 10000,
            });

            // Click vào nút "OK"
            await page.click("button.swal2-confirm.swal2-styled");

            console.log('Đã click vào nút "OK".');

            await page.waitForFunction(
                'document.querySelectorAll("tr.ng-star-inserted").length > 0',
                { timeout: 10000 }
            );

            let results = await page.evaluate(async () => {
                let rows = document.querySelectorAll("tr.ng-star-inserted");

                let members = [];

                for (const row of rows) {
                    const pencilButton = row.querySelector("a i.fa-pencil");

                    if (pencilButton) {
                        pencilButton.click(); // Click vào biểu tượng pencil

                        // Wait for the modal dialog to appear
                        await new Promise((resolve) => {
                            const checkModal = setInterval(() => {
                                const modalDialog =
                                    document.querySelector(".modal-dialog");
                                if (modalDialog) {
                                    clearInterval(checkModal);
                                    resolve(modalDialog); // Resolve when modal is found
                                }
                            }, 100); // Check every 100ms
                        });

                        const modalDialog =
                            document.querySelector(".modal-dialog");

                        if (modalDialog) {
                            // Wait for the modal dialog to appear
                            await new Promise((resolve) => {
                                const checkModal = setInterval(() => {
                                    const modalDialog = document.querySelector(
                                        'input[formcontrolname="name"].form-control.ng-untouched.ng-pristine.ng-valid'
                                    );
                                    if (modalDialog) {
                                        clearInterval(checkModal);
                                        resolve(modalDialog); // Resolve when modal is found
                                    }
                                }, 100); // Check every 100ms
                            });

                            let name = document.querySelector(
                                'input[formcontrolname="name"].form-control.ng-untouched.ng-pristine.ng-valid'
                            )?.value;

                            let runNumber;

                            const labels = document.querySelectorAll(
                                "label.col-sm-4.control-label"
                            );

                            // Lặp qua từng label để tìm phần tử có innerText là "Chạy số"
                            labels.forEach((label) => {
                                if (label.innerText.trim() === "Chạy số") {
                                    // Tìm form-group cha của label này
                                    const formGroup =
                                        label.closest(".form-group");

                                    // Tìm phần tử col-sm-8 trong form-group này
                                    const colSm8 =
                                        formGroup.querySelector(".col-sm-8");

                                    if (colSm8) {
                                        // Tìm phần tử có class 'toggle-on' trong col-sm-8
                                        const toggleOn =
                                            colSm8.querySelector(
                                                ".toggle-on.active"
                                            );

                                        const toggleOff =
                                            colSm8.querySelector(
                                                ".toggle-off.active"
                                            );

                                        if (toggleOn) {
                                            runNumber = true; // Hoặc xử lý toggleOn theo cách bạn muốn
                                        }
                                        if (toggleOff) {
                                            runNumber = false; // Hoặc xử lý toggleOn theo cách bạn muốn
                                        }
                                    }
                                }
                            });

                            let co2conMN = document.querySelector(
                                'input[placeholder="Giá cò 2 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codauduoiMN = document.querySelector(
                                'input[placeholder="Giá cò Đầu - Đuôi MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codathangMN = document.querySelector(
                                'input[placeholder="Giá cò Đá Thẳng MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codaxienMN = document.querySelector(
                                'input[placeholder="Giá cò Đá Xiên MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co3conMN = document.querySelector(
                                'input[placeholder="Giá cò 3 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co4conMN = document.querySelector(
                                'input[placeholder="Giá cò 4 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let coxiuchuMN = document.querySelector(
                                'input[placeholder="Giá cò xỉu chủ MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung2conMN = document.querySelector(
                                'input[placeholder="Trúng Bao lô 2 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdauduoiMN = document.querySelector(
                                'input[placeholder="Trúng Đầu - Đuôi MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdathangMN = document.querySelector(
                                'input[placeholder="Trúng đá thẳng MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdaxienMN = document.querySelector(
                                'input[placeholder="Trúng đá xiên MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let typeTrungdathangMN = true;
                            let typeTrungdaxienMN = false;
                            let trung3conMN = document.querySelector(
                                'input[placeholder="Trúng 3 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung4conMN = document.querySelector(
                                'input[placeholder="Trúng 4 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungxiuchuMN = document.querySelector(
                                'input[placeholder="Trúng 3 con MN"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;

                            let co2conMT = document.querySelector(
                                'input[placeholder="Giá cò 2 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codauduoiMT = document.querySelector(
                                'input[placeholder="Giá cò Đầu - Đuôi MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codathangMT = document.querySelector(
                                'input[placeholder="Giá cò Đá Thẳng MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codaxienMT = document.querySelector(
                                'input[placeholder="Giá cò Đá Xiên MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co3conMT = document.querySelector(
                                'input[placeholder="Giá cò 3 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co4conMT = document.querySelector(
                                'input[placeholder="Giá cò 4 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let coxiuchuMT = document.querySelector(
                                'input[placeholder="Giá cò xỉu chủ MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung2conMT = document.querySelector(
                                'input[placeholder="Trúng Bao lô 2 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdauduoiMT = document.querySelector(
                                'input[placeholder="Trúng Đầu - Đuôi MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdathangMT = document.querySelector(
                                'input[placeholder="Trúng đá thẳng MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdaxienMT = document.querySelector(
                                'input[placeholder="Trúng đá xiên MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let typeTrungdathangMT = true;
                            let typeTrungdaxienMT = false;
                            let trung3conMT = document.querySelector(
                                'input[placeholder="Trúng 3 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung4conMT = document.querySelector(
                                'input[placeholder="Trúng 4 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungxiuchuMT = document.querySelector(
                                'input[placeholder="Trúng 3 con MT"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;

                            let co2conMB = document.querySelector(
                                'input[placeholder="Giá cò 2 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codauduoiMB = document.querySelector(
                                'input[placeholder="Giá cò Đầu - Đuôi MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let codathangMB = document.querySelector(
                                'input[placeholder="Giá cò Đá Thẳng MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co3conMB = document.querySelector(
                                'input[placeholder="Giá cò 3 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let co4conMB = document.querySelector(
                                'input[placeholder="Giá cò 4 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let coxiuchuMB = document.querySelector(
                                'input[placeholder="Giá cò xỉu chủ MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung2conMB = document.querySelector(
                                'input[placeholder="Trúng Bao lô 2 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdauduoiMB = document.querySelector(
                                'input[placeholder="Trúng Đầu - Đuôi MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungdathangMB = document.querySelector(
                                'input[placeholder="Trúng đá thẳng MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let typeTrungdathangMB = false;
                            let trung3conMB = document.querySelector(
                                'input[placeholder="Trúng 3 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trung4conMB = document.querySelector(
                                'input[placeholder="Trúng 4 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;
                            let trungxiuchuMB = document.querySelector(
                                'input[placeholder="Trúng 3 con MB"].form-control.ng-untouched.ng-pristine.ng-valid.ng-star-inserted'
                            )?.value;

                            members.push({
                                name,
                                runNumber,
                                co2conMN,
                                codauduoiMN,
                                codathangMN,
                                codaxienMN,
                                co3conMN,
                                co4conMN,
                                coxiuchuMN,
                                trung2conMN,
                                trungdauduoiMN,
                                trungdathangMN,
                                trungdaxienMN,
                                typeTrungdathangMN,
                                typeTrungdaxienMN,
                                trung3conMN,
                                trung4conMN,
                                trungxiuchuMN,
                                co2conMT,
                                codauduoiMT,
                                codathangMT,
                                codaxienMT,
                                co3conMT,
                                co4conMT,
                                coxiuchuMT,
                                trung2conMT,
                                trungdauduoiMT,
                                trungdathangMT,
                                trungdaxienMT,
                                typeTrungdathangMT,
                                typeTrungdaxienMT,
                                trung3conMT,
                                trung4conMT,
                                trungxiuchuMT,
                                co2conMB,
                                codauduoiMB,
                                codathangMB,
                                co3conMB,
                                co4conMB,
                                coxiuchuMB,
                                trung2conMB,
                                trungdauduoiMB,
                                trungdathangMB,
                                typeTrungdathangMB,
                                trung3conMB,
                                trung4conMB,
                                trungxiuchuMB,
                            });

                            const closeButton = document.querySelector(
                                'button[type="button"].btn.btn-default.btn-quirk'
                            );
                            console.log("closeButton: ", closeButton);
                            // Chờ modal đóng hoàn toàn (kiểm tra lại sự tồn tại của modal)
                            await new Promise((resolve) => {
                                const checkModalClose = setInterval(() => {
                                    const modalDialogClosed =
                                        document.querySelector(".modal-dialog");
                                    if (!modalDialogClosed) {
                                        clearInterval(checkModalClose);
                                        resolve(); // Modal đã đóng
                                    } else {
                                        closeButton.click();
                                    }
                                }, 100); // Kiểm tra mỗi 100ms
                            });
                        }
                    }
                }

                // Trả về giá trị để in ra ngoài
                return members;
            });

            results = results?.map((member) => {
                return {
                    ...member,
                    idUser,
                    encodeId: shortid.generate(),
                };
            });

            await browser.close();

            if (results.length > 0 && results[0].trungxiuchuMB) {
                await Member.insertMany(results);
            } else {
                return res.status(200).json({
                    success: false,
                });
            }

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            browser.close();
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new MemberController();
