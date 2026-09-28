const express = require("express");

const {
    register,
    login,
    refreshSession,
    logout,
    getCurrentUser
} = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const validate = require("../middleware/validation.middleware");

const router = express.Router();

router.post(
    "/register",
    registerValidator,
    validate,
    register
);

router.post(
    "/login",
    loginValidator,
    validate,
    login
);

router.post("/refresh-token", refreshSession);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
