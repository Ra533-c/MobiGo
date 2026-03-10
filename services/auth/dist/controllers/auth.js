"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myProfile = exports.addUserRole = exports.loginUser = void 0;
const User_js_1 = __importDefault(require("../model/User.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const trycatch_js_1 = __importDefault(require("../middlewares/trycatch.js"));
const googleConfig_js_1 = require("../config/googleConfig.js");
exports.loginUser = (0, trycatch_js_1.default)(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required!",
        });
    }
    const googleRes = await googleConfig_js_1.oauth2client.getToken(code);
    googleConfig_js_1.oauth2client.setCredentials(googleRes.tokens);
    const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    const { email, name, picture } = userRes.data;
    let user = await User_js_1.default.findOne({ email: email });
    if (!user) {
        user = await User_js_1.default.create({
            name,
            email,
            image: picture,
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.status(200).json({
        message: "Loging successfull",
        token: token,
        user: user,
    });
});
const allowedRoles = ["customer", "admin", "seller"];
/*1.typeof allowedRoles ➡️ Iska Type batao kya hai? (TypeScript dekhega ki ye ek locked array hai).
2.[number] ➡️ Is box (array) me jitne bhi numbers (Index 0, 1, 2) me elements baithe hain, saare nikalkar ek sath OR (|) lagakar jod do. */
exports.addUserRole = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthoriszed user !",
        });
    }
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
        return res.status(401).json({
            message: "Invalid role !",
        });
    }
    const user = await User_js_1.default.findByIdAndUpdate(req.user._id, { role }, { new: true });
    if (!user) {
        return res.status(404).json({
            message: "User not found!",
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.json({
        user,
        token,
    });
});
exports.myProfile = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    res.status(200).json(user);
});
