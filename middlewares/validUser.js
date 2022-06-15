const sql = require('mssql');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config=require('../dbconfig')


const findByCredentials = async (password, records) => {
  try {
    const isMatch = await bcrypt.compare(password, records[0].Password);
    console.log("isMatch", isMatch)
    return isMatch;
  }
  catch (err) {
    console.log(err)
  }
}

const generateAuthToken = async  (user)=> {
  //console.log("user",user[0].Name);
 
   const token = jwt.sign({ Id:user[0].Id,Name:user[0].Name }, 'mithran123')
   console.log(token)

   new sql.Request().query(`update Persons set Tokens='${token}' where Email='${user[0].Email}' `, (err, result) => {
    // ... error checks
    if (err) return res.send(err)
    return result.recordset;

  })

  return token
}
const auth = async (req, res, next) => {
  try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, 'mithran123')
       //console.log(decoded);
       await sql.connect(config);
       const users = await new sql.Request().query(`select * from Persons where Id='${decoded.Id}' AND Tokens='${token}' `) 
     
     // console.log(users.recordset);
      if (!users.recordset) {
          throw new Error("wrong tokens")
      }

       req.user = users.recordset[0]
       req.token = token
     // console.log(token)
      next()
  } catch (e) {
      res.status(401).send({ error: 'Please authenticate. or login ' })
  }
}

module.exports = { findByCredentials,generateAuthToken,auth }