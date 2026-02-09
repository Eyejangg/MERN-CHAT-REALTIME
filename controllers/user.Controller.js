const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
require("dotenv").config();



exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).send({
            message: "Please provide Fullname , Email , and Password",
        });

    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).send({
            message: "This Email is already laona existed",

        });

    }


    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = await UserModel.create({
            fullname,
            email,
            password: hashedPassword,
        });

        //save login in cookies
        // จากเดิม register เสร็จ ไปหน้า form login เพื่อทำการ login
        if (user) { // ส่วนนี้แสดงว่า เมื่อเรา register แล้ว เราจะ login ได้เลย มีอายุ token 1 วัน
            const secret = process.env.SECRET;
            const node_mode = process.env.node_mode;
            const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1d" });
            res.cookie("token", token, {
                httpOnly: true, // XSS ATTACK
                secure: node_mode !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            console.log("Token generated and cookie set")
        }
        res.status(201).send({
            message: "User registered successfully",
            user: user
        });
    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occured while registering the Fullname"
        });

    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({
            message: "Please Provide Email and Password",
        });
    }
    try {
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) {
            return res.status(404).send({ message: "email not found" });
        }
        const isPasswordMatched = bcrypt.compareSync(password, userDoc.password);
        if (!isPasswordMatched) {
            return res.status(401).send({ message: "Invalid Password" });
        }

        // login Successfully
        jwt.sign({ email, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) {
                return res.status(500).send({
                    message: "Internal server error : Authentication Failed",

                });
            }

            // Set Cookie
            const node_mode = process.env.node_mode;
            res.cookie("token", token, {
                httpOnly: true, // XSS ATTACK
                secure: node_mode !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            // token generation
            res.send({
                message: "Email User Login Succesfully",
                id: userDoc._id,
                email: userDoc.email,
                accessToken: token,
            });
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occured while login"
        })
    }

};
