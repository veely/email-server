require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ses = require('node-ses');
const sesClient = ses.createClient({ key: process.env.SES_KEY, secret: process.env.SES_SECRET });
const Email = require('./class/Email');
const MongoClient = require("mongodb").MongoClient;
const mongodb_uri = "mongodb://localhost:27017";
const path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))

app.post('/send-email', (req, res) => {
  const from = req.body.fromEmail,
  to = req.body.toEmail,
  subject = req.body.subject,
  message = req.body.body;

  function checkBlacklist() {
    return new Promise ((resolve, reject) => {
      MongoClient.connect(mongodb_uri, (err, client) => {
        if (err) {
          console.error(`Failed to connect: ${mongodb_uri}`);
          throw err;
        }
        console.log(`Successfully connected: ${mongodb_uri}`);
        let db = client.db('email');
        db.collection("blacklist").find({ email_address: from }, (err, results) => {
          if (err) throw err;
          results.count().then( result => {
            if (result) {
              reject("Error: Sender email address is blacklisted. The email has been bounced.");
            } else {
              let content = {
                from: from,
                to: to,
                subject: subject,
                message: message
              }
            
              let email = new Email(content);
            
              sesClient.sendEmail(email, (err, data, res) => {
                if (err) {
                  reject(err);
                } else {
                  resolve("Successfully sent email.");
                }
              });
            }
          });
        });
        client.close();
      });
    });
  }

  checkBlacklist().then( result => {
    res.send(result);
  }).catch( err => {
    res.send(err);
  });
});

app.post('/bounced-email', (req, res) => {
  
});

app.listen(PORT, () => {
  console.log(`email-server is listening on port ${PORT}.`);
});