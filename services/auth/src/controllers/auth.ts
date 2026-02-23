import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";

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
  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });
  res.status(200).json({
    message: "Loging successfull",
    token: token,
    user: user,
  });
});

const allowedRoles = ["customer", "admin", "seller"] as const;

type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req:AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthoriszed user !",
    });
  }

  const { role } = req.body as { role: Role };

  if(!allowedRoles.includes(role)){
    return res.status(401).json({
      message:"Invalid role !"
    });
  }

  const user = await User.findByIdAndUpdate(req.user._id , {role},{new:true})
});
