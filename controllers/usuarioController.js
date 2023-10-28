import Usuario from '../models/Usuarios.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/email.js'

const registrar = async (req,res)=>{
    //evitar registros duplicados
    const{email} = req.body
    const existeUsuario = await Usuario.findOne({email: email})
   if(existeUsuario){
    const error = new Error("El usuario ya existe");
    return res.status(400).json({msg: error.message})
   }
    try { 
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        const usuarioAlmacenado = await usuario.save()
            //enviar email de confirmacion
          emailRegistro({ 
            email: usuarioAlmacenado.email,  
            nombre: usuarioAlmacenado.nombre,
            token: usuarioAlmacenado.token
        })
        res.json({msg: "Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta"})
         

    } catch (error) {
        console.log(error.message)
    }
    
} 
const autenticar = async (req, res) =>{
    const {email, password} = req.body
    
  
    // verificar que usuario existe
    const usuario = await Usuario.findOne({email})
    
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg:error.message})
    }

    // verificar que este confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({msg:error.message})
    }
    // verificar el pass
    if(await usuario.comprobarPassword(password)){
        
        res.json({
            _id:usuario.id,
            nombre:usuario.nombre, 
            email:usuario.email,
            token: generarJWT(usuario._id),
            
        })
    }else{
        const error = new Error('Opps! password incorrecto')
        return res.status(403).json({msg:error.message})
    }
}

//esta funcion es para confirmar el token del usuario

const confirmar = async (req, res)=>{
         const {token}  = req.params
         const usuarioConfirmar =await Usuario.findOne({token})
         if(!usuarioConfirmar){
            const error = new Error('Opps! Token  invalido!')
            return res.status(403).json({msg:error.message})
         }
        try {
            //confirmar verdadero
            usuarioConfirmar.confirmado= true
           
            // eliminar token
            usuarioConfirmar.token =''
            // guardar base de datos
            await usuarioConfirmar.save()
        
            // confirmar  exito
            res.json(
                {msg: 'Usuario Confirmado Correctamente'})

            
        } catch (error) {
            console.log(error.message)
            
        }
}
const olvidePassword = async (req, res)=>{
    //en el front hay input que solicita el email
    const {email} = req.body
    //verificar si el usuario existe
    // verificar que usuario existe
    const usuario = await Usuario.findOne({email})
    
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg:error.message})
    }
    //
    try {
        usuario.token = generarId()
        await usuario.save()
        //enviar email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        
        res.json({msg: 'Hemos enviado un correo con las instrucciones para que cambies tu password'})
        
    } catch (error) {
        console.log(error.message)
    }
     
}
//validar token para recuperar password
const comprobarToken= async (req, res) => {
    const {token } = req.params
  
   const tokenValido = await Usuario.findOne({token})
     
    if(tokenValido){
        res.json({msg:'Token valido'})
    }else{
        const error = new Error('El token no es válido')
        return res.status(404).json({msg:error.message})
    }
}

const nuevoPassword = async (req, res) => {
    const {token } = req.params
    const {password} = req.body
    const usuario = await Usuario.findOne({token})
     
    if(usuario){
       
       try {
         //guardar nuevo password
       usuario.password = password
       //limpiar token
       usuario.token =''
         //guardar db
       await usuario.save()
       //regresar mensaje de exito
       res.json({msg: 'Contraseña modificada correctamente'})
       } catch (error) {
        console.log(error.message)
       }  
      
    }else{
        const error = new Error('El token no es válido')
        return res.status(404).json({msg:error.message})
    }
}

const perfil =(req, res) => {
    const {usuario} = req
    res.json({usuario})
}
export {
    registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil
}