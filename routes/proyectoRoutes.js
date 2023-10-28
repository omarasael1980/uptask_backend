import express from 'express';
import {    
    obtenerProyecto, 
    obtenerProyectos, 
    nuevoProyecto, 
    editarProyecto, 
    eliminarProyecto, 
    eliminarColaborador,
    buscarColaborador,
    agregarColaborador
} from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = new express.Router()
router.route('/')
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto)
router.route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)
router.post('/colaboradores',checkAuth, buscarColaborador)
router.post('/colaboradores/:id',checkAuth ,agregarColaborador) 
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);


export default router