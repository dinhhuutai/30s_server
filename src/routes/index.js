const kqxsRouter = require("./kqxs");
const userRouter = require("./user");
const memberRouter = require("./member");
const smsRouter = require("./sms");
const smsDetailRouter = require("./smsDetail");
const revenueRouter = require("./revenue");
const onlyAdminEditRouter = require("./onlyAdminEdit");

function routes(app) {
    app.use("/api/v1/kqxs", kqxsRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/member", memberRouter);
    app.use("/api/v1/sms", smsRouter);
    app.use("/api/v1/smsDetail", smsDetailRouter);
    app.use("/api/v1/revenue", revenueRouter);
    app.use("/api/v1/onlyAdminEdit", onlyAdminEditRouter);
}

module.exports = routes;
