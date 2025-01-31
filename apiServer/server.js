require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const apiRoute = require("./routes/api");
const authRoute = require("./routes/auth");
const testRoute = require("./routes/test");
const PORT = process.env.PORT;


app.use(cors());
app.use(bodyParser.json());
app.use("/api",apiRoute);
app.use("/auth",authRoute);
app.use("/test",testRoute);

app.listen(PORT,()=>{
    console.log(`Server started at localhost:${PORT}`);
    console.log(`http://localhost:${PORT}`);
})