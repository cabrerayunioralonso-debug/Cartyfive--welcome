require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

function generateWelcomeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }

    const welcomeCode = generateWelcomeCode();

    const { data, error } = await resend.emails.send({
      from: 'CartyFive <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a CartyFive! Tu código de bienvenida',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>¡Hola${name ? ` ${name}` : ''}!</h2>
          <p>Gracias por unirte a <strong>CartyFive</strong>.</p>
          <p>Tu código de bienvenida es:</p>
          <div style="background-color: #f0f0f0; padding: 18px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 3px; margin: 25px 0; border-radius: 8px;">
            ${welcomeCode}
          </div>
          <p>Guárdalo bien. Lo necesitarás dentro de la plataforma.</p>
          <br>
          <p>¡Bienvenido a bordo!</p>
          <p><strong>El equipo de CartyFive</strong></p>
        </div>
      `
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudo enviar el correo' });
    }

    res.status(200).json({
      success: true,
      message: 'Correo de bienvenida enviado correctamente',
      code: welcomeCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de bienvenida CartyFive funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor CartyFive corriendo en el puerto ${PORT}`);
});
