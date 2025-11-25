const { DataTypes } = require("sequelize");
const sequelize = require("../utile/database");


const expense = sequelize.define("expense", {
  item: {type:DataTypes.STRING,
    defaultValue:"newuseradd"
  },
  amount: {type:DataTypes.INTEGER,
    defaultValue:0
  },
  category: {type:DataTypes.STRING,
    defaultValue:"newuser"
  },
  description:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  income:{
type:DataTypes.INTEGER,
defaultValue:0,
  },
  // notes:{
  //   type:DataTypes.STRING
  // }
});


module.exports=expense;
