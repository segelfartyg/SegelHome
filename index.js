const express = require("express");

const app = express();

app.get("/", (req, res) => {



res.send("<html>SegelHome</html>");


});



app.listen(5000, () => console.log("LISTENING TO PORT 5000"))