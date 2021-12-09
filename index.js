var express = require('express')
var routes = require('./routes/routes')
var db = require('./config/connection')
var cors = require('cors')
var logger = require('morgan')
var path = require('path')
var fs = require('fs')

const PORT  = process.env.PORT || 4002;
const app = express()

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(logger('combined',{stream : accessLogStream}))
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors())

app.use('/' , (reqq,res) => {
  res.send('Hey , Welcome to JobsWay Company Service.')
})

app.use('/api/v1/company/',routes)


app.get('/logo.jpg' , (req , res) => {
  res.sendFile(path.join(__dirname, "public/Images/logo.jpg"));
})

db.connect((err)=>{
    if(err) console.log("Database Connection Error"+err);
    else console.log("database Connected Successfully");
})


app.listen(PORT,(err) => {
    if(err) console.log("Server failed to start. Error : " + err);
    else console.log(`COMPANY SERVICE - Server started at port : ${PORT}.`);
})
