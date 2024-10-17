const Member = require("../models/Member");
const shortid = require("shortid");
const Sms = require("../models/Sms");
const Revenue = require("../models/Revenue");

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
}

module.exports = new MemberController();
