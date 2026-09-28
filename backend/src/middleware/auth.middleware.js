const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : "";

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication is required"
        });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured"
        });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Access token is invalid or expired"
        });
    }

    try {
        const user = await User.findById(payload.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account was not found"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = authenticate;