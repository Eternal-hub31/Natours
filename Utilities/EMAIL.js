const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: '587',
        auth: {
          user: 'deximafia278@gmail.com',
          pass: 'WxS2vJps9aPZtqgN',
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: '587',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //send actual email
  async send(template, subject) {
    // render the html pug template
    const html = pug.renderFile(
      `${__dirname}/../Views/emails/${template}.pug`,
      {
        fristName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // create email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {
        wordwrap: 130,
      }),
    };
    //Create a transport and send email
    const SendEmail = await this.newTransport().sendMail(emailOptions);
    console.log(SendEmail);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }
  async sendEmailPassword() {
    await this.send(
      'passwordReset',
      'Your password reset Token valid for only 10 minutes'
    );
  }
};
