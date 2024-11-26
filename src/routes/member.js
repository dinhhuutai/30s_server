const express = require("express");
const router = express.Router();

const MemberController = require("../app/controllers/MemberController");

router.post("/create", MemberController.create);
router.post(
    "/findAllMemberByIdUser/:idUser",
    MemberController.findAllMemberByIdUser
);
router.post("/findMemberById/:id", MemberController.findMemberById);
router.post("/delete/:id", MemberController.delete);
router.post("/update/:id", MemberController.update);
router.post(
    "/findMemberByNameAndPhone/:idUser",
    MemberController.findMemberByNameAndPhone
);
router.post("/findAllMember", MemberController.findAllMember);
router.post("/changeMember", MemberController.changeMember);

module.exports = router;
