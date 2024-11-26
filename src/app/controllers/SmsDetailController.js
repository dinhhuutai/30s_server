const Sms = require("../models/Sms");
const SmsDetail = require("../models/SmsDetail");
const shortid = require("shortid");

class SmsDetailController {
    // [POST] /api/v1/smsDetail/create
    async create(req, res, next) {
        try {
            let smsData = req.body.data;

            smsData = smsData.map((e) => {
                return {
                    ...e,
                    encodeId: shortid.generate(),
                    createDate: Date.now(),
                };
            });

            const smsDetail = await SmsDetail.insertMany(smsData);

            res.status(200).json({
                success: true,
                smsDetail,
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
            let smsData = req;

            smsData = smsData.map((e) => {
                return {
                    ...e,
                    encodeId: shortid.generate(),
                    createDate: Date.now(),
                };
            });

            const smsDetail = await SmsDetail.insertMany(smsData);

            return {
                success: true,
                smsDetail,
            };
        } catch (error) {
            console.log(error);
            return { success: false, message: "Internal server error" };
        }
    }

    // [POST] /api/v1/smsDetail/findSmsDetailByIdMemberAndDomainAndDate/:idUser
    async findSmsDetailByIdMemberAndDomainAndDate(req, res, next) {
        try {
            const idUser = req.params.idUser;
            const idMember = req.query.idMember;
            const resultDate = req.query.resultDate;
            const domain = req.query.domain;

            let findDomain = {};
            if (!(domain === "0" || domain === 0)) {
                findDomain = {
                    domain,
                };
            }

            const dayStart = new Date(resultDate);
            const dayEnd = new Date(resultDate);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log(dayStart)
            console.log(dayEnd)
            console.log(resultDate)
            console.log(findDomain)
            console.log(idMember)

            const smsDetails = await SmsDetail.find({
                idUser,
                idMember,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                ...findDomain,
            });

            console.log('smsDetails: ', smsDetails);

            return res.status(200).json({
                success: true,
                smsDetails,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/smsDetail/findSmsDetailByIdSms/:idSms
    async findSmsDetailByIdSms(req, res, next) {
        try {
            const smsDetails = await SmsDetail.find({
                idSms: req.params.idSms,
            });

            return res.status(200).json({
                success: true,
                smsDetails,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findSmsDetailByRevenueWin(req, res, next) {
        try {
            const idMember = req.body.idMember;
            const resultDate = req.query.resultDate;
            const domain = req.body.domain;

            const dayStart = new Date(resultDate);
            const dayEnd = new Date(resultDate);
            dayStart.setUTCHours(0, 0, 0, 0);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setUTCHours(0, 0, 0, 0);

            console.log("dayStart: ", dayStart);
            console.log("dayEnd: ", dayEnd);
            console.log("resultDateSMSDETAIl: ", resultDate);

            const sms = await Sms.find({
                idMember,
                resultDate: { $gte: dayStart, $lt: dayEnd },
                deleted: false,
                domain,
            });

            let smsDetails = [];

            await Promise.all(
                sms.map(async (sm) => {
                    const res = await SmsDetail.find({
                        idSms: sm._id,
                        tientrung: { $gt: 0 },
                    });

                    if (res.length > 0) {
                        console.log("res: ", res);
                        smsDetails.push(...res);
                    }
                })
            );

            console.log("smsDetails: ", smsDetails);

            return res.status(200).json({
                success: true,
                smsDetails,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findSmsDetailByIdSmsCron(idSms) {
        try {
            const smsDetails = await SmsDetail.find({
                idSms: idSms,
            });

            return {
                success: true,
                smsDetails,
            };
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;

            const smsDetail = await SmsDetail.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                smsDetail,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async updateCron(id, data) {
        try {
            const smsDetail = await SmsDetail.findByIdAndUpdate(
                id,
                {
                    ...data,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            return {
                success: true,
                smsDetail,
            };
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async delete(req, res, next) {
        try {
            const idSms = req.params.idSms;

            const resDel = await SmsDetail.deleteMany({ idSms });

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async deleteCron(idSms) {
        try {
            const resDel = await SmsDetail.deleteMany({ idSms });

            return {
                success: true,
            };
        } catch (error) {
            return { success: false, message: "Internal server error" };
        }
    }
}

module.exports = new SmsDetailController();
