function blacklistEmail(client, email_address) {
  return new Promise( resolve => {
    let db = client.db('email');
    db.collection("blacklist").insertOne({ email_address: email_address }).then( result => {
      resolve({ status: "OK", message: "Added the email address to the blacklist. Future emails being sent from this address will be bounced." });
    }).catch( err => {
      resolve({ status: "Failed", message: "Email address was not added to the blacklist." });
    });
  });
}

module.exports = blacklistEmail;