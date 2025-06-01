import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { email, name } = JSON.parse(event.body);

    const apiKey = process.env.BREVO_API_KEY; // Set your Brevo API key in Netlify env vars

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        templateId: 2, // Your template ID here
        to: [{ email }],
        params: {
          USERNAME: name, // Replace with your template placeholders keys
        },
        // Optionally set sender if your template allows override
        // sender: { email: "your-email@example.com", name: "TaskWise Team" },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Brevo API error:", errorData);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to send email" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Welcome email sent!" }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
