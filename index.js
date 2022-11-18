const express = require("express");
const crypto = require("crypto")
const fs = require("fs");
const readline = require('readline');
const sessions = require("express-session");

const app = express();
app.use(express.urlencoded())
app.use(express.json())
const oneDay = 1000 * 2;
const http = require("http").Server(app);
const io = require("socket.io")(http);
app.use(sessions({
  secret: "MDnoahnuicxozgby8oBIAbiofnajkjdaokpfjiopc",
  saveUninitialized: true,
  resave:false
}));


var session;


  app.get("/", (req, res) => {
 
    session=req.session;
  
    if(req.session.username){
      res.send("Welcome! <a href=\'/logout'>click to logout</a>");
    }
    else{
      res.sendFile('index.html', {root: __dirname })
    }
  
  });


  app.post("/login", async (req, res) => {
  
    session=req.session;
      let salt = crypto.randomBytes(16).toString("hex");
      console.log("SALT: "  + salt);
  
      let hash = crypto.pbkdf2Sync(req.body.username + req.body.password, salt, 1000, 64, `sha512`).toString(`hex`)
    console.log(req.body);
    console.log("HASH: " + hash);
  
  
  
    
    let count = 0;
    let readSalt = "";
    let readHash = "";
  
    
    const fileStream = fs.createReadStream('./save_data/db.txt');
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {
      count++;
  
      if(count == 1) { readSalt = line }
      if(count == 2) { readHash = line }
    }
  
    console.log("READ::: " + readSalt + "   " + readHash)
  
    let checkHash = crypto.pbkdf2Sync(req.body.username + req.body.password, readSalt, 1000, 64, `sha512`).toString(`hex`);
    console.log(checkHash)
    
    if(readHash === checkHash ) 
    {
      session=req.session;
      session.username=req.body.username;
      req.session.username=req.body.username
      console.log("authed:::  " + req.session.username)

      res.redirect("/home")
    }
    else
    {
      res.send("wrong creds")
    }
  
  });
  
  
  
  
  app.get('/emit',(req,res) => {
    session=req.session;
    console.log(req.session)
  
    if(req.session.username){
      res.sendFile('emit.html', {root: __dirname })
    }
    else{
      res.sendFile('index.html', {root: __dirname })
    }
  
  });
  
  
  app.get('/home',(req,res) => {
    session=req.session;
    console.log(req.session)
    if(req.session.username){


        io.on("connection", (socket) =>{

        console.log("connected")
        socket.on("stream", (image) =>{
          

            socket.broadcast.emit("stream", image);
          
        
        
         })
      
      }); 
      res.sendFile('show.html', {root: __dirname })
    }
    else{
      res.sendFile('index.html', {root: __dirname })
    }
  
  });
  
  app.get('/logout',(req,res) => {

    req.session.destroy();
    res.redirect('/');
  });
  

http.listen(5000, () => console.log("LISTENING TO PORT 5000"))