<<<<<<< HEAD
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
=======
import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("bearer ")) {
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - No token",
            });
            return;
        }
<<<<<<< HEAD
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
=======
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
        if (!decodedToken || !decodedToken.user) {
            res.status(401).json({
                message: "Please Login - Invalid token",
            });
            return;
        }
        req.user = decodedToken.user;
        next();
    }
    catch (error) {
        res.status(500).json({
<<<<<<< HEAD
            Message: "Please Login!",
        });
    }
};
exports.isAuth = isAuth;
=======
            Message: "Please Login!"
        });
    }
};
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
