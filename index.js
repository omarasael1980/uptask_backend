import  express from "express"
import conectarDB from "./config/db.js"
import dotenv from 'dotenv'
import cors from 'cors'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'
const app = express()
//habilitar lectura de jhson
app.use(express.json())
//variables de entorno
dotenv.config()
 
//conectar DB
conectarDB()
//implementar cors
const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_URL2]
 
const corsOptions = {
    origin: function(origin,callback) {
        if(whitelist.includes(origin)){
            //puede consultar la api
            callback(null,true)
        }else{
            //impedir request 
            callback(new Error("Error de Cors"))
        }
    }
}
app.use(cors(corsOptions))
// routing
app.use('/api/usuarios',usuarioRoutes )
app.use('/api/proyectos',proyectoRoutes )
app.use('/api/tareas',tareaRoutes )
//asignar variable de puerto produccion | desarollo
const PORT = process.env.PORT || 4000
//se abre servidor en el puerto 4000
const servidor = app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})
//socket io
import {Server} from 'socket.io'
const io = new Server(servidor, 
    {   pingTimeout:60000,
        cors:{
            origin: process.env.FRONTEND_URL,
        },
})
io.on("connection", (socket) => {
        // Registrarse en la sala  al abrir un proyecto
        socket.on("abrir proyecto",(proyecto)=>{
           
            //console.log("Desde Proyecto" ,idProyecto )
            socket.join(proyecto )
           
        })
        socket.on("nueva tarea", (tarea) => {
         
        const proyecto = tarea.proyectoAsociado;
      
         socket.to(proyecto).emit("tarea agregada", tarea);
        });
        socket.on("eliminar tarea", (tarea)=>{
             
            const proyecto = tarea.proyectoAsociado;
            
            socket.to(proyecto).emit("tarea eliminada", tarea)
        })
        socket.on("editar tarea", (tarea) => {
              
              const proyecto = tarea.proyectoAsociado._id;
               
              socket.to(proyecto).emit("tarea actualizada", tarea);
             });

        socket.on("cambiar estado", estado=>{
             
            const proyecto = estado.proyectoAsociado._id;
            
            socket.to(proyecto).emit("estado actualizado", estado)
        })

   
    })

 
    // Definir los eventos de socket io
    // socket.on("abrir proyecto", (proyecto) => {
    //   socket.join(proyecto);
    // });
  
    // socket.on("nueva tarea", (tarea) => {
         
    //   const proyecto = tarea.proyectoAsociado;
      
    //   socket.to(proyecto).emit("tarea agregada", tarea);
    // });
  
    // socket.on("eliminar tarea", (tarea) => {
    //   const proyecto = tarea.proyectoAsociado;
    //   socket.to(proyecto).emit("tarea eliminada", tarea);
    // });
  
    // socket.on("actualizar tarea", (tarea) => {
    //   const proyecto = tarea.proyectoAsociado._id;
    //   socket.to(proyecto).emit("tarea actualizada", tarea);
    // });
  
    // socket.on("cambiar estado", (tarea) => {
    //   const proyecto = tarea.proyectoAsociado._id;
    //   socket.to(proyecto).emit("nuevo estado", tarea);
    // });
 
  