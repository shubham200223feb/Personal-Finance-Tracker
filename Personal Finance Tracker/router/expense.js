const express = require("express");
const Expense = require("../model/expense");
const User = require("../model/user");
const sequelize = require("../utile/database");
const jwt = require("jsonwebtoken");
const path = require("path");
const user = require("../model/user");
const router = express.Router();
 const fs= require("fs");
 

// Middleware
const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
router.get("/backtoex",(req,res)=>{
  return res.sendFile(path.join(__dirname, "../public/expenses.html"))
})
router.get("/chartview",(req,res)=>{
  res.sendFile(path.join(__dirname,"../public/chart.html"))
})
router.get("/expenses-page", isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/expenses.html"));
});

// GET expenses (API)
router.get("/expencess", isAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      expenses,
      key_id: process.env.RAZORPAY_KEY_ID,
      userId: req.user.id,
      isPremium: req.user.isPremium,
      currentPage: page,
      totalPages,
      limit,
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/feachdata",isAuth,async(req,res)=>{
  try{
const holelist =await user.findAll({
      attributes: ["id", "name", "email", "totalamount"],
      order: [["totalamount", "DESC"]],
    });
res.json(holelist); 
  }catch(error){
    console.log("error while feching leaderbord data");
    console.log(error);
  }
})
router.get("/download",isAuth,async(req,res)=>{
  
    try {
    const data = await Expense.findAll({ where: { userId: req.user.id } });

    const dataexpencess = req.user.name + Date.now() + ".txt";
    let filedata = "Item,Amount,Category,Description\n";

    data.forEach(exp => {
      filedata += `${exp.item},${exp.amount},${exp.category},${exp.description || ""}\n`;
    });

    fs.writeFileSync("Server.txt", filedata);

    res.download("Server.txt", dataexpencess);
  } 

  catch(error){
    console.log("error while lodinin dta in database",error);
  }
})


// ADD Expense
router.post("/add", isAuth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { item, amount, category, description } = req.body;
    await Expense.create(
      { item, amount, category, description, userId: req.user.id },
      { transaction: t }
    );
    req.user.totalamount += parseInt(amount);
    await req.user.save({ transaction: t });
    await t.commit();
    res.redirect("/expenses-page");
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// DELETE Expense
router.post("/delete", isAuth, async (req, res) => {
      const { userid, amount, expencesid } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    user.totalamount -= parseInt(amount);
    if (user.totalamount < 0) user.totalamount = 0;
    await user.save();

    await Expense.destroy({ where: { id: expencesid }});
   
    res.redirect("/expenses-page");
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Delete failed" });
  }
});
router.get("/chartviews",isAuth,async(req,res)=>{
  let data= await Expense.findAll({where:{userId:req.user.id}});
  console.log(data);
  res.json(data);
})
module.exports = router;
