const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.Controller");

//http://localhost:5000/api/v1/user/register
router.post("/register", userController.register);

//http://localhost:5000/api/v1/user/login
router.post("/login", userController.login);
module.exports = router;