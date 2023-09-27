import mongoose from "mongoose";

const {Schema, model} = mongoose

const TodoSchema  = new Schema({
    todoid:String,
    userid:String,
    title:String,
    content:String
})

const Todo = model('Todo', TodoSchema)

export default Todo