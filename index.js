const express=require('express')
const app = express()
const Database = require("@replit/database")
const db = new Database()
const bodyParser = require('body-parser')
const cors = require('cors')
const nodemailer = require("nodemailer");
var corsOptions = {
  origin:process.env.MY_WEBSITE,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
    }
});


app.set('view engine','pug')
app.use(cors(corsOptions))

PORT=3000


app.post('/api/forms',bodyParser.json(),async (req,res)=>{
const obj = {
  ...req.body,
  timestamp:Date.now()
}

if(
req.body.name&&
req.body.email&&
req.body.message&&
req.body.message.length<5000&&
req.body.email.length<100&&
req.body.name.length<100){
const result = db.set(Date.now(),obj)

const mailOptions = {
  from: process.env.EMAIL_ACCOUNT, // sender address
  to: process.env.EMAIL_ACCOUNT, // list of receivers
  subject: `${req.body.name} has sent an email!`, // Subject line
  html: `<p><h3>Sender:&nbsp;${req.body.email}</h3>
  ${req.body.message}
  </p>`// plain text body
};

const mailOptions2 = {
  from: process.env.EMAIL_ACCOUNT, // sender address
  to: req.body.email, // list of receivers
  subject: `${req.body.name} has sent an email!`, // Subject line
  html: `<body style="color:rgb(39, 39, 39);background-color:rgb(218, 218, 218);font-family:Georgia, 'Times New Roman', Times, serif;">
    <img style="border:5px solid black;width:300px;margin:auto;display: block;" src="https://images.unsplash.com/photo-1549032305-e816fabf0dd2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" alt="thank you picture">
    <h1 style="text-align:center;">Thanks for the message, ${req.body.name}!</h1>
    <hr>
    <br>
    <p style="font-size:1.5rem;">You sent a message to me at my ${process.env.MY_WEBSITE} landing page. 
        I'll get back to you soon with a response shortly. In the meanwhile, feel free to check out some of
    my other content.</p>
    <br>
    <a href="http://www.josiahspranklemusic.com/">Music Composition</a> |
    <a href="https://www.josiahsprankle.dev/">Web Development</a> |
    <a href="https://github.com/jspranklemusic">Github</a>
</body>`// plain text body
};

transporter.sendMail(mailOptions, async function (err, info) {
   if(err){ console.log(err)
   res.status(400).send(err)
   }
   else
     await transporter.sendMail(mailOptions2)
     console.log(info);
     console.log(obj)
      res.json(obj)
});

}else{
  obj = "Error: invalid request"
  console.log(obj)
      res.status(400).send(obj)
}
})

app.get(`/${process.env.EMAIL_PASSWORD}`,async (req,res)=>{
  let arr=[]
  const keys = await db.list()
  for(let key of keys){
    // console.log(key)
    let value = await db.get(key)
    arr.push(value)
  }
  console.log(arr)
  res.render('index',{emails:arr.reverse()})
})

app.get('/',(req,res)=>{
  res.send("Hello, only I can access the API.")
})

app.get('/:x',(req,res)=>{
  res.send("Hello, only I can access the API.")
})

app.listen(process.env.PORT|PORT,()=>{
  console.log('listening on port:' +PORT)
})