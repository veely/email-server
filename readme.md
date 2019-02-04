# Email Server

A simple email server that uses AWS SES and MongoDB.

## Usage

1. Clone this repository.
2. Install dependencies using `npm install` command.
3. Create a MongoDB database named 'email'. Within this database, create a collection named 'blacklist'.
4. Create a file named `config.json` in the root directory. Enter your AWS access key ID and secret access key in JSON format.
5. Start the server by using `npm start` command.

## Dependencies

- AWS-SDK
- Body Parser
- Express
- MongoDB

## Author

Vincent Ly