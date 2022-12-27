const mongoose=require('mongoose')
const shortId=require('shortid')

const shortUrlSchema=new mongoose.Schema({
    email:{
      type:String,
      required: true
    },
    name: {
        type: String,
        required: false,
      },
    full: {
        type: String,
        required: true
    },
    short:{
        type: String,
        required: true,
        default: shortId.generate
    },
    clicks:{
        type: Number,
        required: true,
        default: 0
    },
      createdDate: {
        type: Date,
        required: true,
        default: Date.now()
      },
      expireTime:{
        type: Date,
        required: true,
        default: Date.now()
      }
})

module.exports=mongoose.model('ShortUrl', shortUrlSchema)