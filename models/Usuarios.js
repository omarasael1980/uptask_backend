import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    }, 
    password:{
        type: String,
        required: true, 
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true, 
        unique: true,
    },
    token:{
        type: String,
    },
    confirmado:{
        type: Boolean,
        default: false,
    }
},
{
    timestamps: true,
});

// Hashear password antes de guardar
usuarioSchema.pre('save', async function(next){
    // Solo hasheamos el password si ha sido modificado
    if(!this.isModified('password')){
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});

//comprobar password
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
