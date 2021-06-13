const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'josepezdj13@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. I hope that you write to tell us how you get along with the app.`
    })
};
const sendByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'josepezdj13@gmail.com',
        subject: 'Unhappy to let you go!',
        text: `Bye, ${name}. I hope that you return soon!`
    })
};


module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}