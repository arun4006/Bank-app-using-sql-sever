const sgMail = require('@sendgrid/mail')
const sendgridApikey='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'
sgMail.setApiKey(sendgridApikey)

const sendWelcomeMail = (mainOptions)=>{
  sgMail.send(mainOptions)
}

module.exports={
  sendWelcomeMail
}