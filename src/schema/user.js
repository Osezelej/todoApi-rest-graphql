import mongoose from "mongoose";
const {Schema, model} = mongoose;
const userSchema = new Schema({
    userid: String,
    username:String,
    password:String

})

const User = model('todoUser', userSchema)

export default User