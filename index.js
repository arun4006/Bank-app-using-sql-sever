var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
//var router = express.Router();
const userRouter=require('./routes/user.routes')
var config = require('./dbconfig');
const sql = require('mssql');

app.use(cors());

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter)


var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(__dirname)
  console.log('Order API is runnning at ' + port);
})