const Kqxs = require("../models/Kqxs");
const shortid = require("shortid");

class KqxsController {
    // [POST] /api/v1/kqxs/create
    async create(req, res, next) {
        try {
            const kqxs = new Kqxs({
                ...req.body,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await kqxs.save();

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async find(req, res, next) {
        try {
            const kqxs = await Kqxs.find({
                resultDate: req.body.resultDate,
                province: req.body.province,
            });

            res.status(200).json({
                success: true,
                kqxs,
            });
        } catch (error) {}
    }

    async createCron(data) {
        try {
            const kqxs = new Kqxs({
                ...data,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await kqxs.save();
        } catch (error) {}
    }

    async findCron(data) {
        try {
            const kqxs = await Kqxs.find({
                resultDate: data.resultDate,
                province: data.province,
            });

            return kqxs;
        } catch (error) {}
    }

    async updateCron(data) {
        try {
            const kqxs = await Kqxs.findByIdAndUpdate(
                data.id,
                {
                    result: data.result,
                },
                { new: true }
            );

            return kqxs;
        } catch (error) {}
    }

    // [POST] /api/v1/kqxs/findKqxsByDate
    async findKqxsByDate(req, res, next) {
        try {
            const kqxs = await Kqxs.find({
                resultDate: req.body.date,
            });

            return res.status(200).json({
                success: true,
                data: kqxs,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/kqxs/findKqxsByDateAndProvince
    async findKqxsByDateAndProvince(req, res, next) {
        try {
            const kqxs = await Kqxs.findOneAndUpdate(
                {
                    resultDate: req.body.resultDate,
                    province: req.body.province,
                },
                {
                    $set: { [`result.${req.body.index}`]: req.body.newNum },
                    updateDate: Date.now(),
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                data: kqxs,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async findKqxsByDateCron(date) {
        try {
            const kqxs = await Kqxs.find({
                resultDate: date,
            });

            return {
                success: true,
                data: kqxs,
            };
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async delete(req, res, next) {}

    async update(req, res, next) {
        try {
            const id = req.params.id;

            const kqxs = await Kqxs.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            );
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new KqxsController();
