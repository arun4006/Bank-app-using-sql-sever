 const express=require('express');
  const router= new express.Router()
  var config = require('../dbconfig');
  const sql = require('mssql');
  const {auth}=require('../middlewares/validUser')
  const userinfo = require('../controllers/user.controller');
   

  // Create a new user profile $  [name,email,password,phone,amount,pin]
  router.post('/bank/signup', userinfo.create);

   //login 
  router.post('/bank/signin',userinfo.login);
  
  // logout user profile  
   router.post('/bank/signout',auth, userinfo.logout);

   //get balence by
   router.get('/bank/getbalance',auth,userinfo.getBalanece);

  //deposit amount by user 
  router.patch('/bank/deposit',auth,userinfo.depositAccountbyuser);

  //withdraw amount by user $
  router.patch('/bank/withdraw',auth,userinfo.withdrawAccountbyuser);

   //Payment history by user 
  router.get('/bank/transaction_history',auth,userinfo.getTransactiondetils);

  //transfer amount
  router.patch('/bank/moneytransfer',auth,userinfo.transferAmount);

//  //get email statements
  router.post('/bank/email-statements',auth,userinfo.getEmailStatements);
  
module.exports= router 