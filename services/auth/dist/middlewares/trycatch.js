<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
=======
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            res.status(500).json({
                message: err.message
            });
        }
    };
};
<<<<<<< HEAD
exports.default = TryCatch;
=======
export default TryCatch;
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
