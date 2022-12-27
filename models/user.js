const mongoose=require('mongoose')

const userSchema= new mongoose.Schema({
    userName:{
        type:String,
        required:true
      },
      email:{
        type: String,
        required:true
      },
      password:{
        type:String,
        required: true
      },
      admin:{
        type:Boolean,
        required: true
      },
      linksCreated:{
        type:Number,
        required:true,
        default:0
      }
})

module.exports=mongoose.model('Users', userSchema)