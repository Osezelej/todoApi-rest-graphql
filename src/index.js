import express from "express";
import mongoose from "mongoose";
import { createHandler } from 'graphql-http/lib/use/express';
import User from "./schema/user.js";
import { v4 as uuid } from "uuid";
import Todo from "./schema/content.js";
import * as bcrypt from 'bcrypt';
import cors from 'cors'
import gqlSchema from "./graphql/schema.js";

const app =  express();
mongoose.connect("your database url")
app.all('/graphql', createHandler({
    schema:gqlSchema
}))

app.use(cors())
app.use(express.json())

app.post('/createTodo/:user', async(req, res)=>{
    const todoData = {
        todoid:uuid(),
        userid:req.body.userid,
        title: req.body.title,
        content:req.body.content
    }
    const validuser = await User.findOne({
        userid:todoData.userid
    }).exec()
    if(validuser){
        let todo = new Todo({
            todoid:uuid(),
            userid:todoData.userid,
            title:todoData.title,
            content: todoData.content
           })
           await todo.save();
           res.send({200:'successfull'})
    }else{
        res.send('unauthorised')
    }
  
})

app.patch('/editTodo/:user', async(req, res)=>{
    let todoData = {
        userid: req.body.userid,
        todoid:req.body.todoid,
        content:req.body.content,
        title:req.body.title
    }
    const validuser = await User.findOne({userid:todoData.userid}).exec();
    if (validuser){
        if (todoData.content.length > 0){
          await Todo.updateOne({todoid:todoData.todoid}, {content:todoData.content}) .exec() 
        }
        if (todoData.title.length > 0){
            await Todo.updateOne({todoid:todoData.todoid}, {title:todoData.title}).exec()
        }
        res.send('successful') 

    }else{
        res.send('unauthorized') 
    }
})

app.get('/getSingle', async(req, res)=>{
    let {todoid} = req.query
    let todo = await Todo.findOne({todoid}).exec()
    if(todo){
        res.send(todo) 

    }else {
        res.send({data:'empty'}) 
    }


})

app.get('/getAll', async(req, res)=>{
    let {userid} = req.query;
    let validuser = await User.findOne({userid}).exec();
    if(validuser){
        res.send(await Todo.find({userid}).exec()) 
    }
})

app.delete('/deletetodo', async(req, res)=>{
    let {todoid, userid} = req.query;
    let validuser = await User.findOne({userid}).exec();
    if(validuser){
        await Todo.deleteOne({todoid, userid}).exec();
        res.send('successful')
    }else{
        res.status(401).send('unauthourized')
    }
})
app.post('/login', async(req, res)=>{
    let {username, password} = req.body;
    let validuser = await User.findOne({username}).exec();
    let valid;
    if(validuser){
        valid = await  bcrypt.compare(password, validuser.password)
    }else{
        res.send('user does not exist')
    }
    if(valid){
        res.send(username)
    }
})

app.post('/registerUser', async (req, res)=>{
    let userdata = {
        id:uuid(),
        username:req.body.username,
        password: await bcrypt.hash(req.body.password, 10)
    }
    let validuser = await User.findOne({username:userdata.username}).exec()
    console.log(validuser)
    if(validuser){
        res.status(401).send('error')
    }else{
        let newUser = new User({
            userid:userdata.id,
            username:userdata.username,
            password:userdata.password
        })

        await newUser.save()
        let {password, ...result}  = userdata
        res.send(result)
    }
})

app.listen(4000, (err)=>{
    if(err){
        console.log(err)
    }else{
        console.log('server started successfully')
    }
})