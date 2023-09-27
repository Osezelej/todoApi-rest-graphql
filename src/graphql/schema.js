import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import Todo from "../schema/content.js";
import { v4 as uuid } from "uuid";

const todoinputType = new GraphQLInputObjectType({
    name:'todoinput',
    fields:{
        userid:{type:GraphQLString},
        title:{type:GraphQLString},
        content:{type:GraphQLString}
    }
})

const todoType = new GraphQLObjectType({
    name:'todoType',
    fields:{
        todoid:{type:GraphQLString},
        userid:{type:GraphQLString},
        title:{type:GraphQLString},
        content:{type:GraphQLString}
    }
})
const rootQuery = new GraphQLObjectType({
        name:'rootQuery',
        fields:{
            getOneTodo:{
                type:todoType,
                args:{
                    userid:{type: new GraphQLNonNull(GraphQLString) },
                    todoid:{type: new GraphQLNonNull(GraphQLString) },
                },
                async resolve(parent,args){
                    return await Todo.findOne({userid:args.userid, todoid:args.todoid}).exec();
                }
            },

            getAllTodo:{
                
                type: new GraphQLList(todoType),
                args:{
                    userid:{type:GraphQLString,}
                },
                async resolve(parent, args){
                    return await Todo.find({userid:args.userid})
                }
            }
        }
})

const rootmutations = new GraphQLObjectType({
    name:'RootMutations',
    fields:{
        createTodo:{
            type:todoType,
            args:{
                todoinput:{type:new GraphQLNonNull(todoinputType) }
            },
            async resolve(parent, args){
                // create the uuid inside here before return
                console.log(args)
                let tododata = {
                    userid:args.todoinput.userid,
                    todoid:uuid(),
                    title:args.todoinput.title,
                    content: args.todoinput.content
                }
                let todo = new Todo({...tododata})
                await todo.save()
                return tododata
            }
        },
        updateTodo:{
            type:todoType,
            args:{
                todoinput:{type: todoinputType},
                todoid:{type:new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args){
                let data;
                if (args.todoinput.title.length > 0){
                  data =  await Todo.findOneAndUpdate({todoid:args.todoid}, {title: args.todoinput.title}).exec()
                }
                if (args.todoinput.content.length > 0){
                    
                  data =  await Todo.findOneAndUpdate({todoid:args.todoid}, {content: args.todoinput.content}).exec()
                }
                return await Todo.findOne({todoid:args.todoid})
            }
        },
        deleteTodo:{
            type:todoType,
            args:{
                todoid:{type:GraphQLID}
            },
            async resolve(parent, args){
                return await Todo.findOneAndDelete({todoid:args.todoid})
            }
        }
    }
})

const gqlSchema = new GraphQLSchema({
    query:rootQuery,
    mutation:rootmutations

})


export default gqlSchema