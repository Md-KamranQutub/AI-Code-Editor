import mongoose, { mongo } from "mongoose";

const fileSchema = mongoose.Schema({
    owner:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true
    },

    project:{
        type: mongoose.Schema.ObjectId,
        ref:"Project",
        required: true
    },

    parent:{
        type: mongoose.Schema.ObjectId,
        ref:"File",
        default:null,
    },

    name:{
        type:String,
        required: true,
    },

    type:{
        type:String,
        enum:["file", "folder"],
    },

    ext:{
        type:String,
        default:"",
    },
    
    language:{
        type:String,
        default:"plaintext",
    },

    content:{
        type: String,
        default:"",
    },

    size:{
        type: Number,
        default:0,
    },

    isDeleted:{
        type: Boolean,
        default: false,
    },

})

const File = new mongoose.model("File", fileSchema);

export default File;