const{Sequelize}= require("sequelize");
const database = new Sequelize("expenses","root","root",{
    host:"localhost",
    dialect:"mysql",
}); 
module.exports=database;