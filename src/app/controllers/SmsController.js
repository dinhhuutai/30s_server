const Sms = require("../models/Sms");
const shortid = require("shortid");

class SmsController {
    // [POST] /api/v1/sms/create
    async create(req, res, next) {
        try {
            console.log(req.body);
            const sms = new Sms({
                ...req.body,
                contentEdit: req.body.content,
                typeSms: "manual",
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await sms.save();

            res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async createCron(req) {
        try {
            const sms = new Sms({
                ...req,
                contentEdit: req.content,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await sms.save();

            return {
                success: true,
                sms,
            };
        } catch (error) {
            console.log(error);
            return { success: false, message: "Internal server error" };
        }
    }

    // [POST] /api/v1/sms/findSmsById/:id
    async findSmsById(req, res, next) {
        try {
            const sms = await Sms.findById(req.params.id).populate("idMember");

            return res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/sms/findSmsByNameAndPhone/:idUser?idMember=''&resultDate=''&domain=''&sortName=''&sortCreateDate=''
    async findSmsByNameAndPhone(req, res, next) {
        try {
            const idMember = req.query.idMember;
            const resultDate = req.query.resultDate;
            const domain = req.query.domain;
            const deleted = req.query.deleted;

            const sortName = Number(req?.query?.sortName);
            const sortCreateDate = Number(req?.query?.sortCreateDate);

            let sort = { createDate: -1 };
            if (sortName === 1 || sortName === -1) {
                sort = { idMember: sortName };
            } else if (sortCreateDate === 1 || sortCreateDate === -1) {
                sort = { createDate: sortCreateDate };
            }

            let findByMember = {};
            if (!(idMember === 0 || idMember === "0")) {
                findByMember = {
                    idMember,
                };
            }

            let findDomain = {};
            if (domain === "other") {
                findDomain = {
                    statusSms: "Chưa xử lý",
                };
            } else {
                findDomain = {
                    domain,
                };
            }

            const dayStart = new Date(resultDate);
            const dayEnd = new Date(resultDate);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);
            console.log("resultDateSMS: ", resultDate);

            const sms = await Sms.find({
                idUser: req.params.idUser,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                deleted: deleted,
                ...findDomain,
                ...findByMember,
            })
                .sort(sort)
                .populate("idMember");

            return res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findSmsDeleted(req, res, next) {
        try {
            const resDel = await Sms.find({
                idUser: req.params.idUser,
                deleted: true,
            }).populate("idMember");

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async restoreSmsAll(req, res, next) {
        try {
            const { listId } = req.body;

            const updateResults = await Promise.all(
                listId.map(async (id) => {
                    const resDel = await Sms.findByIdAndUpdate(
                        id,
                        {
                            deleted: false,
                        },
                        { new: true }
                    );
                    return resDel;
                })
            );

            return res.status(200).json({
                success: true,
                sms: updateResults,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async delete(req, res, next) {
        try {
            const { listId } = req.body;

            const updateResults = await Promise.all(
                listId.map(async (id) => {
                    const resDel = await Sms.findByIdAndUpdate(
                        id,
                        {
                            deleted: true,
                        },
                        { new: true }
                    );
                    return resDel;
                })
            );

            return res.status(200).json({
                success: true,
                sms: updateResults,
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

            const sms = await Sms.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            ).populate("idMember");

            res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async updateCron(id, data) {
        try {
            const sms = await Sms.findByIdAndUpdate(
                id,
                {
                    ...data,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            return {
                success: true,
                sms,
            };
        } catch (error) {}
    }

    async findSmsByStatusCron(domain, date) {
        try {
            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);

            const sms = await Sms.find({
                statusSms: { $in: ["Đang xử lý", "Đã xử lý"] },
                domain: domain,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                deleted: false,
            }).populate("idMember");

            return {
                success: true,
                sms,
            };
        } catch (error) {
            console.log(error);
        }
    }

    async findSmsByStatus(req, res, next) {
        try {
            const dayStart = new Date(req.query.date);
            const dayEnd = new Date(req.query.date);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);
            console.log("resultDateSMS: ", req.query.date);

            const sms = await Sms.find({
                statusSms: { $in: ["Đang xử lý", "Đã xử lý", "Đã xổ"] },
                idUser: req.body.idUser,
                domain: req.body.domain,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                deleted: false,
            }).populate("idMember");

            return res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async findSmsByIdMemberCron(idMember, domain, date) {
        try {
            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);
            console.log("resultDateSMS: ", date);

            const sms = await Sms.find({
                idMember,
                domain,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                statusSms: "Đã xổ",
                deleted: false,
            }).populate("idMember");

            return {
                success: true,
                sms,
            };
        } catch (error) {
            console.log(error);
        }
    }

    async findSmsByIdMember(req, res, next) {
        try {
            const dayStart = new Date(req.query.date);
            const dayEnd = new Date(req.query.date);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);
            console.log("resultDateSMS: ", req.query.date);

            const sms = await Sms.find({
                idMember: req.body.idMember,
                domain: req.body.domain,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                statusSms: "Đã xổ",
                deleted: false,
            }).populate("idMember");

            return res.status(200).json({
                success: true,
                sms,
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new SmsController();
