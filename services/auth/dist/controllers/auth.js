import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email, name, image } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
        user = await User.create({
            name,
            email,
            image,
        });
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.status(200).json({
        message: "Loging successfull",
        token: token,
        user: user,
    });
});
const allowedRoles = ["customer", "admin", "seller"];
export const addUserRole = TryCatch(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthoriszed user !",
        });
    }
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
        return res.status(401).json({
            message: "Invalid role !"
        });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });
});
