const { google } = require("googleapis");
const nodemailer = require("nodemailer");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

exports.sendMail = async (data) => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken: accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });
  if (data.to !== process.env.EMAIL) {
    transporter.sendMail(
      {
        ...data,
        from: process.env.EMAIL,
      },
      (err, log) => {
        if (err) {
          console.log("Error while sending mail");
          console.log(err);
        } else {
          console.log(success, log);
        }
      }
    );
  }
};
