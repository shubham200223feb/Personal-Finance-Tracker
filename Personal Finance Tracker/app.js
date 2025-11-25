const express=require("express");
require("dotenv").config();
const app=express();
const database= require("./utile/database");
const loginrouter= require("./router/login");
const path = require("path");
const port =3000;
const expencess=require("./router/expense");
const razorpay=require("./router/razorpay");
const cookieParser = require("cookie-parser");
const user=require("./model/user");
const exp= require("./model/expense");
user.hasMany(exp);
exp.belongsTo(user);

(async () => {
  try {
    await database.sync();
    console.log("MySQL connected & tables synced ✔");
  } catch (err) {
    console.log("Error syncing", err);
  }
})();


app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(loginrouter);
app.use(expencess);
app.use(razorpay);

app.listen(port,()=>{
    console.log(`server is listening in port 3000`);
})