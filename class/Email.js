class Email {
  constructor(content) {
    this.Destination = content.Destination;
    this.Message = content.Message;
    this.Source = content.Source;
  }
}

module.exports = Email;