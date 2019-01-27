require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Email = require('./class/Email');

app.use(bodyParser.urlencoded({extended: true}));
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')))

app.post('/send-email', (req, res) => {
  let transporter = nodemailer.createTransport({
    service: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let from = req.body.fromEmail,
  to = req.body.toEmail,
  subject = req.body.subject,
  text = req.body.body;

  let content = {
    from: from,
    to: to,
    subject: subject,
    text: text
  }

  transporter.sendMail(content, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  let email = new Email(content);
  res.end();
});

app.listen(PORT, () => {
  console.log(`email-server is listening on port ${PORT}.`);
});