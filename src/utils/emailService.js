const nodemailer = require('nodemailer');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'ADASO - Şifre Sıfırlama',
    html: `
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
      <a href="${resetUrl}">Şifremi Sıfırla</a>
      <p>Bu link 1 saat geçerlidir.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };