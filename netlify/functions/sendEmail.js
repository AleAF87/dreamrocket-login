const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "Nome Aqui", email: "dreamrocketrp@gmail.com" }, 
        to: [{ email, name }],
        subject,
        htmlContent: `
          <h3>Olá, ${name}!</h3>
          <p>Obrigado por entrar em contato. Aqui está sua mensagem:</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p></p>
          <p>${message}</p>
          <hr>
          <p><i>Não responda este e-mail, pois foi enviado automaticamente.</i></p>
        `
      })
    });

    const data = await res.json();

    if (res.ok) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
    } else {
      return { statusCode: res.status, body: JSON.stringify({ error: data.message }) };
    }

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
