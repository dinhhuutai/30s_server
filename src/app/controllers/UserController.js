const User = require("../models/User");
const shortid = require("shortid");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "365d" }
    );
};

class UserController {
    // [POST] /api/v1/user/login
    async login(req, res, next) {
        const { username, password } = req.body;

        if (!username) {
            return res
                .status(400)
                .json({ success: false, message: "Username is required" });
        }
        if (!password) {
            return res
                .status(400)
                .json({ success: false, message: "Password is required" });
        }

        try {
            let user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect username or password",
                });
            }

            const passwordValid = await argon2.verify(user.password, password);
            if (!passwordValid) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect username or password",
                });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });

            // Lưu refreshToken vào database
            user = await User.findByIdAndUpdate(
                user._id,
                { refreshToken },
                { new: true }
            ).select("-password -refreshToken -createDate -updateDate");

            res.status(200).json({
                success: true,
                user,
                accessToken,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [POST] /api/v1/user/register
    async register(req, res, next) {
        const { name, username, password } = req.body;

        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: "Name is required" });
        }
        if (!username) {
            return res
                .status(400)
                .json({ success: false, message: "Username is required" });
        }
        if (!password) {
            return res
                .status(400)
                .json({ success: false, message: "Password is required" });
        }

        try {
            const user = await User.findOne({ username });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: "Tên tài khoản đã tồn tại",
                });
            }

            const hashedPassword = await argon2.hash(password);

            let newUser = new User({
                ...req.body,
                encodeId: shortid.generate(),
                password: hashedPassword,
            });

            await newUser.save();

            const accessToken = generateAccessToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });

            // Lưu refreshToken vào database
            newUser = await User.findByIdAndUpdate(
                newUser._id,
                { refreshToken },
                { new: true }
            ).select("-password");

            res.status(200).json({
                success: true,
                user: newUser,
                accessToken,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    // [GET] /api/v1/user/:id
    async getSingleUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id).select("-password");

            if (!user) {
                return res
                    .status(400)
                    .json({ success: false, message: "User not found" });
            }

            res.json({ success: true, user });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // [POST] /api/v1/user/refresh
    async requestRefreshToken(req, res, next) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json("You're not authenticated");
        }

        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );

            const user = await User.findOne({ _id: decoded.id, refreshToken });

            if (user) {
                const accessToken = generateAccessToken(user);

                return res.status(200).json({ success: true, accessToken });
            } else {
                return res.status(403).json({ success: false });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(403)
                .json({ success: false, message: "Invalid token" });
        }
    }

    // [POST] /api/v1/user/logout
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return res.status(401).json("You're not authenticated");
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            const userId = decoded.id;

            const rs = await User.findOneAndUpdate(
                { refreshToken: refreshToken },
                { refreshToken: "" },
                { new: true }
            );

            if (rs) {
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                });
                return res.status(200).json({ success: true });
            }
        } catch (error) {
            return res.status(400).json({ success: false });
        }
    }

    // [GET] /api/v1/user/check
    async checkUser(req, res, next) {
        try {
            const user = await User.findById(req.id).select("-password");

            if (!user) {
                return res
                    .status(400)
                    .json({ success: false, message: "User not found" });
            }
            return res.json({ success: true, user });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }

    async create(req, res, next) {}

    async delete(req, res, next) {}

    async update(req, res, next) {
        try {
            const id = req.params.id;

            const user = await User.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    updateDate: Date.now(),
                },
                { new: true }
            );

            return res.json({ success: true, user });
        } catch (error) {
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new UserController();
