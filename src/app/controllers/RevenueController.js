const Revenue = require("../models/Revenue");
const shortid = require("shortid");

class RevenueController {
    async createCron(data) {
        try {
            const revenue = new Revenue({
                ...data,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await revenue.save();

            return {
                success: true,
                revenue,
            };
        } catch (error) {
            console.log(error);
        }
    }

    async updateCron(id, form) {
        try {
            const revenue = await Revenue.findByIdAndUpdate(
                id,
                {
                    ...form,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            return {
                success: true,
                revenue,
            };
        } catch (error) {
            console.log(error);
        }
    }

    // [POST] /api/v1/revenue/create
    async create(req, res, next) {
        try {
            const revenue = new Revenue({
                ...req.body,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await revenue.save();

            return res.status(200).json({
                success: true,
                revenue,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async findRevenueBy(req, res, next) {
        try {
            const revenue = await Revenue.find({
                idMember: req.body.idMember,
                domain: req.body.domain,
                resultDate: req.body.resultDate,
            });

            return res.status(200).json({
                success: true,
                revenue,
            });
        } catch (error) {}
    }

    async findRevenueByCron(idMember, resultDate, domain) {
        try {
            const revenue = await Revenue.find({
                idMember,
                domain,
                resultDate,
            });

            return {
                success: true,
                revenue,
            };
        } catch (error) {}
    }

    // [POST] /api/v1/revenue/findRevenueByDateAndIdMember
    async findRevenueByDateAndIdMember(req, res, next) {
        try {
            const query = {
                resultDate: req.body.date,
                idUser: req.body.idUser,
            };

            // Kiểm tra nếu idMember không phải là 0, thì thêm vào query
            if (req.body.idMember !== 0 && req.body.idMember !== "0") {
                query.idMember = req.body.idMember;
            }

            const revenue = await Revenue.find(query).populate("idMember");

            return res.status(200).json({
                success: true,
                data: revenue,
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

            const revenue = await Revenue.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                revenue,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async delete(req, res, next) {
        try {
            const revenues = await Revenue.find({
                idUser: req.body.idUser,
                domain: req.body.domain,
                resultDate: req.body.resultDate,
            });

            console.log("revenues: ", revenues);
            console.log("idUser: ", req.body.idUser);
            console.log("domain: ", req.body.domain);
            console.log("resultDate: ", req.body.resultDate);

            await Promise.all(
                revenues.map(async (revenue, index) => {
                    await Revenue.findByIdAndDelete(revenue._id);
                })
            );

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new RevenueController();
