const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const refreshCookieName = "refreshToken";
const refreshCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth"
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Register error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const login = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const { password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshTokenSecret =
            process.env.REFRESH_TOKEN_SECRET || accessTokenSecret;

        if (!accessTokenSecret || !refreshTokenSecret) {
            console.error("ACCESS_TOKEN_SECRET is not configured");
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured"
            });
        }

        const accessToken = jwt.sign(
            { sub: user._id.toString() },
            accessTokenSecret,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
        );
        const refreshToken = jwt.sign(
            { sub: user._id.toString() },
            refreshTokenSecret,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
        );

        user.refreshToken = refreshToken;
        await user.save();
        res.cookie(refreshCookieName, refreshToken, {
            ...refreshCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const refreshSession = async (req, res) => {
    const refreshToken = req.cookies[refreshCookieName];
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is missing"
        });
    }

    if (!secret) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured"
        });
    }

    try {
        const payload = jwt.verify(refreshToken, secret);
        const user = await User.findById(payload.sub).select("+refreshToken");

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid"
            });
        }

        const accessToken = jwt.sign(
            { sub: user._id.toString() },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
        );
        const nextRefreshToken = jwt.sign(
            { sub: user._id.toString() },
            secret,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
        );

        user.refreshToken = nextRefreshToken;
        await user.save();
        res.cookie(refreshCookieName, nextRefreshToken, {
            ...refreshCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, accessToken });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid or expired"
            });
        }

        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const logout = async (req, res) => {
    const refreshToken = req.cookies[refreshCookieName];
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;

    if (refreshToken && secret) {
        try {
            const payload = jwt.verify(refreshToken, secret);
            await User.findOneAndUpdate(
                { _id: payload.sub, refreshToken },
                { $set: { refreshToken: null } }
            );
        } catch (error) {
            if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
                console.error("Logout error:", error);
            }
        }
    }

    res.clearCookie(refreshCookieName, refreshCookieOptions);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

const getCurrentUser = (req, res) => {
    const { _id, name, email, createdAt } = req.user;
    return res.status(200).json({
        success: true,
        user: { id: _id, name, email, createdAt }
    });
};

module.exports = {
    register,
    login,
    refreshSession,
    logout,
    getCurrentUser
};
