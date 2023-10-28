import nodemailer from 'nodemailer';

export  const emailRegistro = async (datos)=>{
    const {email, nombre, token} =datos
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:  process.env.EMAIL_PORT,
        auth: {
          user:  process.env.EMAIL_USER,
          pass:  process.env.EMAIL_PASS
        }
      });
      //informacion del email

      const info =  await   transport.sendMail({
            from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
            to: email,
            subject : 'Uptask - Comprueba tu cuenta',
            text: 'Comprueba tu cuenta',
            html: `<p>Hola: ${nombre}, \n Comprueba tu cuenta en Uptask</p>
            <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
            <p>Si tu no creaste está cuenta ignora este mensaje</p>`,

      })
}

export  const emailOlvidePassword = async (datos)=>{
    const {email, nombre, token} =datos
    
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:  process.env.EMAIL_PORT,
        auth: {
          user:  process.env.EMAIL_USER,
          pass:  process.env.EMAIL_PASS
        }
      });
      //informacion del email

      const info =  await   transport.sendMail({
            from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
            to: email,
            subject : 'Uptask - Reestablece tu password',
            text: 'Reestablece tu password',
            html: `<p>Hola: ${nombre}, \n Has solicitado reestablecer tu password</p>
            <p>Da clic en el siguiente enlace para escribir tu nuevo password:</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
            <p>Si tu no solicitaste cambio de password,  ignora este mensaje</p>`,

      })
}