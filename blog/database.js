const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
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
        `INSERT INTO users(login,password) VALUES (?,?)`,[login,password]
    )
    }
async function userExists(login,password) {
    try{
        let user=  await db.get(
        `SELECT * FROM users WHERE login =?  AND password =? `,[login,password]
    )
    if(user){
        return(true)
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
module.exports = {connect,isUser,createUser,userExists,newPost,getAllPosts,getPostsByLogin}