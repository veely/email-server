require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ses = require('node-ses');
const client = ses.createClient({ key: process.env.SES_KEY, secret: process.env.SES_SECRET });
const Email = require('./class/Email');

app.use(bodyParser.urlencoded({extended: true}));
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')))

app.post('/send-email', (req, res) => {
  let from = req.body.fromEmail,
  to = req.body.toEmail,
  subject = req.body.subject,
  message = req.body.body;

  let content = {
    from: from,
    to: to,
    subject: subject,
    message: message
  }

  let email = new Email(content);

  client.sendEmail(email, function(err, data, res) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully sent email.");
    }
  });

  res.end();
});

app.listen(PORT, () => {
  console.log(`email-server is listening on port ${PORT}.`);
});