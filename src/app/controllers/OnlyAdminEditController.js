const OnlyAdminEdit = require("../models/OnlyAdminEdit");
const shortid = require("shortid");

class OnlyAdminEditController {
    // [POST] /api/v1/onlyAdminEdit/create
    async create(req, res, next) {
        try {
            const onlyAdminEdit = new OnlyAdminEdit({
                ...req.body,
                encodeId: shortid.generate(),
                createDate: Date.now(),
            });

            await onlyAdminEdit.save();

            return res.status(200).json({
                success: true,
                onlyAdminEdit,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;

            const onlyAdminEdit = await OnlyAdminEdit.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                onlyAdminEdit,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async find(req, res, next) {
        try {
            const onlyAdminEdit = await OnlyAdminEdit.find();

            return res.status(200).json({
                success: true,
                onlyAdminEdit,
            });
        } catch (error) {}
    }

    async findCron() {
        try {
            const onlyAdminEdit = await OnlyAdminEdit.find();

            return {
                success: true,
                onlyAdminEdit,
            };
        } catch (error) {}
    }
}

module.exports = new OnlyAdminEditController();
