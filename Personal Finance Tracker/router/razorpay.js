const express = require("express");
const Razorpay = require("razorpay");
const Order = require("../model/order");
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Create Order
router.post("/create/order", isAuth, async (req, res) => {
  try {
    const amount = 25000; // ₹250
    const order = await razorpayInstance.orders.create({
      amount,
      currency: "INR",
    });

    await Order.create({
      orderid: order.id,
      status: "PENDING",
      userId: req.user.id,
    });

    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

// Update Order
router.post("/update/order-status", isAuth, async (req, res) => {
  const { order_id, payment_id } = req.body;
  const order = await Order.findOne({ where: { orderid: order_id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.paymentid = payment_id;
  order.status = "SUCCESS";
  await order.save();

  req.user.isPremium = true;
  await req.user.save();

  const token = await jwt.sign({id: req.user.id }, process.env.JWT_SECRET);
  res.cookie("token", token);

  res.json({ success: true });
});

module.exports = router;
