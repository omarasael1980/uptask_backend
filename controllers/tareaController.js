import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

 
 
const agregarTarea = async (req, res) => {
   const body = req.body
   delete body.id

    const { proyectoAsociado } = body;
   
   
    const existeProyecto = await Proyecto.findById(proyectoAsociado);
    
    if (!existeProyecto) {
      const error = new Error("El Proyecto no existe");
      return res.status(404).json({ msg: error.message });
    }
 
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos para añadir tareas");
      return res.status(403).json({ msg: error.message });
    }
   
    try {
    
      
      const tareaAlmacenada = await Tarea.create(body);
      
      // Almacenar el ID en el proyecto
      existeProyecto.tareas.push(tareaAlmacenada._id);
      await existeProyecto.save();
      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error); 
       // Si el error es de validación de Mongoose, puedes acceder a los detalles
  if (error.name === 'ValidationError') {
    console.log('Errores de validación:', error.errors);
  }
    }
    
  
} 
const obtenerTarea = async (req, res) => {
   const {id} = req.params
   const tarea = await Tarea.findById(id).populate("proyectoAsociado")
   if(!tarea){
    const error = new Error("La tarea no existe ")
    return res.status(403).json({msg: error.message})
   }
   if(tarea.proyectoAsociado.creador.toString() != req.usuario.id.toString()) {
    const error = new Error("No es válida esta acción ")
    return res.status(404).json({msg: error.message})
   }
  
   res.json(tarea)
}
const actualizarTarea = async (req, res) => {
    const {id} = req.params
   const tarea = await Tarea.findById(id).populate("proyectoAsociado")
   if(!tarea){
    const error = new Error("La tarea no existe ")
    return res.status(403).json({msg: error.message})
   }
   if(tarea.proyectoAsociado.creador.toString() != req.usuario.id.toString()) {
    const error = new Error("No es válida esta acción ")
    return res.status(404).json({msg: error.message})
   }
   tarea.nombre = req.body.nombre || tarea.nombre
   tarea.descripcion = req.body.descripcion || tarea.descripcion
   tarea.prioridad = req.body.prioridad || tarea.prioridad
   tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega
  try {
    
    const tareaActualizada = await tarea.save()
    res.json(tareaActualizada)
  } catch (error) {
    console.log(error)
  }

  
}
const eliminarTarea = async (req, res) => {
    const {id} = req.params
   const tarea = await Tarea.findById(id).populate("proyectoAsociado")
   if(!tarea){
    const error = new Error("La tarea no existe ")
    return res.status(403).json({msg: error.message})
   }
   if(tarea.proyectoAsociado.creador.toString() != req.usuario.id.toString()) {
    const error = new Error("No es válida esta acción ")
    return res.status(404).json({msg: error.message})
   }
   
  try {
     
    const proyecto = await Proyecto.findById(tarea.proyectoAsociado._id.toString())
   
    proyecto.tareas.pull(tarea._id)
    await Promise.allSettled([  await tarea.deleteOne(), await proyecto.save()])
    res.json({msg: 'La tarea se ha eliminado correctamente'})
  } catch (error) { 
    console.log(error) 
  }


}
const cambiarEstadoTarea = async (req, res) => { 

  const {id}= req.params
  //se busca la tarea por id
  const tarea = await Tarea.findById(id).populate("proyectoAsociado")
  //se verifica que exista la tarea
   if(!tarea){
    const error = new Error("La tarea no existe ")
    return res.status(403).json({msg: error.message})
   }
  
   //verificar que el usuario es creador o colaborador
   if(tarea.proyectoAsociado.creador.toString() !== req.usuario._id.toString() &&
   !tarea.proyectoAsociado.colaboradores.some(colaborador=> colaborador._id.toString() === req.usuario._id.toString())) {
    const error = new Error("No es válida esta acción ")
    return res.status(404).json({msg: error.message})
   }
   tarea.estado = !tarea.estado
   //registrar el usuario que completo la tarea
   tarea.completado = req.usuario._id
   await tarea.save()
  const tareaAlmacenada  = await Tarea.findById(id).populate("proyectoAsociado").populate('completado')
   res.json(tareaAlmacenada)

   
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstadoTarea 
}  