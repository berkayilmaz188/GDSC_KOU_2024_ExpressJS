const nodemailer = require('nodemailer');
require('dotenv').config();

const sendActivationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Kullandığınız e-posta servis sağlayıcısına göre değiştirin
    auth: {
      user: process.env.EMAIL_ADDRESS, // .env dosyasından e-posta adresinizi girin
      pass: process.env.EMAIL_PASSWORD, // .env dosyasından e-posta şifrenizi girin
    },
  });

  const activationUrl = `http://87.248.157.166:3000/api/v1/auth/activate/${token}`; // Frontend aktivasyon URL'nizi ve endpoint'inizi buraya girin

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, // Gönderici adresi
    to: email, // Alıcı adresi
    subject: 'Hesap Aktivasyon Linki',
    html: `<h4>Hesabınızı Aktive Etmek İçin Aşağıdaki Linke Tıklayın</h4>
           <a href="${activationUrl}">${activationUrl}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Şifre Sıfırlama İsteği',
      html: `<p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p><a href="${resetUrl}">${resetUrl}</a>`
    };
  
    await transporter.sendMail(mailOptions);
  };

module.exports = { 
    sendActivationEmail,
    sendPasswordResetEmail
};
