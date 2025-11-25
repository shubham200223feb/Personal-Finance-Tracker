const { DataTypes } = require("sequelize");
const sequelize = require("../utile/database");
const User = require("./user");

const Order = sequelize.define("order", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderid: { type: DataTypes.STRING },
  paymentid: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
});

User.hasMany(Order);
Order.belongsTo(User);

module.exports = Order;
