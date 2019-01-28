require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');

const aws = require('aws-sdk');
aws.config.loadFromPath('config.json');
aws.config.update({region: 'us-east-1'});
const sesClient = new aws.SES();

const Email = require('./class/Email');
const MongoClient = require("mongodb").MongoClient;
const mongodb_uri = "mongodb://localhost:27017";
const path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))

app.post('/send-email', (req, res) => {
  const from = req.body.fromEmail,
  to = req.body.toEmail.split(','),
  subject = req.body.subject,
  body_html = req.body.body_html,
  body_text = "N/A";

  if (req.body.body_text) {
    body_text = req.body.body_text;
  }

  MongoClient.connect(mongodb_uri, (err, client) => {
    if (err) {
      console.error(`Failed to connect: ${mongodb_uri}`);
      throw err;
    }
    console.log(`Successfully connected: ${mongodb_uri}`);
    checkBlacklist(from, client).then( result => {
      console.log(result);
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
      send(emailParams).then( result => {
        console.log("DSADSADSADSADSA");
        client.close();
        res.send(result);
      }).catch( err => {
        client.close();
        res.send(err);
      });
    }).catch( err => {
      let response = JSON.stringify({ status: "Failed", message: err });
      client.close();
      res.send(response);
    });
  });
});

app.post('/bounced-email', (req, res) => {
  let email_address = req.body.email_address;
  MongoClient.connect(mongodb_uri, (err, client) => {
    function blacklistEmail() {
      return new Promise( (resolve, reject) => {
        if (err) {
          console.error(`Failed to connect: ${mongodb_uri}`);
          throw err;
        }
        console.log(`Successfully connected: ${mongodb_uri}`);
        let db = client.db('email');
        db.collection("blacklist").insert({ email_address: email_address }).then( result => {
          resolve("Added the email address to the blacklist. Future emails being sent from this address will be bounced.");
        });
      });
    }

    blacklistEmail().then( result => {
      let response = JSON.stringify({ status: "OK", message: result });
      client.close();
      res.send(response);
    }).catch( err => {
      let response = JSON.stringify({ status: "Failed", message: err });
      client.close();
      res.send(response);
    });
  });
});

app.listen(PORT, () => {
  console.log(`email-server is listening on port ${PORT}.`);
});

async function send() {
  let db = client.db('email');
  db.collection("blacklist").find({ email_address: from }, (err, results) => {
    if (err) {
      throw err;
    }
    let promise = new Promise( (resolve, reject) => {
      results.count().then( result => {
        if (result) {
          reject("Error: Sender email address is blacklisted. The email has been bounced.");
        } else {
          resolve(true);
        }
      });
    });
    let goodEmailAddress = await promise;
    if (goodEmailAddress) {
      let email = new Email(emailParams);
      let promise = new Promise( (resolve, reject) => {
        sesClient.sendEmail(email, (err, data) => {
          if (err) {
            console.log("Failed to sent email.")
            reject(JSON.stringify({ status: "Failed", message: err }));
          } else {
            console.log("Successfully sent email.");
            resolve("asdf");
          }
        });
      });
    }
  });

  function send(emailParams) {
    return new Promise( (resolve, reject) => {
      
    });
  }

}