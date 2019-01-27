class Email {
  constructor(content) {
    this.from = content.from;
    this.to = content.to;
    this.subject = content.subject;
    this.message = content.message;
  }
}

module.exports = Email;