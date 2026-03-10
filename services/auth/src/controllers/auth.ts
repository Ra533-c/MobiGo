import User from "../model/User.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required!",
    });
  }

  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);
  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
  );

  const { email, name, picture } = userRes.data;
  let user = await User.findOne({ email: email });
  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
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
/*1.typeof allowedRoles ➡️ Iska Type batao kya hai? (TypeScript dekhega ki ye ek locked array hai).
2.[number] ➡️ Is box (array) me jitne bhi numbers (Index 0, 1, 2) me elements baithe hain, saare nikalkar ek sath OR (|) lagakar jod do. */

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthoriszed user !",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(401).json({
      message: "Invalid role !",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );
  if (!user) {
    return res.status(404).json({
      message: "User not found!",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.json({
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.status(200).json(user);
});
