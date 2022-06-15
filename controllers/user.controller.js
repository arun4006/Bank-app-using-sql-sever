const express = require('express')
var config = require('../dbconfig');
const sql = require('mssql');
const bcrypt = require('bcryptjs')
const { findByCredentials, generateAuthToken } = require('../middlewares/validUser')
const {sendWelcomeMail}=require('../emails/accounts')
const ejs = require("ejs");
const path = require("path");


exports.create = async (req, res) => {
  try {
    console.log(req.body);
    await sql.connect(config);
    let password = await bcrypt.hash(req.body.password, 12)

    console.log(password)
    console.log("type:", typeof password)

    let user_id = "ey" + (Math.floor(Math.random() * 1000000) + 1).toString();

    //  Register user
    var request = new sql.Request();

    request.input('Id', sql.NVarChar, user_id)
    request.input('Name', sql.NVarChar, req.body.name)
    request.input('Email', sql.NVarChar, req.body.email)
    request.input('Password', sql.NVarChar, req.body.password)

    request.input('Accno', sql.NVarChar, (Math.floor(Math.random() * 1000000) + 1).toString())
    request.input('Amount', sql.Int, 0)
    request.input('Pin', sql.NVarChar, req.body.pin)
    request.input('Owner', sql.NVarChar, user_id)
      .execute("Register_Bank_user").then(function (recordSet) {
        res.status(200).json({
          msg: "success",
          rowsAffected: recordSet.rowsAffected
        })

      })

    //to set hasing password     
    new sql.Request().query(`update Persons set Password='${password}' where Email='${req.body.email}' `, (err, result) => {
      // ... error checks
      if (err) return res.send(err)
      return result.recordset;

    })
  }
  catch (err) {
    console.log(err)
    if (err.originalError.code == 'ELOGIN') {
      return res.send("Invalid  credentials")
    }
    res.send(err)

  }
}


//login
exports.login = async (req, res) => {
  try {
    await sql.connect(config);

    new sql.Request().query(`select * from Persons where Email='${req.body.email}' `, (err, result) => {
      // ... error checks
      if (err) return res.send(err)
      if (result.recordset.length == 0) {
        return res.send("users does not exist")
      }
      //res.send(result.recordset)
    })
    const user_data = await new sql.Request().query(`select * from Persons where Email='${req.body.email}'`)
    //console.log(user_data.recordset)

    const isValiddata = await findByCredentials(req.body.password, user_data.recordset)
    const userToken = await generateAuthToken(user_data.recordset)
    console.log("data:", isValiddata)

    if (isValiddata)
      res.json({
        "logged In": user_data.recordset[0].Name,
        "token": userToken
      })
    else
      res.send("Invalid Password")

    // })

  }
  catch (err) {
    console.log(err)
    if (err.originalError.code == 'ELOGIN') {
      return res.send("Invalid Configuration credentials")
    }
    res.send(err)

  }
}

// Logout
exports.logout = async (req, res) => {
  try {
    await sql.connect(config);

    new sql.Request().query(`update Persons set Tokens='NULL' where Tokens='${req.token}' `)

    res.json({ message: '' + req.user.Name + ' logout successfully..!' })
  } catch (e) {
    res.status(500).send()
  }
}

// get balance by authenticated user
exports.getBalanece = async (req, res) => {
  try {
    await sql.connect(config);

    const bank_info = await new sql.Request().query(`select  * from Bank where Owner='${req.user.Id}' `)

    //console.log(bank_info.recordset)

    if (bank_info.recordset.length == 0) {
      return res.status(404).send("Wrong credentials or Don't have an account")
    }

    res.status(200).json({
      Name: req.user.Name,
      Amount: bank_info.recordset[0].Amount
    })
  } catch (e) {
    res.status(500).send()
  }
}


// deposite amount by authenticated user
exports.depositAccountbyuser = async (req, res) => {

  try {
    await sql.connect(config);

    const BankAccountInfo = await new sql.Request().query(`select  * from Bank where Owner='${req.user.Id}' `)

    if (!(req.body.pin == BankAccountInfo.recordset[0].Pin)) {
      return res.status(401).send("please enter Valid pin");
    }

    var remainamount = BankAccountInfo.recordset[0].Amount + req.body.amount;
    // console.log(remainamount);
    const updateAmount = await new sql.Request().query(`update Bank set Amount=${remainamount} where Owner='${req.user.Id}' `)
    let time = (new Date()).toJSON();

    var request = new sql.Request();

    request.input('TransactionType', sql.NVarChar, 'CREDIT')
    request.input('TransactionAmount', sql.Int, req.body.amount)
    request.input('Time', sql.NVarChar, time)
    request.input('Owner', sql.NVarChar, req.user.Id)
    request.query('insert into Transactions (TransactionType,TransactionAmount,Time,Owner) values (@TransactionType,@TransactionAmount,@Time,@Owner)')

    res.json({
      "Amount": req.body.amount,
      "mode": "CREDIT",
      "status": "PAID",
    })

  } catch (e) {
    res.status(400).send(e)
  }
}


//withdraw account by authenticated user
exports.withdrawAccountbyuser = async (req, res) => {

  try {
    await sql.connect(config);

    const BankAccountInfo = await new sql.Request().query(`select  * from Bank where Owner='${req.user.Id}' `)

    if (!(req.body.pin == BankAccountInfo.recordset[0].Pin)) {
      return res.status(401).send("please enter Valid pin");
    }

    var remainamount = BankAccountInfo.recordset[0].Amount - req.body.amount;
    // console.log(remainamount);
    const updateAmount = await new sql.Request().query(`update Bank set Amount=${remainamount} where Owner='${req.user.Id}' `)
    let time = (new Date()).toJSON();

    var request = new sql.Request();

    request.input('TransactionType', sql.NVarChar, 'DEBIT')
    request.input('TransactionAmount', sql.Int, req.body.amount)
    request.input('Time', sql.NVarChar, time)
    request.input('Owner', sql.NVarChar, req.user.Id)
    request.query('insert into Transactions (TransactionType,TransactionAmount,Time,Owner) values (@TransactionType,@TransactionAmount,@Time,@Owner)')

    res.json({
      "Amount": req.body.amount,
      "mode": "DEBIT",
      "status": "PAID",
    })

  } catch (e) {
    res.status(400).send(e)
  }
}

//get transaction  history
exports.getTransactiondetils = async (req, res) => {

  try {
    await sql.connect(config);

    const bank_info = await new sql.Request().query(`select  * from Transactions where Owner='${req.user.Id}' `)

    //console.log(bank_info.recordset)

    if (bank_info.recordset.length == 0) {
      return res.status(404).send("Wrong credentials or Don't have an account")
    }

    res.status(200).json({
      "transaction_history": bank_info.recordset
    })
  } catch (e) {
    res.status(500).send(e)
  }
}

//transfer amount 
exports.transferAmount = async (req, res) => {
  try {
    await sql.connect(config);

    const BankAccountInfo = await new sql.Request().query(`select  * from Bank where Owner='${req.user.Id}' `)
    //console.log(BankAccountInfo.recordset);

    if (BankAccountInfo.recordset.length == 0) {
      return res.status(404).send("Wrong credentials or Not bank account holder")
    }

    if (req.body.amount > BankAccountInfo.recordset[0].Amount) {
      return res.status(401).json({ message: 'Insufficient amount' })
    }

    //receiver accno exist or not
    const ReceiverAccountInfo = await new sql.Request().query(`select  * from Bank where Accno='${req.body.accno}' `)
    //console.log(ReceiverAccountInfo.recordset);

    if (ReceiverAccountInfo.recordset.length == 0) {
      return res.status(404).send("Invalid Account number")
    }

    const ReceiverTotalAmount = ReceiverAccountInfo.recordset[0].Amount + req.body.amount;
    console.log("receiver account:" + ReceiverTotalAmount);


    const SenderTotalAmount = BankAccountInfo.recordset[0].Amount - req.body.amount;
    console.log("sender account:" + SenderTotalAmount);

    const updateReceiverAmount = await new sql.Request().query(`update Bank set Amount=${ReceiverTotalAmount} where Owner='${ReceiverAccountInfo.recordset[0].Owner}' `)
    const updateSenderAmount = await new sql.Request().query(`update Bank set Amount=${SenderTotalAmount} where Owner='${req.user.Id}' `)

    let time = (new Date()).toJSON();
    let transaction_info = [
      { "mode": "DEBIT", "amount": req.body.amount, "time": time, "id": req.user.Id },
      { "mode": "CREDIT", "amount": req.body.amount, "time": time, "id": ReceiverAccountInfo.recordset[0].Owner }
    ]
    

     var request = new sql.Request();
    request.input('senderTransactionType', sql.NVarChar, transaction_info[0].mode)
    request.input('senderTransactionAmount', sql.Int,transaction_info[0].amount)
    request.input('senderTime', sql.NVarChar, transaction_info[0].time)
    request.input('Sender', sql.NVarChar, transaction_info[0].id)
    request.input('ReceiverTransactionType', sql.NVarChar, transaction_info[1].mode)
    request.input('ReceiverTransactionAmount', sql.Int,transaction_info[1].amount)
    request.input('ReceiverTime', sql.NVarChar, transaction_info[1].time)
    request.input('Receiver', sql.NVarChar, transaction_info[1].id)
    .execute("Transaction_history").then(function (recordSet) {
      res.status(200).json({
        msg: "success",
        "status":"PAID",
        rowsAffected: recordSet.rowsAffected
      })

    })

  
  }
  catch (e) {
    res.status(500).send(e)
  }
}


//get email statments
exports.getEmailStatements = async (req, res) => {
 

  await sql.connect(config);
  const transaction_info = await new sql.Request().query(`select  * from Transactions where Owner='${req.user.Id}' `)
  const transaction_history=transaction_info.recordset.map(p=>({TransactionType:p.TransactionType.toString(),TransactionAmount:p.TransactionAmount.toString(),Time:p.Time.toString()}))
  console.log(transaction_history);
  let emailTemplate,username;
  // console.log(path.join(__dirname, "../views/print_history.ejs"));
   ejs.renderFile(path.join(__dirname, "../views/print_history.ejs"), 
       {
        
         beans: transaction_history,
         username:req.user.Name
       })
       .then(result => {
          emailTemplate = result;
          
          var mainOptions = {
           from:'aarunkumar334@gmail.com' ,
            to: req.user.Email,
            subject: 'Mini Statements-Transactions',
            html: emailTemplate
        }
        
        sendWelcomeMail(mainOptions)
        res.status(200).send({message:"Mail send Successfully"})
        })
        .catch(err => {
          res.status(400).json({
              message: "Error Rendering emailTemplate",
              error: err 
             });
          });
       
        
      
//res.send(req.user.Email)

}