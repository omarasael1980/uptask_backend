import express from  'express';

const router  = express.Router();
import {registrar, 
        autenticar, 
        confirmar, 
        olvidePassword, 
        comprobarToken,
        nuevoPassword, 
        perfil

    } from '../controllers/usuarioController.js'

import checkAuth from '../middleware/checkAuth.js';

router.get('/', (req,res)=>{
    res.send("Desde usuarios")
})
 //Autentificacion, registro y confirmacion de usuarios
router.post('/', registrar) // crea un nuevo usuario
router.post('/login', autenticar) // autenticar usuario
router.get('/confirmar/:token', confirmar)//confirmar token email
router.post('/olvide-password', olvidePassword) //recuperar password
//router.get('/olvide-password/:token', comprobarToken ) //validar token recuperar password
//router.post('/olvide-password/:token', nuevoPassword) //guardar nuevo password
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword) //esta forma sustituye las dos de arriba
//rutas que el usuario necesita estar logeado para tener acceso usar checkAuth 

router.get('/perfil',checkAuth, perfil ) //muestra el perfil del usuario
export default router;  