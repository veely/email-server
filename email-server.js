const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');

const aws = require('aws-sdk');
aws.config.loadFromPath('config.json');
aws.config.update({region: 'us-east-1'});
const ses = new aws.SES();

const Email = require('./class/Email');
const send = require('./functions/send.js');
const blacklistEmail = require('./functions/blacklistEmail.js');

const MongoClient = require("mongodb").MongoClient;
const mongodb_uri = "mongodb://localhost:27017";

const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-email', (req, res) => {
  let from = req.body.fromEmail,
  to = req.body.toEmail.split(','),
  subject = req.body.subject,
  body_html = req.body.body_html,
  body_text = "N/A";

  if (req.body.body_text) {
    body_text = req.body.body_text;
  }

  let emailParams = {
    Destination: {
      ToAddresses: to
    }, 
    Message: {
      Body: {
        Html: {
        Charset: "UTF-8", 
        Data: body_html
        }, 
        Text: {
        Charset: "UTF-8", 
        Data: body_text
        }
      }, 
      Subject: {
        Charset: "UTF-8", 
        Data: subject
      }
    },
    Source: from
  };
  
  let email = new Email(emailParams);

  MongoClient.connect(mongodb_uri, (err, client) => {
    if (err) {
      console.error(`Failed to connect: ${mongodb_uri}`);
      throw err;
    }
    console.log(`Successfully connected: ${mongodb_uri}`);
    send(email, client, ses).then( result => {
      client.close();
      res.send(result);
    });
  });
});

app.post('/bounced-email', (req, res) => {
  let email_address = req.body.email_address;
  MongoClient.connect(mongodb_uri, (err, client) => {
    if (err) {
      console.error(`Failed to connect: ${mongodb_uri}`);
      throw err;
    }
    console.log(`Successfully connected: ${mongodb_uri}`);

    blacklistEmail(client, email_address).then( result => {
      client.close();
      res.send(result);
    })
  });
});

app.listen(PORT, () => {
  console.log(`email-server is listening on port ${PORT}.`);
});