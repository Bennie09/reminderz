const axios = require("axios");

exports.handler = async (event) => {
  const { email, subject, content } = JSON.parse(event.body);

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "TaskWise", email: process.env.SENDER_EMAIL },
        to: [{ email }],
        subject,
        htmlContent: `<p>${content}</p>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send email" }),
    };
  }
};
