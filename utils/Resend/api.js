const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (userEmail, missionName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Intruder Detected Notification</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            h1 {
                color: #333333;
            }

            p {
                color: #555555;
            }

            .alert {
                background-color: #ffcccc;
                padding: 10px;
                margin-top: 20px;
                border-radius: 4px;
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                color: #777777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Intruder Detected during Inspection for ${missionName}</h1>
            <p>Dear User,</p>
            
            <div class="alert">
                <p><strong>Alert:</strong> An intruder has been detected during the inspection process.</p>
                <p>Please take appropriate actions to address the security issue.</p>
            </div>

            <p>Thank you for your prompt attention to this matter.</p>

            <div class="footer">
                <p>This is an automated notification. Do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: "Lukas <lukas@flaplabs.tech>",
    to: [userEmail],
    subject: `Intruder Detected during Inspection for ${missionName}`,
    html: htmlContent,
  });

  if (error) {
    return console.error({ error });
  }
};

module.exports = {
  sendEmail,
};
