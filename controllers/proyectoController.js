import Proyecto from '../models/Proyecto.js'
import Usuario from '../models/Usuarios.js'

const obtenerProyectos =async (req, res)=>{
  
//si lo dejo hasta .find traera todos se le pone .where.equals para filtrar
//con $or me permite traer los proyectos que sean colaborador O creador
    const proyectos  = await Proyecto.find({
      '$or':[
      {colaboradores:{$in:req.usuario}},
      {creador:{$in: req.usuario}},
    ],

    })
   
    .select('-tareas')
    res.json(proyectos)
   

}
const nuevoProyecto =async (req, res)=>{
 const proyecto = new Proyecto(req.body)
 proyecto.creador = req.usuario._id
 try {
    const proyectoAlmacenado = await proyecto.save()

    
    res.json(proyectoAlmacenado)
    
 } catch (error) {
    console.log(error)
 }

}
const obtenerProyecto = async (req, res) => {
  
    const { id } = req.params;
  
    try {
      const proyecto = await Proyecto.findById(id.trim())

      // para hacer pupulate a tareas  .populate('tareas')
      // para hacer pupulate a un populate 
      .populate({
        path: 'tareas',
         populate: {path: 'completado', select: 'nombre'}
        })
      .populate('colaboradores',"nombre email ")
      
      // Si no se encuentra el proyecto
      if (!proyecto) {
        return res.status(404).json({ msg: 'Proyecto no encontrado' });
      }
  
      // Verificar si el que quiere ver el proyecto tiene los permisos porque es creador 
      //o de colaborador
      if (proyecto.creador.toString() !== req.usuario.id.toString() &&
       !proyecto.colaboradores.some(colaborador=> colaborador.id.toString() === req.usuario._id.toString())) {

      
        return res.status(401).json({ msg: "Acción no válida" });
      }
       
        
        res.json(proyecto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error interno del servidor, posiblemente NO EXISTE | ver controlador de proyecto' });
    }
  };
   
const editarProyecto =async (req, res)=>{
    const { id } = req.params;
  
    try {
      const proyecto = await Proyecto.findById(id.trim());
  
      // Si no se encuentra el proyecto
      if (!proyecto) {
        return res.status(404).json({ msg: 'Proyecto no encontrado' });
      }
  
      // Verificar si el que quiere ver el proyecto tiene los permisos porque es creador
      if (proyecto.creador.toString() !== req.usuario.id.toString()) {
        return res.status(401).json({ msg: 'Acción no válida' });
      }
      proyecto.nombre = req.body.nombre || proyecto.nombre 
      proyecto.descripcion = req.body.descripcion || proyecto.descripcion 
      proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega 
      proyecto.cliente = req.body.cliente || proyecto.cliente 
     try {
        const proyectoAlmacenado1 = await proyecto.save() 
        res.json(proyectoAlmacenado1)
    } catch (error) {
        console.error(error)
     }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error interno del servidor, posiblemente NO EXISTE' });
    }
 
}
const eliminarProyecto =async (req, res)=>{
    const { id } = req.params;
  
    try {
      const proyecto = await Proyecto.findById(id.trim());
  
      // Si no se encuentra el proyecto
      if (!proyecto) {
        return res.status(404).json({ msg: 'Proyecto no encontrado' });
      }
  
      // Verificar si el que quiere ver el proyecto tiene los permisos porque es creador
      if (proyecto.creador.toString() !== req.usuario.id.toString()) {
        return res.status(401).json({ msg: 'Acción no válida' });
      }
      //eliminar el proyecto
      try {
        await proyecto.deleteOne()
        res.json({msg: 'Proyecto eliminado'})
        
      } catch (error) {
        console.log(error);
      }
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error interno del servidor, posiblemente NO EXISTE' });
    }
}
const buscarColaborador =async (req, res)=>{
   const {email} = req.body
   const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')
   
//si no hay usuario registrado
   if(!usuario){
    
    const error = new Error("Usuario no encontrado")
  
    return res.status(404).json({msg:error.message})
   }
//si se encuentra el usuario
res.json(usuario)

}
const agregarColaborador =async (req, res)=>{

 const proyecto  = await Proyecto.findById(req.params.id)
 //si no se encuentra
 if(!proyecto){
  const error = new Error("Proyecto No Encontrado")
  return res.status(404).json({msg:error.message})
 }
 //verificar que solo el creador puede agregar colaboradores
 if (proyecto.creador.toString() !== req.usuario._id.toString()) {
  const error = new Error("Acción no válida");
  return res.status(404).json({ msg: error.message });
}

const { email } = req.body;
const usuario = await Usuario.findOne({ email }).select(
  "-confirmado -createdAt -password -token -updatedAt -__v "
);

if (!usuario) {
  const error = new Error("Usuario no encontrado");
  return res.status(404).json({ msg: error.message });
}

// El admin no puede ser colaborador
if (proyecto.creador.toString() === usuario._id.toString()) {
  const error = new Error("El Creador del Proyecto no puede ser colaborador");
  return res.status(404).json({ msg: error.message });
}
//revisar que no este agregado el colaborador
if(proyecto.colaboradores.includes(usuario._id)){
  const error = new Error("El Usuario ya pertenece al Proyecto");
  return res.status(404).json({ msg: error.message });
}
//Si todo esta bien se puede agregar
proyecto.colaboradores.push(usuario._id)
await proyecto.save()
res.json({msg:'Colaborador Agregado Correctamente'})
}

const eliminarColaborador =async (req, res)=>{
  const proyecto  = await Proyecto.findById(req.params.id)
  //si no se encuentra
  if(!proyecto){
   const error = new Error("Proyecto No Encontrado")
   return res.status(404).json({msg:error.message})
  }
  //verificar que solo el creador puede agregar colaboradores
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
   const error = new Error("Acción no válida");
   return res.status(404).json({ msg: error.message });
 }
 //Si todo esta bien se puede eliminar colaborador
proyecto.colaboradores.pull(req.body.id)
await proyecto.save()
res.json({msg:'Colaborador Eliminado Correctamente'})

}
 

export {
    obtenerProyecto, 
    obtenerProyectos, 
    nuevoProyecto, 
    editarProyecto, 
    eliminarProyecto, 
    eliminarColaborador,
    agregarColaborador,
    buscarColaborador
}