const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

// Enable CORS for specific origins
// const corsOptions = {
//   origin: 'https://medaloha.cresol.in',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// };


var multer = require('multer');
const pool = require('./dbconfig/database.js'); // db connection file
port = process.env.PORT || 2200;


const app = express();

app.use(cors(corsOptions));

const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
require('dotenv').config();
const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = process.env.TWILIO_API_KEY;
const twilioApiKeySecret = process.env.TWILIO_API_SECRET;
//const token = 'bfb10823f929563481faa69289310ef9' //'1f69bbb55b84f38d16ceda3fb7305e30'; //'3dc90b3bfcfcbbca34d75841f8548a20';
const token = 'faddd5eedf9ecc7ce93e353eb4adb5dc';
const client = require('twilio')(twilioAccountSid, token);
// client.video.recordings
//             .list({
//               groupingSid: ['RMf14a0de44f8ec11659ab39dca9ef98b5'],
//               limit: 20
//              })
//             .then(recordings => recordings.forEach(r => console.log(r.sid)));


// for parsing application/json
app.use(express.json()); 
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// for parsing multipart/form-data
 
//app.use(express.static('public')); 


// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

  
app.get('/token', (req, res) => {
  const { identity, roomName } = req.query;
  const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  }); 
  token.identity = identity;
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  res.send(token.toJwt());
  console.log(`issued token for ${identity} in room ${roomName}`);
});

app.use('/public', express.static('public'))

// this router for registration and login related API for Client and Specialist 
const authenticationRouter= require('./authenticationAPI/authenticationapi');
app.use('/authenticationAPI/',authenticationRouter);

const CustomerRouter= require('./customerAPI/customerapi');
app.use('/customerAPI/',CustomerRouter);

const SpecilistRouter= require('./specilistAPI/specilistapi');
app.use('/specilistAPI/',SpecilistRouter);

const medalohaRouter = require('./medalohaAPI/medalohaapi');
app.use('/medalohaAPI/',medalohaRouter);

const chatRouter= require('./chatAPI/chatapi');
app.use('/chatAPI/',chatRouter);







// app.post('/profilepic', upload.single('avatar'), function (req, res, next) {
//     // req.file is the `avatar` file
//     // req.body will hold the text fields, if there were any
//     console.log(req.file);
//     console.log(req.body);
//   });



app.get('/' , function (req, res) {
    
    var data ={
        name:'Medaloha API Running Fast12345'
    }
    res.end(JSON.stringify(data)); 
});



app.listen(port,function(){
    console.log('server start' + port);
});
