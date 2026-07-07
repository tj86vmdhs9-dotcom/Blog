const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const bcrypt = require('bcrypt')
let db = null

async function connect (){
    db = await sqlite.open({
        filename:'all2.db',
        driver:sqlite3.Database
    })
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users(
            login TEXT PRIMARY KEY,
            password TEXT
        );
    `)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blogs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userlogin TEXT,
        title TEXT,
        content TEXT
        )`)
    await db.exec(
        `CREATE TABLE IF NOT EXISTS comments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userlogin TEXT,
        content TEXT,
        blog_id INTEGER
        )`
    )
}
async function isUser(username){
    let user = await db.get(
        `SELECT * FROM  users WHERE login = ?`,[username]
    )
    if(user){
        return(true)
    }
    else{
        return(false)
    }
}
async function createUser(login,password) {
    await db.run(
        `INSERT INTO users(login,password) VALUES (?,?)`,[login,await bcrypt.hash(password,10)]
    )
    }
async function userExists(login,password) {
    try{
        let user=  await db.get(
        `SELECT * FROM users WHERE login =? `,[login]
    )
    if(user){
        if(await bcrypt.compare(password,user.password)){
            return(true)     
        }
        else{
            return(false)
        }
    }
    else{
        return(false)
    }
}
catch(er){
    return(false)
}
}
async function newPost(content,title,login) {
    await db.run(
    `INSERT INTO blogs(title,content,userlogin) VALUES(?,?,?)`,[title,content,login])
}
async function getAllPosts() {
    let posts = await db.all(
        `SELECT * FROM blogs`
    )
    return(posts)
}
async function getPostsByLogin(login) {
    let posts = await db.all(
        `SELECT * FROM blogs WHERE userlogin=?`,[login]
    )
    return(posts)
}
async function getPostById(id) {
    let res = await db.get(`SELECT * FROM blogs WHERE id = ?`,[id])
    return(res)
}
async function getCommentsByPostId(post_id) {
    let res = await db.all(`SELECT * FROM comments WHERE blog_id =? `,[post_id])
    return(res)
}
async function addComment(content,userlogin,post_id) {
    await db.run(`INSERT INTO comments (userlogin,blog_id,content) VALUES  (?,?,?)`,[userlogin,post_id,content])
}
module.exports = {connect,isUser,createUser,userExists,newPost,getAllPosts,getPostsByLogin,getPostById,getCommentsByPostId,addComment}