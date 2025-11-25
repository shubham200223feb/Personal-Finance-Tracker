const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../model/user");
const sendResetEmail = require("../utile/email");

const router = express.Router();

// ================= GET ROUTES =================

// Default -> login page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Signup page
router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/signup.html"));
});

// Forget password page
router.get("/forgetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/forgetpassword.html"));
});

// Reset password page (with token id)
router.get("/reset-password/:id", (req, res) => {
  const tokenId = req.params.id;

  // reset-password.html file padhna
  let filePath = path.join(__dirname, "../public/reset-password.html");
  let html = fs.readFileSync(filePath, "utf-8");

  // Placeholder replace kar dena
  html = html.replace("{{tokenId}}", tokenId);
  res.send(html);
});

// ================= POST ROUTES =================


// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await user.findOne({ where: { email: email } });
    if (!data) {
      return res.sendFile(path.join(__dirname, "../public/signup.html"));
    }

    const comparepassword = await bcrypt.compare(password, data.password);
    if (!comparepassword) {
      return res.sendFile(path.join(__dirname, "../public/login.html"));
    }

    // ✅ Correct token generation
    const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(200).redirect("expenses-page");
  } catch (error) {
    console.log("error while login the user", error);
    res.send("Login failed");
  }
});

// Signup user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await user.findOne({ where: { email: email } });

    if (data) {
      return res.sendFile(path.join(__dirname, "../public/login.html"));
    }

    const newpassword = await bcrypt.hash(password, 10);
    const newUser = await user.create({
      name: name,
      email: email,
      password: newpassword,
    });

    // ✅ Token user ke actual id se generate karo
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    res.redirect("expenses-page");
  } catch (error) {
    console.log("error while signup the user ", error);
    res.send("Signup failed");
  }
});

module.exports = router;
