const nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');
const dotenv = require('dotenv');
dotenv.config();


//  send mail to single user //
const sendSendgridMail = async (data) => {
    console.log("inside function")
    var options = {
        auth: {
            api_key:  process.env.SENDGRID_API_KEY
        }
    }
    var mailer = nodemailer.createTransport(sgTransport(options));

    var message = {
        to: [...data.recipient_email],
        cc: ['kenanco.2022@gmail.com'],
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: data.subject,
        text: data.text,
        html: data.text
    };

    if (data.cc) {
        message.cc = [...data.cc]
    }

    if (data.attachments) {
        message.attachments = data.attachments
        //  [
        //     {
        //         filename: 'test.txt',
        //         path: __dirname + '/test.txt'
        //     }
        // ]
    }

    const mailRes = await mailer.sendMail(message);
    console.log("mailRes", mailRes);
    return mailRes;
}


//  Send email using smtp  //
const sendSMTPEmail = async (data) => {
    return new Promise(function (resolve, reject) {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_SETTING_HOST,
            port: process.env.SMTP_SETTING_PORT,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: process.env.SMTP_SETTING_USERNAME,
                pass: process.env.SMTP_SETTING_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
        });

        const mailData = {
            from: {
                name: process.env.SMTP_SETTING_SENDER_NAME,
                address: process.env.SMTP_SETTING_SENDER,
            },
            to: data.recipient_email,
            subject: data.subject,
            html: data.text,
        };
        if (data.attachments) {
            mailData.attachments = data.attachments;
        }
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(info);
            }
        });
    });
};

module.exports = { 
    sendSendgridMail,
    sendSMTPEmail,
}