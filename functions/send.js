async function send(email, client, ses) {
  let result;
  let db = client.db('email');
  let promise = new Promise( resolve => {
    db.collection("blacklist").find({ email_address: email.Source }, (err, results) => {
      if (err) {
        throw err;
      }
      results.count().then( result => {
        if (result) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  });
  let goodEmailAddress = await promise;
  if (goodEmailAddress) {
    let promise = new Promise( resolve => {
      ses.sendEmail(email, (err, data) => {
        if (err) {
          console.log("Failed to send email.")
          resolve(JSON.stringify({ status: "Failed", message: err }));
        } else {
          console.log("Successfully sent email.");
          resolve(JSON.stringify({ status: "OK", message: data }));
        }
      });
    });
    result = await promise;
  } else {
    console.log("Failed to send email.")
    result = JSON.stringify({ status: "Failed", message: "The sender's email address is blacklisted. Email has been bounced." });
  }
  return Promise.resolve(result);
}

module.exports = send;