const express = require("express");
const crypto = require("crypto")
const fs = require("fs");
const readline = require('readline');


const app = express();
app.use(express.urlencoded())
app.use(express.json())


app.get("/", (req, res) => {



    res.sendFile('index.html', {root: __dirname })

});


app.post("/login", async (req, res) => {


    let salt = crypto.randomBytes(16).toString("hex");
    console.log("SALT: "  + salt);

    let hash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64, `sha512`).toString(`hex`)
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

  let checkHash = crypto.pbkdf2Sync(req.body.password, readSalt, 1000, 64, `sha512`).toString(`hex`);
  console.log(checkHash)
  if(readHash === checkHash ) {res.send("authenticated")}else{res.send("wrong creds")}



});








app.listen(5000, () => console.log("LISTENING TO PORT 5000"))