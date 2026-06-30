const express = require('express')
const db = require('./database.js')
const app = express()
const session = require('express-session')
app.set('view engine','ejs')
app.set('views','blog/views')
app.use(express.urlencoded())
app.use(session({'secret':'222'}))

app.get('/register',(req,res)=>{
    if(!req.session.login){
        const error = req.session.error
        delete req.session.error
         res.render('reg',{error} )
    }
    else{
        res.redirect('/')
    }
})
app.get('/login',(req,res)=>{
   if(!req.session.login){
        const error = req.session.error
        delete req.session.error
        console.log(error)
         res.render('login',{error})
    }
    else{
        res.redirect('/')
    }
})
app.get('/',async (req,res)=>{
    if(!req.session.login){
        res.redirect('/login')
    }
    else{
        let resu = await db.getAllPosts()
        res.render('main',{'posts':resu})
      }
    }
)
app.post('/register',async (req,res)=>{
    let login = req.body.login
    let password = req.body.password
    if(!login || !password){
        req.session.error = 'Empty login or password'
        res.redirect('/register')
    }
    else if (await db.isUser(login) === true){
        req.session.error = 'Login already taken!'
        res.redirect('/register')
    }
    else{
        db.createUser(login,password)
        req.session.login = login
        res.redirect('/login')
    }
})
app.post('/login',async (req,res)=>{
    let login = req.body.login
    let password = req.body.password
    if(!login || !password){
        req.session.error = 'Empty login or password'
        res.redirect('/login')
    }
    else if (await db.userExists(login,password) === true){
        req.session.login = login
        res.redirect('/')
    }
    else{
        req.session.error = 'Uncorrect login or password'
        res.redirect('/login')
    }
})
async function StartServer() {
    await db.connect()
    console.log('connected to db')
    app.listen(4000,()=>{console.log('ok')})
}

app.post('/newpost',async (req,res)=>{
    if(!req.session.login){
        res.redirect('/register')
    }
    let title = req.body.title
    let content = req.body.content
    if(!title||!content){
        res.redirect('/')
    }
    else{
        await db.newPost(content,title,req.session.login)
        res.redirect('/')
    }
})
app.get('/post/:id',async (req,res)=>{
    let id = req.params.id
    let post = await db.getPostById(id)
    let comments = await db.getCommentsByPostId(id)
    res.render('blog',{post,comments})
})
app.post('/post/:id',async(req,res)=>{
    let userlogin = req.session.login
    let content = req.body.content
    let resu = await db.isUser(userlogin)
    if(resu = false){
        res.redirect('/register')
    }
    else{
        if(!content){
            res.redirect('/post/'+id)
        }
        else{
            db.addComment(content,userlogin,req.params.id)
        }
    }
})
StartServer()
