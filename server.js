const https = require('https');
const path = require('path');
const fs = require('fs');


/* eslint-disable no-console */
const mongoose = require('mongoose');
// eslint-disable-next-line import/newline-after-import
const dotenv = require('dotenv');
dotenv.config();


process.on('uncaughtException', err => {
  console.log(err.name, err.message,err);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);

});


const User = require('./models/user_model');
const app = require('./app');
//const { path } = require('./app');


//connect to mongo db
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD);
mongoose.connect(DB,
{useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(()=>{
    console.log("DB connected")
});

app.listen(process.env.PORT || 3000);
const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname,'cert','key.pem')),
  cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
},app);
sslServer.listen(3443,()=> console.log('Secure server on port 3443'));
process.on('unhandledRejection', err => {
    console.log(err.name, err.message,err);
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    process.exit(1);
  });
