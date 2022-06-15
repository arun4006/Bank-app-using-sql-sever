const  config = {
    user:  'mith', // sql user
    password:  '1234', //sql user password
    server:  'localhost', // if it does not work try- localhost
    database:  'bankapp_sql',
    options: {
        trustServerCertificate: true
      },
    port:  1433
  }
  
  module.exports = config;