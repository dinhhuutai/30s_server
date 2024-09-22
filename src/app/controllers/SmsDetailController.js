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
}

module.exports = new SmsDetailController();
