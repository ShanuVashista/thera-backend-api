import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text = "", html = "") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_MAIL,
        pass: process.env.ZOHO_PASS,
      },
    });
    // const transporter = nodemailer.createTransport({
    //     service:"hotmail",
    //     auth:{
    //         user: "telemdbackend@outlook.com",
    //         pass: "Developer@123"
    //     }
    // });

    const options = {
      from: process.env.ZOHO_MAIL,
      to: email,
      subject: subject,
      text: text,
      html,
    };

    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
      // console.log("sent" + info.response)
    });

    console.log("Eamil sent Successful");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

export default sendEmail;
