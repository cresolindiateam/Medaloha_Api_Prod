const router = require("express").Router();
const express = require('express');
const pool = require('../dbconfig/database.js'); // db connection file
var nodemailer = require('nodemailer');
var crypto = require('crypto');
const moment = require('moment');
var moment2 = require('moment-timezone');
const mpath = require('path');
const sharp = require('sharp');
var multer = require('multer');
require('dotenv').config();
 var btoa = require('btoa');
const app = express(); 
var globalVar = require('../global/global.js');  // middleware functions 


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/docs')
    },
    filename: function (req, file, cb) { 
        const newfilename = file.originalname;
      cb(null, Date.now() + '-' + newfilename.replace(/\s/g,''))
    }
  });
   
  var upload = multer({ storage: storage }); 
  
  
  router.post('/Rebooking4UserBySpecialist',async function (req, res) { 
    var  apiName  = 'Rebooking4UserBySpecialist';   
    var pre_user_id = req.body.pre_user_id;
    var specialist_id = req.body.specialist_id;
    var chooseTime = req.body.chooseTime; 
    var legend_name = req.body.legend_name;  
    var legend_id = req.body.legend_id;   
    var booking_id = req.body.booking_id;   
    var user_email = req.body.user_email;   
    console.log(req.body);
  
      //chooseTime = moment.utc(moment(chooseTime)).format(); // moment.utc(chooseTime).format(); // moment(chooseTime).format('YYYY-MM-DD HH:mm:ss'); 
       
    //  var event_id = req.body.event_id;   
    //  var session_date = await globalVar.data.GetEventDatebyID(event_id); 
    //  chooseTime = moment(session_date).format('YYYY-MM-DD HH:mm:ss');
    
     var timezone = await globalVar.data.GetSpecialistTimeZoneById(specialist_id);
    var tempStartDateTime = moment.tz(chooseTime, timezone); 
    console.log('UTC Format:');  
     chooseTime =  tempStartDateTime.utc().format(); // 2013-11-18T03:55Z   
    
        //booking_status = 4 Rebooking 
        var sql2 = "update booking_histories set rebook_session_date1='"+chooseTime+"' , booking_status = 7  where id="+booking_id;
        console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         });   

        

        var link =  process.env.WEBURL+'/specilistconfirmation?strMatch='+crypto.createHash('md5').update(booking_id.toString()).digest('hex');
        console.log('link');

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          
        //   auth: {
        //      user: 'cresoluser@gmail.com', // here use your real email
        //      pass: 'cresoluser@#$' // put your password correctly (not in this question please)
        //   }
        
         auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
          
        });
  
        var mailOptions = {
          from: 'nitesh@cresol.in',
          to: user_email,
          subject: 'Re-booking request',
          html: 'Dear User ,  here is new Schedule for '+legend_name+' Pleaes verified at click on this given below link<br/>'+'<a href="'+link+'">Confirm your Schedule</a>'
        };
  
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response); 
          }
  
        }); 
     
  
        var data = {
           Status: true, 
           Message: 'Booking Done'  
       };  
       res.end(JSON.stringify(data));    
    });  
    
    
    
router.get('/IsSpecialistExpireSession', async function (req, res) { 
  var  apiName  = 'IsSpecialistExpireSession';  
  var booking_id =  req.query.booking_id;
  
  var sql2 = "SELECT rebook_session_date1, session_date FROM booking_histories where id ="+booking_id;
     pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          };  
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
          var sessiondate = memberArray2[0]['session_date'];
          var rebook_session_date1 = memberArray2[0]['rebook_session_date1'];

          if(rebook_session_date1){
              sessiondate =rebook_session_date1;
          }

          var startTime = moment();
          var end = moment(sessiondate);
          var duration = end.diff(startTime, 'hours');
        //  var hours = duration.asHours();
          console.log('hoursnew'); console.log(duration);


          res.end(JSON.stringify(1)); 
        }
      }); 
}); 
 
  //SpecialistReBooking 
router.post('/SpecialistReBooking',async function (req, res) { 
  var  apiName  = 'SpecialistReBooking';   
   // var user_id = req.body.user_id;
  var bookingID = req.body.bookingID;
  //var specialist_id = req.body.specialist_id;
  var session_date = req.body.session_date; 
  //var price = req.body.price;  
 // var payment_stripe_id = req.body.payment_stripe_id;  
 // var legend_id = req.body.legend_id; 
  var message_description = req.body.message_description;


  var event_id = req.body.event_id;  
  var session_date = await globalVar.data.GetEventDatebyID(event_id); 
  session_date = moment(session_date).format('YYYY-MM-DD HH:mm:ss');
  
//  session_date = moment.utc(moment(session_date)).format();  //moment.utc(session_date).format(); // moment(session_date).format('YYYY-MM-DD HH:mm:ss');
  var sql3 = "update booking_histories set rebook_session_date1 ='"+session_date+"' , updated_at=now() ,booking_status=4 , user_rebooking_status=1 where id ="+bookingID;
    console.log('booking query');
    console.log(sql3);
    //return false;
    pool.query(sql3, function (err3, result, fields) {
     if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }

      var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
      var invoice_id  = bookingID; 



      var SpecialistEmail = globalVar.data.GetSpecialistEmailfromBooking(invoice_id);

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        // auth: {
        //   user: 'cresoluser@gmail.com', // here use your real email
        //   pass: 'cresoluser@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
        // }
        
         auth: {
                user: 'ajay@cresol.in', // here use your real email
                pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
              }
        
      }); 

      var mailOptions = {
        from: 'nitesh@cresol.in',
        to: SpecialistEmail,
        subject: 'Medaloha :ReBooking Done ',
        html: 'Your request Rebooking Done.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response); 
        }

      }); 


      var data = {
         Status: true, 
         Message: 'Booking Done' ,
         InvoiceId:invoice_id
     };  
     res.end(JSON.stringify(data));    
  });  
   
});


router.post('/SpecialistBooking', async function (req, res) { 
  var  apiName  = 'SpecialistBooking';   
  var user_id = req.body.user_id;
  var specialist_id = req.body.specialist_id;
  var session_date = req.body.session_date; 
  var price = req.body.price;  
  var payment_stripe_id = req.body.payment_stripe_id;  
  var legend_id = req.body.legend_id; 
  var message_description = req.body.message_description;
  
  console.log(req.body);
  var brand = req.body.brand;
  var last4 = req.body.last4;  
  var clientSecretPaymentIndentId = req.body.clientSecretPaymentIndentId;  
  
  var event_id = req.body.event_id;  
  var session_date = await globalVar.data.GetEventDatebyID(event_id); 
  session_date = moment(session_date).format('YYYY-MM-DD HH:mm:ss');
 // session_date =  moment.utc(moment(session_date)).format(); //moment.utc(session_date).format();  // moment(session_date).format('YYYY-MM-DD HH:mm:ss');
  
  
  await globalVar.data.UpdateEventBookedbyID(event_id , 2); // booked 
    
  var sql3 = "insert into booking_histories (payment_intent_id,user_id, specialist_id,session_date,booking_price,payment_stripe_id,legend_id,booking_date,craeted_at,specialist_query,twilio_chat_id1,twilio_chat_id2,card_type,last4) value ('"+clientSecretPaymentIndentId+"' , '"+user_id+"','"+specialist_id+"','"+session_date+"','"+price+"','"+payment_stripe_id+"','"+legend_id+"',now(),now(),'"+message_description+"','user1_"+payment_stripe_id+"','user2_"+payment_stripe_id+"' ,'"+brand+"','"+last4+"')";
    console.log('booking query');
    console.log(sql3);
    //return false;
    pool.query(sql3,   function (err3, result, fields) {
     if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }

      var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
      var invoice_id  = Result.insertId; 


     

      var SpecialistEmail = globalVar.data.GetSpecialistEmailfromBooking(invoice_id);

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
       
        
          auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
          
      }); 

      var mailOptions = {
        from: 'nitesh@cresol.in',
        to: SpecialistEmail,
        subject: 'Medaloha :Booking Done ',
        html: 'Your request booking Done.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response); 
        }

      }); 

      var data = {
         Status: true, 
         Message: 'Booking Done' ,
         InvoiceId:invoice_id
     };  
     res.end(JSON.stringify(data));    
  });  
   
});





router.post('/reportTomedaloha', function (req, res) { 
  var  apiName  = 'reportTomedaloha';   
  var user_id = req.body.client;
  var specialist_id = req.body.specialistid;
  var message = req.body.message;  
 
  var sql3 = "insert into medaloha_reports (user_id, specialist_id,message,created_at) value ('"+user_id+"','"+specialist_id+"','"+message+"',now())";
   
    pool.query(sql3, function (err3, result, fields) {
     if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      } 
      var data = {
         Status: true, 
         Message: 'Done' 
     };  
     res.end(JSON.stringify(data));    
  });  
   
});



  router.post("/payment", async (req, res) => { 
const stripe = require("stripe")("sk_test_1LHuYRF7KNv2C7oU3y3a7b3Y");
 const { items } = req.body; 
  // Create a PaymentIntent with the order amount and currency
  
 const customer = await stripe.customers.create({
    email: items[0].email, // Pass email (Optional)
    name: items[0].username, // Pass name (Optional)
  }); 

  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: items[0].amount,
    currency: "usd",
     customer: customer.id, // Specify customer id
    payment_method_types:["card"]
  });
  
   await stripe.paymentIntents.confirm(
    paymentIntent.id,
    {payment_method: 'pm_card_visa'}
  );
  
//   res.send({
//     clientSecret: paymentIntent.client_secret
//   }); 


  res.send({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId:paymentIntent.id
  }); 
  
  

}); 
  
  router.post('/updatePublicintro' ,   upload.fields([{
    name: 'profilepic', maxCount: 1
  }, {
    name: 'activityimage1', maxCount: 1
  }
  , {
    name: 'activityimage2', maxCount: 1
  }
  , {
    name: 'activityimage3', maxCount: 1
  }, {
    name: 'activityimage4', maxCount: 1
  } ]), async function (req, res, next) {
 
    console.log('req.body --->');
    console.log(req.body);
 
    var specialist_id =   req.body['specialist_id'];
    var title = req.body['title'];
    var studies =req.body['studies'];
    var experience  = req.body['experience'];
    var country =  req.body['country'];
    var city = req.body['city'];  
    var public_intro_id = req.body['public_intro_id'];   
    var language_code = req.body['language_id'];   
    var setting_lanaguage_id =   req.body['setting_lanaguage_id'];  
    var holisticData = req.body['holisticData'];     
    var tagsData = req.body['tagsData']; 
    
    
    
    var suggest_category = '';   
    
    if(req.body['suggest_category']){
      suggest_category  =req.body['suggest_category'];
    }
    
    
     var suggest_tag = ''; 
    
      if(req.body['suggest_tag']){
       suggest_tag  =req.body['suggest_tag'];
    }
    
    
    
    
     var language_id = '';
    
    if(setting_lanaguage_id !='null'){
      language_id = setting_lanaguage_id;
    } else {
      language_id = await globalVar.data.getLanguageIdByCode(language_code);
    }
      
      
      

  if(public_intro_id==0){ 
   var sql2 = "insert into specialist_public_intros (specialist_id, language_id , your_title, your_studies, country_id, city_id,work_experience,suggest_holistic_field,suggest_tag_field) values ('"+specialist_id+"' ,'"+language_id+"' ,'"+title+"' ,'"+studies+"' ,'"+country+"' ,'"+city+"' ,'"+experience+"' ,'"+suggest_category+"' ,'"+suggest_tag+"' ) ";
    console.log(sql2);
   pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
          };  
         res.end(JSON.stringify(data));
         return false;
       }  

       var myJSON = JSON.stringify(result2);
       var Result = JSON.parse(myJSON);
       var public_intro_id  = Result.insertId; 



     if(holisticData){ 

        var sql2 = "delete from specialist_holistics where specialist_public_intro_id="+public_intro_id;
         console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  


        holisticData =  holisticData.split( "," ); 
        holisticData.forEach((element) => 
        {
              if(element){
                console.log(element);


        var sql2 = "insert into specialist_holistics (specialist_public_intro_id, holistic_name) values('"+public_intro_id+"' , '"+element+"')";
        //  console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         });   


              } 
        }); // end of loop 

      });  

  }


   if(tagsData){

    var sql2 = "delete from specialist_tags where specialist_public_intro_id ="+public_intro_id;
    //  console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  



      tagsData =  tagsData.split( "," ); 
      tagsData.forEach((element) => 
        {
          if(element){
            console.log(element);

            var sql2 = "insert into specialist_tags (specialist_public_intro_id, tags) values('"+public_intro_id+"' , '"+element+"')";
            //  console.log(sql2);
            pool.query(sql2, async function (err2, result2, fields) {
                if(err2)
                { 
                  console.log(err2); 
                 var data = {
                     Status: false, 
                     Message: 'Something wroing in query.',
                     Error:err2
                 }; 
                  //var logStatus = 0;
                  //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                  res.end(JSON.stringify(data));
                  return false;
                 }  
             }); 

          } 
        }); // end of loop  
      });   
 }  


    if(req.files['profilepic']){ 
 
      // await sharp((req.files['profilepic'].buffer)
      // .resize(640, 320)
      // .toFormat("jpeg")
      // .jpeg({ quality: 90 })
      // .toFile(`upload/`+req.files['profilepic'][0]['filename']);


      await sharp(req.files['profilepic'][0]['path'])
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(
          mpath.resolve(req.files['profilepic'][0]['destination'],'profileresize',req.files['profilepic'][0]['filename'])
      )
       
        var sql2 = "update specialist_public_intros set profile_photo='"+req.files['profilepic'][0]['filename']+"' where id="+public_intro_id;
        console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         });   
     } 

    if(req.files['activityimage1']){ 
      var sql2 = "update specialist_public_intros set activity_image1='"+req.files['activityimage1'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
    }


    if(req.files['activityimage2']){ 
      var sql2 = "update specialist_public_intros set activity_image2='"+req.files['activityimage2'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }



    if(req.files['activityimage3']){ 
      var sql2 = "update specialist_public_intros set activity_image3='"+req.files['activityimage3'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }


    if(req.files['activityimage4']){ 
      var sql2 = "update specialist_public_intros set activity_image4='"+req.files['activityimage4'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }




       var data = {
         Status: true, 
         Message:'Done',
         PublicIntro_id : public_intro_id
        };    

      var logStatus = 1;
      res.end(JSON.stringify(data));  
   });  

  } else { 
 


  var sql2 = "update specialist_public_intros set specialist_id ='"+specialist_id+"' , language_id ='"+language_id+"' , your_title ='"+title+"', your_studies= '"+studies+"' , country_id='"+country+"', city_id = '"+city+"' ,work_experience ='"+experience+"'  ,suggest_holistic_field='"+suggest_category+"',suggest_tag_field='"+suggest_tag+"' where id="+public_intro_id;
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
       }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }  
   }); 


 
if(holisticData){ 

    var sql2 = "delete from specialist_holistics where specialist_public_intro_id="+public_intro_id;
     console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  


    holisticData =  holisticData.split( "," ); 
    holisticData.forEach((element) => 
    {
          if(element){
            console.log(element);


    var sql2 = "insert into specialist_holistics (specialist_public_intro_id, holistic_name) values('"+public_intro_id+"' , '"+element+"')";
      console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
     });   


          } 
    }); // end of loop 

  });  

}


if(tagsData){

var sql2 = "delete from specialist_tags where specialist_public_intro_id ="+public_intro_id;
  console.log(sql2);
pool.query(sql2, async function (err2, result2, fields) {
    if(err2)
    { 
      console.log(err2); 
     var data = {
         Status: false, 
         Message: 'Something wroing in query.',
         Error:err2
     }; 
      //var logStatus = 0;
      //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
      res.end(JSON.stringify(data));
      return false;
     }  



  tagsData =  tagsData.split( "," ); 
  tagsData.forEach((element) => 
    {
      if(element){
        console.log(element);

        var sql2 = "insert into specialist_tags (specialist_public_intro_id, tags) values('"+public_intro_id+"' , '"+element+"')";
        console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         }); 

      } 
      }); // end of loop   

    });   

  }  

   if(req.files['profilepic']){  
     console.log('i am here');
    console.log(req.files['profilepic'][0]['filename']);
    console.log(req.files['profilepic'][0]['path']);
    console.log(req.files['profilepic'][0]['destination']);
 
    await sharp(req.files['profilepic'][0]['path'])
    .resize(200, 200)
    .jpeg({ quality: 90 })
    .toFile(
        mpath.resolve(req.files['profilepic'][0]['destination'],'profileresize',req.files['profilepic'][0]['filename'])
      )
//  fs.unlinkSync(req.files['profilepic'][0]['path']);
   


     
    var sql2 = "update specialist_public_intros set profile_photo='"+req.files['profilepic'][0]['filename']+"' where id="+public_intro_id;
   console.log('sql2');  console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
     });  
    }

    if(req.files['activityimage1']){ 
      var sql2 = "update specialist_public_intros set activity_image1='"+req.files['activityimage1'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }


    if(req.files['activityimage2']){ 
      var sql2 = "update specialist_public_intros set activity_image2='"+req.files['activityimage2'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }



    if(req.files['activityimage3']){ 
      var sql2 = "update specialist_public_intros set activity_image3='"+req.files['activityimage3'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }


    if(req.files['activityimage4']){ 
      var sql2 = "update specialist_public_intros set activity_image4='"+req.files['activityimage4'][0]['filename']+"' where id="+public_intro_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
      }




      var data = {
        Status: true, 
        Message:'Done' ,
        PublicIntro_id : public_intro_id
      };   
      
      res.end(JSON.stringify(data));   
 
  

    } // end of else 
  });


  
  

  router.get('/GetUserQuery', async function (req, res) { 
    var  apiName  = 'GetUserQuery';  
    var payment_id =  req.query.payment_id; 
    var sql2 = "SELECT booking_histories.specialist_query,users.user_image  from booking_histories left join users on (users.id=booking_histories.user_id) where payment_stripe_id='"+payment_id+"'";
    console.log('consultation query sql'); console.log(sql2);
 
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
          var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
          }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }
       var myJSON2 = JSON.stringify(result2);
       var memberArray2 = JSON.parse(myJSON2); 
       console.log(memberArray2);
       userQuery =[];
       if(memberArray2){
         var userImage = null;
         if(memberArray2[0]['user_image']!=null)
         userImage = process.env.APIURL+"/public/uploads/profile/"+memberArray2[0]['user_image'];
          userQuery.push({
            user_image :userImage,
            specialist_query:memberArray2[0]['specialist_query']
          })
         console.log('query result');  
       }   
       res.end(JSON.stringify(userQuery)); 
     }); 
}); 




router.get('/GetSpecialistConsulationByID', async function (req, res) { 
  var  apiName  = 'GetSpecialistConsulationByID';  
  var specialist_id =  req.query.specialist_id; 
  var sql2 = "SELECT legends.legend_name , legends.id , specialist_public_consultations.provided_type , specialist_public_consultations.public_price  FROM `specialist_public_consultations`  join legends on (specialist_public_consultations.provided_type=legends.id) WHERE specialist_public_consultations.specialist_id="+specialist_id+"";
  console.log('consultation sql'); console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
        var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }
     var myJSON2 = JSON.stringify(result2);
     var memberArray2 = JSON.parse(myJSON2); 
     console.log(memberArray2);
     if(memberArray2.length){ 
      // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
       res.end(JSON.stringify(memberArray2)); 
     }
   }); 
}); 




router.get('/specialistWorkingRemoveByid', async function (req, res) { 
  var  apiName  = 'specialistWorkingRemoveByid';  
  var working_id =  req.query.working_id; 
  var sql2 = "delete from  specialist_working_hours  where id  ="+working_id+"";
  console.log('consultation sql'); console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
        var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }

       var data = {
        Status: true, 
        Message:'Hipe Working' 
    };   
   
    res.end(JSON.stringify(data));  
     
   }); 
}); 



router.get('/removeEvent', async function (req, res) { 
  var  apiName  = 'removeEvent';  
  var eventId =  req.query.eventId; 
  var sql2 = "delete from  events  where id  ="+eventId+"";
  console.log('consultation sql'); console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
        var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }

       var data = {
        Status: true, 
        Message:'Hipe profile' 
    };   
    var logStatus = 1;
    res.end(JSON.stringify(data));  
     
   }); 
}); 



router.get('/UpdateHideSpecialistProfile', async function (req, res) { 
    var  apiName  = 'UpdateHideSpecialistProfile';  
    var specialist_id =  req.query.specialist_id; 
    var sql2 = "update specialist_private set status = 5  where id  ="+specialist_id+"";
    console.log('consultation sql'); console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
          var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
          }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }

         var data = {
          Status: true, 
          Message:'Hipe profile' 
      };   
      var logStatus = 1;
      res.end(JSON.stringify(data));  
       
     }); 
}); 

router.get('/UpdatePublishSpecialistProfile', async function (req, res) { 
  var  apiName  = 'UpdatePublishSpecialistProfile';  
  var specialist_id =  req.query.specialist_id; 
  var sql2 = "update specialist_private set status = 4  where id  ="+specialist_id+"";
  console.log('consultation sql'); console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
        var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }


       var specialist_Email = globalVar.data.GetSpecialistEmailById(specialist_id);
 
       var transporter = nodemailer.createTransport({
        service: 'gmail',
     
          auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
      });

      var mailOptions = {
        from: 'dgoud.tech@gmail.com',
        to: specialist_Email,
        subject: 'Welcome to Medaloha : Your porfile publish',
        html: 'Dear Subscription thanks for publish your profile'
      }; 
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response); 
        } 
      }); 

       var data = {
        Status: true, 
        Message:'Public profile' 
    };   
    var logStatus = 1;
    res.end(JSON.stringify(data));  
     
   }); 
}); 

  router.get('/GetSpecialistConsultation', async function (req, res) { 
    var  apiName  = 'GetSpecialistConsultation';  
    var specialist_id =  req.query.specialist_id; 
    var sql2 = "SELECT legends.legend_name , legends.id  FROM `specialist_public_consultations`  join legends on (specialist_public_consultations.provided_type=legends.id) WHERE specialist_public_consultations.specialist_id='"+specialist_id+"' and specialist_public_consultations.provided_type not in (1,2,3)";
    console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
          var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
          }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }
       var myJSON2 = JSON.stringify(result2);
       var memberArray2 = JSON.parse(myJSON2); 
       console.log(memberArray2);
       if(memberArray2.length){ 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
         res.end(JSON.stringify(memberArray2)); 
       }
     }); 
}); 



router.post('/NoteForPrivate' , function (req, res, next) {
  
  var bookingId =   req.body['bookingId'];
  var text = req.body['text'];
  var specialist_id =req.body['specialist_id'];  
 
  var sql2 = "update booking_histories set private_note='"+text+"'   where id="+bookingId;
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
       }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       } 
   
       var data = {
         Status: true, 
         Message:'Done' 
     };   
     var logStatus = 1;
     res.end(JSON.stringify(data));  
   });  // end of update query 

});

router.post('/NoteForClients' , function (req, res, next) {
  
  var bookingId =   req.body['bookingId'];
  var text = req.body['text'];
  var specialist_id =req.body['specialist_id'];  
 
  var sql2 = "update booking_histories set   client_note='"+text+"'   where id="+bookingId;
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
       }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       } 
   
       var data = {
         Status: true, 
         Message:'Done' 
     };   
     var logStatus = 1;
     res.end(JSON.stringify(data));  
   });  // end of update query 

});
 

  
  router.post('/updatePublicOverview' ,async function (req, res, next) {
      
  
    var specialist_id =   req.body['specialist_id'];
    var public_intro_id = req.body['public_intro_id'];
    var message ='';
    var messsagepart  = '';
    var aboutme =  req.body['aboutme'];
    var holisticexperience = req.body['holisticexperience'];    
    var education =  req.body['education'];  
    var workexperience = req.body['workexperience'];    
    var videourl1 =  req.body['videourl1']; 
    var videourl2 =  req.body['videourl2'];  
    var languagedetails =  req.body['languagedetails']; 
    var othercontribution =  req.body['othercontribution']; 
    var mission =  req.body['mission'];  
    var comment =  req.body['comment'];  
    var language_id = '';
    var language_code = req.body['language_id'];   
    var setting_lanaguage_id =   req.body['setting_lanaguage_id'];   
    
    console.log(req.body);

    if(setting_lanaguage_id!=null){
      language_id = setting_lanaguage_id;
    } else {
      language_id = await globalVar.data.getLanguageIdByCode(language_code);
    }
 
 
    console.log(language_id);
    
    if(public_intro_id==0){ 
      
    var sql2 = "insert into specialist_public_intros ( specialist_id,language_id,consultation_description_message, consultation_description_message_part , about_me, holistic_expertise,education ,work_experience_detail  , presentation_video_url1 ,presentation_video_url2 , available_languages, other_contribution, mission , comments) values ('"+specialist_id+"','"+language_id+"','"+message+"', '"+messsagepart+"','"+aboutme+"','"+holisticexperience+"', '"+education+"','"+workexperience+"','"+videourl1+"','"+videourl2+"','"+languagedetails+"','"+othercontribution+"','"+mission+"','"+comment+"') ";
    pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
          };  
         res.end(JSON.stringify(data));
         return false;
       }  
       
       
        
       if(req.body['message'] && req.body['message']!=''){
        await globalVar.data.insertoverviewdata(req.body['message'] , 1 ,specialist_id ,language_id); 
       } 
       if(req.body['messsagepart'] && req.body['messsagepart']!=''){
        await globalVar.data.insertoverviewdata(req.body['messsagepart'] , 2 ,specialist_id ,language_id); 
       }
       if(req.body['messagefull'] && req.body['messagefull']!=''){
        await globalVar.data.insertoverviewdata(req.body['messagefull'] , 3 ,specialist_id ,language_id); 
       }

       if(req.body['video'] && req.body['video']!=''){
        await globalVar.data.insertoverviewdata(req.body['video'] , 4 ,specialist_id ,language_id); 
       } 
       if(req.body['videofull'] && req.body['videofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['videofull'] , 5 ,specialist_id ,language_id); 
       } 
       if(req.body['videopart'] && req.body['videopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['videopart'] , 6 ,specialist_id ,language_id); 
       }

       if(req.body['audio'] && req.body['audio']!=''){
        await globalVar.data.insertoverviewdata(req.body['audio'] , 7 ,specialist_id ,language_id); 
       } 
       if(req.body['audiofull'] && req.body['audiofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['audiofull'] , 8 ,specialist_id ,language_id); 
       } 
       if(req.body['audiopart'] && req.body['audiopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['audiopart'] , 9 ,specialist_id ,language_id); 
       }

       if(req.body['vivo'] && req.body['vivo']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivo'] , 10 ,specialist_id ,language_id); 
       } 
       if(req.body['vivofull'] && req.body['vivofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivofull'] , 11 ,specialist_id ,language_id); 
       } 
       if(req.body['vivopart'] && req.body['vivopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivopart'] , 12 ,specialist_id ,language_id); 
       }
       

       var myJSON = JSON.stringify(result2);
       var Result = JSON.parse(myJSON);
       var public_intro_id  = Result.insertId; 
       var data = {
        Status: true, 
        Message:'Done' ,
        PublicIntroId:public_intro_id

    };   
    var logStatus = 1;
    res.end(JSON.stringify(data));  

      });

    } else { 
        
       var deletedone =   await globalVar.data.deleteoverviewdata(specialist_id,language_id); 

if(deletedone){
     if(req.body['message'] && req.body['message']!=''){
        await globalVar.data.insertoverviewdata(req.body['message'] , 1 ,specialist_id ,language_id); 
       } 
       if(req.body['messsagepart'] && req.body['messsagepart']!=''){
        await globalVar.data.insertoverviewdata(req.body['messsagepart'] , 2 ,specialist_id ,language_id); 
       }
       if(req.body['messagefull'] && req.body['messagefull']!=''){
        await globalVar.data.insertoverviewdata(req.body['messagefull'] , 3 ,specialist_id ,language_id); 
       }

       if(req.body['video'] && req.body['video']!=''){
        await globalVar.data.insertoverviewdata(req.body['video'] , 4 ,specialist_id ,language_id); 
       } 
       if(req.body['videofull'] && req.body['videofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['videofull'] , 5 ,specialist_id ,language_id); 
       } 
       if(req.body['videopart'] && req.body['videopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['videopart'] , 6 ,specialist_id ,language_id); 
       }

       if(req.body['audio'] && req.body['audio']!=''){
        await globalVar.data.insertoverviewdata(req.body['audio'] , 7 ,specialist_id ,language_id); 
       } 
       if(req.body['audiofull'] && req.body['audiofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['audiofull'] , 8 ,specialist_id ,language_id); 
       } 
       if(req.body['audiopart'] && req.body['audiopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['audiopart'] , 9 ,specialist_id ,language_id); 
       }

       if(req.body['vivo'] && req.body['vivo']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivo'] , 10 ,specialist_id ,language_id); 
       } 
       if(req.body['vivofull'] && req.body['vivofull']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivofull'] , 11 ,specialist_id ,language_id); 
       } 
       if(req.body['vivopart'] && req.body['vivopart']!=''){
        await globalVar.data.insertoverviewdata(req.body['vivopart'] , 12 ,specialist_id ,language_id); 
       }
       
}
      
       
    var sql2 = "update specialist_public_intros set consultation_description_message='"+message+"' , consultation_description_message_part ='"+messsagepart+"', about_me='"+aboutme+"', holistic_expertise='"+holisticexperience+"',education= '"+education+"' ,work_experience_detail ='"+workexperience+"' , presentation_video_url1='"+videourl1+"' ,presentation_video_url2='"+videourl2+"' , available_languages='"+languagedetails+"', other_contribution='"+othercontribution+"', mission='"+mission+"' , comments='"+comment+"' where id="+public_intro_id;
    console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         } 
     
         var data = {
           Status: true, 
           Message:'Done' 
       };   
       var logStatus = 1;
       res.end(JSON.stringify(data));  
     });  // end of update query 

    }

  });
   
   
   
router.get('/GetspecialistOverView', async function (req, res) { 
  var  apiName  = 'GetspecialistOverView';  
  var specialist_id =  req.query.specialist_id; 
  
  var language_code =  req.query.language_code;  // default 
  var seetingLanguage =  req.query.seetingLanguage;  //  choose under Action tabs 
  var language_id ='';

  console.log('seetingLanguage'); console.log(seetingLanguage);

  if(seetingLanguage!='null'){ 
        language_id = seetingLanguage;
   } else {  
    language_id = await globalVar.data.getLanguageIdByCode(language_code);
   }

   var sql2 = "SELECT consultation_id,overview_data   FROM `specialist_overivew_details` where specialist_id='"+specialist_id+"' and language_id='"+language_id+"'";
   console.log(sql2);
   pool.query(sql2, async function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      console.log(memberArray2);
      if(memberArray2.length){ 
       // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(memberArray2)); 
      }
    }); 


});
  

  router.post('/updatePublicConsultation' , function (req, res, next) {

    var message =   req.body['message'];
    var messagePart = req.body['messagePart']; 
    var messageFull  = req.body['messageFull'];

    var public_intro_id =  req.body['public_intro_id']; 
    var language_id =  req.body['language_id']; 
    var specialist_id =req.body['specialist_id'];

    var video =   req.body['video'];
    var videoPart = req.body['videoPart']; 
    var videoFull  = req.body['videoFull'];

    var inperson =   req.body['inperson'];
    var inpersonPart = req.body['inpersonPart']; 
    var inpersonFull  = req.body['inpersonFull'];
    
    var message_price =   req.body['message_price'];
    var message_part_price = req.body['message_part_price']; 
    var message_full_price  = req.body['message_full_price'];

    var video_price =   req.body['video_price'];
    var video_part_price = req.body['video_part_price']; 
    var video_full_price  = req.body['video_full_price'];
  
    
    var inperson_price =   req.body['inperson_price'];
    var inperson_part_price = req.body['inperson_part_price']; 
    var inperson_full_price  = req.body['inperson_full_price'];


    var message_price_commissions =   req.body['message_price_commissions'];
    var message_part_price_commissions = req.body['message_part_price_commissions']; 
    var message_full_price_commissions  = req.body['message_full_price_commissions'];
 
    var video_price_commissions =   req.body['video_price_commissions'];
    var video_part_price_commissions = req.body['video_part_price_commissions']; 
    var video_full_price_commissions  = req.body['video_full_price_commissions'];
 

    var inperson_price_commissions =   req.body['inperson_price_commissions'];
    var inperson_part_price_commissions = req.body['inperson_part_price_commissions']; 
    var inperson_full_price_commissions  = req.body['inperson_full_price_commissions'];
   

    var sql2 = "delete from specialist_public_consultations where specialist_id='"+specialist_id+"' ";
   console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
         var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        };  
       }  


       // inner code of delete 


       if(message==1){
        message = 1;  
        var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+message+"' ,'"+message_price+"','"+message_price_commissions+"' );";
        pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  // end of update query   
    }


    if(messagePart==1){
      messagePart = 2;  
      var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+messagePart+"' ,'"+message_part_price+"','"+message_part_price_commissions+"' );";
      pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
     });  // end of update query   
  }


    if(messageFull==1){
      messageFull = 3;  
      var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+messageFull+"' ,'"+message_full_price+"','"+message_full_price_commissions+"' );";
      pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
     });  // end of update query   
  }
  


  if(video==1 || video==2){

    if(video==1)
     var Myvideo = 4;

   if(video==2)
     var Myvideo = 7;
   
    var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+Myvideo+"' ,'"+video_price+"','"+video_price_commissions+"' );";
   console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
       }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }  
   });  // end of update query   
}


if(videoPart==1 || videoPart==2){

  if(videoPart==1)
   var Myvideo = 5;

 if(videoPart==2)
   var Myvideo = 8;
 
  var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+Myvideo+"' ,'"+video_part_price+"','"+video_part_price_commissions+"' );";
  pool.query(sql2, async function (err2, result2, fields) {
    if(err2)
    { 
      console.log(err2); 
     var data = {
         Status: false, 
         Message: 'Something wroing in query.',
         Error:err2
     }; 
      //var logStatus = 0;
      //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
      res.end(JSON.stringify(data));
      return false;
     }  
 });  // end of update query   
}


if(videoFull==1 || videoFull==2){

  if(videoFull==1)
   var Myvideo = 6;

 if(videoFull==2)
   var Myvideo = 9;
 
  var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+Myvideo+"' ,'"+video_full_price+"','"+video_full_price_commissions+"' );";
  pool.query(sql2, async function (err2, result2, fields) {
    if(err2)
    { 
      console.log(err2); 
     var data = {
         Status: false, 
         Message: 'Something wroing in query.',
         Error:err2
     }; 
      //var logStatus = 0;
      //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
      res.end(JSON.stringify(data));
      return false;
     }  
 });  // end of update query   
}
 



if(inperson==1){
    inperson = 10;  
  var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+inperson+"' ,'"+inperson_price+"','"+inperson_price_commissions+"' );";
  pool.query(sql2, async function (err2, result2, fields) {
    if(err2)
    { 
      console.log(err2); 
     var data = {
         Status: false, 
         Message: 'Something wroing in query.',
         Error:err2
     }; 
      //var logStatus = 0;
      //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
      res.end(JSON.stringify(data));
      return false;
     }  
 });  // end of update query   
}



if(inpersonPart==1){
  inpersonPart = 11;  
var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+inpersonPart+"' ,'"+inperson_part_price+"','"+inperson_part_price_commissions+"' );";
console.log(sql2);
pool.query(sql2, async function (err2, result2, fields) {
  if(err2)
  { 
    console.log(err2); 
   var data = {
       Status: false, 
       Message: 'Something wroing in query.',
       Error:err2
   }; 
    //var logStatus = 0;
    //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
    res.end(JSON.stringify(data));
    return false;
   }  
});  // end of update query   
}


if(inpersonFull==1){
  inpersonFull =12;  
var sql2 = "insert into specialist_public_consultations (specialist_id , provided_type , private_price, public_price) values ('"+specialist_id+"' , '"+inpersonFull+"' ,'"+inperson_full_price+"','"+inperson_full_price_commissions+"' );";
pool.query(sql2, async function (err2, result2, fields) {
  if(err2)
  { 
    console.log(err2); 
   var data = {
       Status: false, 
       Message: 'Something wroing in query.',
       Error:err2
   }; 
    //var logStatus = 0;
    //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
    res.end(JSON.stringify(data));
    return false;
   }  
});  // end of update query   
}

     var data = {
      Status: true, 
      Message:'Done' 
  };   
  var logStatus = 1;
  res.end(JSON.stringify(data));  


       // Inner code of delete end 



     });  // end of update query    

  });




  

router.post('/UpdateCalendarEvents' , async function (req, res, next) {
    var title =   req.body['title'];
  //  var start = req.body['start']; 
  //  var start = new moment(req.body['start'], "YYYY-MM-DDTHH:mm").utc();
//  var start = moment(req.body['start']).format('YYYY-MM-DD HH:mm:ss').utc();
   //  var start =   moment.utc(req.body['start']).format('YYYY-MM-DD HH:mm:ss');
    var specialist_id = req.body['specialist_id']; 
    
        var timezone = await globalVar.data.GetSpecialistTimeZoneById(specialist_id);
        console.log(timezone);
        
       //  var a = moment.tz("2022-01-05 20:43", "Asia/Kolkata");
         
      var tempStartDateTime = moment.tz(req.body['start'], timezone); 
      console.log('UTC Format:'+tempStartDateTime);  
      var start =  tempStartDateTime.utc().format(); // 2013-11-18T03:55Z  
     

   
    var filtered = title.filter(function (el) {
      return el != null;
    });
 
   
    filtered.forEach((legned) => 
    {
      const checkedLegend = legned.split('_'); 
      var sql2 = "insert into events (title,event_date,specialist_id,legend_id) values ('"+legned+"' ,'"+start+"' ,'"+specialist_id+"', '"+checkedLegend[0]+"')";
      pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
       } 

      });

    });
     
         var data = {
           Status: true, 
           Message:'Done' 
       };   
       var logStatus = 1;
       res.end(JSON.stringify(data));  
       
  });
  
  
  
  
  
 router.get('/GetCalendarEventsTimezoneWise', async function (req, res) { 
  var  apiName  = 'GetCalendarEventsTimezoneWise';  
  var specialist_id =  req.query.specialist_id; 
  var legend_id =  req.query.legend;
  var user_id =  req.query.user_id; 
  console.log(legend_id);

  var timezone ='';
  if(user_id!=0){
    timezone = await globalVar.data.GetUserTimeZoneById(user_id);
  } else {
    timezone = await globalVar.data.GetSpecialistTimeZoneById(specialist_id);
  }
  console.log('timezone:---->');
   console.log(timezone);
  
  if(legend_id)
  var sql2 = "SELECT id,title, event_date as start FROM events where legend_id='"+legend_id+"' and  specialist_id="+specialist_id +' and DATE(event_date)>=CURDATE() and booking_status=1';
   else  
  var sql2 = "SELECT id,title, event_date as start FROM events where specialist_id="+specialist_id +' and DATE(event_date)>=CURDATE() and booking_status=1';
 
  console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
       var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
       }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }
     var myJSON2 = JSON.stringify(result2);
     var memberArray2 = JSON.parse(myJSON2);  

     if(memberArray2.length){ 
      var EventsData = [];
      memberArray2.forEach(element => {  
          
          console.log('i am here');
      
        if(timezone!=''){  
            
            console.log(element['start']);
            
            console.log(timezone);
          var YourTimeZone = moment.utc(element['start']).tz(timezone); 
          console.log(YourTimeZone);
          
          var stringDatetime = moment(YourTimeZone).format('YYYY-MM-DD HH:mm:ss');
             console.log(stringDatetime);
      } else {
              console.log('i am not found');
         var stringDatetime = element['start'];
      }

        EventsData.push({
          id:element['id'],
          title:element['title'],
          start: stringDatetime,
          timezone:stringDatetime
        })
      }); 

       res.end(JSON.stringify(EventsData)); 
     } else {
       memberArray2 = [{}];
       res.end(JSON.stringify(memberArray2)); 
     }
   }); 
}); 
 


  router.post('/updatePublicExtra' , async function (req, res, next) {
  
    var specialist_id =   req.body['specialist_id'];
    var public_intro_id = req.body['public_intro_id'];
    var holistic_center =req.body['holistic_center'];
    var holistic_location  = req.body['holistic_location'];
    var workingtime =  req.body['workingtime']; 
   // var language_id =  req.body['language_id'];  
   
     var daystring =   req.body['daystring']; 
    var startstring =   req.body['startstring']; 
    var endstring =   req.body['endstring']; 
   
       var city_id =   req.body['city_id']; 
    var country_id =   req.body['country_id']; 
    var timezone =   req.body['timezone']; 
    
    

    var language_code = req.body['language_id'];   
       console.log(language_code);
    var setting_lanaguage_id =   req.body['setting_lanaguage_id'];   
    var language_id = '';
    if(setting_lanaguage_id!=null){
      language_id = setting_lanaguage_id;
    } else { 
         console.log(language_code);
      language_id = await globalVar.data.getLanguageIdByCode(language_code);
    }
    
       console.log('update profile extra');  console.log(req.body);


    console.log(language_id);
    
     var workingString = '';
    if(daystring.length){
      daystring.forEach((days, index) => { 
         workingString += days+'-'+startstring[index]+'-'+endstring[index] + '||'; 
      });

      workingtime = workingString;
    }


     await globalVar.data.updateSpecilistTimezoneandCountry(timezone,city_id,country_id,specialist_id);

     
    if(public_intro_id==0){ 
      
      var sql2 = "insert into specialist_public_intros ( specialist_id,language_id,holistic_center, holistic_location , working_time) values ('"+specialist_id+"','"+language_id+"','"+holistic_center+"' ,'"+holistic_location+"','"+workingtime+"') ";
      
      console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
            };  
           res.end(JSON.stringify(data));
           return false;
         }  
  
         var myJSON = JSON.stringify(result2);
         var Result = JSON.parse(myJSON);
         var public_intro_id  = Result.insertId; 
          await globalVar.data.SpecialistExtraWorking(specialist_id,daystring,startstring,endstring,language_id);
         var data = {
          Status: true, 
          Message:'Done' ,
          PublicIntroId:public_intro_id
  
      };   
      var logStatus = 1;
      res.end(JSON.stringify(data));  
  
        });
  
      } else { 

    var sql2 = "update specialist_public_intros set holistic_center='"+holistic_center+"' , holistic_location ='"+holistic_location+"', working_time='"+workingtime+"' where id="+public_intro_id;
    console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         } 
        await globalVar.data.SpecialistExtraWorking(specialist_id,daystring,startstring,endstring,language_id);
         var data = {
           Status: true, 
           Message:'Done' ,
           PublicIntroId:public_intro_id
       };   
       var logStatus = 1;
       res.end(JSON.stringify(data));  
     });  // end of update query   
    }
  });

 
 

  router.post('/updatePrivateSetting' ,   upload.fields([{
    name: 'idback', maxCount: 1
  }, {
    name: 'idfront', maxCount: 1
  }, {
    name: 'medicaldegree', maxCount: 1
  }, {
    name: 'universitydegree', maxCount: 1
  }, {
    name: 'additionaldegree', maxCount: 1
  }]),  function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    // console.log(req.files['idfront'][0]['filename']);
    // console.log(req.files['idback'][0]['filename']);
    console.log(req.body);
    //console.log(req.body['name']);  
    // req.body['surname'] 
    var specialist_id =   req.body['specialist_id'];
    var std_code = req.body['stdcode'];
    var mobile =req.body['mobile'];
    var country  = req.body['country'];
    var place_birth =  req.body['placeofbirth'];
    var other = req.body['other'];    
    var dob =  req.body['dob']; 

    var healthcare = req.body['healthcare'];    
    var university =  req.body['university']; 
    var language_id =  req.body['language']; 
    if(dob)
    dob = moment(dob).format('YYYY-MM-DD');
    else 
    dob  = null 


    if(req.files['additionaldegree']){  
      var sql2 = "update specialist_private set other_documents='"+req.files['additionaldegree'][0]['filename']+"' where id="+specialist_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
  }


    if(req.files['idback']){  
        var sql2 = "update specialist_private set id_document_back='"+req.files['idback'][0]['filename']+"' where id="+specialist_id;
      //  console.log(sql2);
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         });  
    }

    if(req.files['medicaldegree']){  
      var sql2 = "update specialist_private set healthcare_documents='"+req.files['medicaldegree'][0]['filename']+"' where id="+specialist_id;
    //  console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
       });  
  }

  if(req.files['universitydegree']){  
    var sql2 = "update specialist_private set university_documents='"+req.files['universitydegree'][0]['filename']+"' where id="+specialist_id;
  //  console.log(sql2);
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
     });  
}


    if(req.files['idfront']){ 

console.log(req.files['idfront']);
     // const { filename: image } = req.files['idfront']; 
      // await sharp(req.file.path)
      //  .resize(200, 200)
      //  .jpeg({ quality: 90 })
      //  .toFile(
      //      path.resolve(req.file.destination,'resized',image)
      //  )
      //  fs.unlinkSync(req.file.path);

       


        var sql2 = "update specialist_private set id_document_front='"+req.files['idfront'][0]['filename']+"' where id="+specialist_id;
        pool.query(sql2, async function (err2, result2, fields) {
            if(err2)
            { 
              console.log(err2); 
             var data = {
                 Status: false, 
                 Message: 'Something wroing in query.',
                 Error:err2
             }; 
              //var logStatus = 0;
              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
              res.end(JSON.stringify(data));
              return false;
             }  
         });  
    }
   


    if(dob)
    var sql2 = "update specialist_private set main_consult_language='"+language_id+"', std_code='"+std_code+"' , mobile ='"+mobile+"', country_id='"+country+"', place_birth='"+place_birth+"',dob='"+dob+"',other_text ='"+other+"' , healthcare_university_degree='"+healthcare+"' ,university_degree='"+university+"'   where id="+specialist_id;
    else 
    var sql2 = "update specialist_private set main_consult_language='"+language_id+"', std_code='"+std_code+"' , mobile ='"+mobile+"', country_id='"+country+"', place_birth='"+place_birth+"',dob= null ,other_text ='"+other+"' , healthcare_university_degree='"+healthcare+"' ,university_degree='"+university+"'  where id="+specialist_id;
    
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         } 
     
         var data = {
           Status: true, 
           Message:'Done' 
       };   
       var logStatus = 1;
       res.end(JSON.stringify(data));  
     }); 
  });

  

  

  router.post('/updatePublicDegreeImageById' ,   upload.fields([{
    name: 'documentfile', maxCount: 10
  } ]),  async function (req, res, next) {
       console.log(req.body);
       console.log(req.files);
       var degree_id =   req.body['degree_id']; 
 

         if(req.files['documentfile']){ 
      var sql2 = "update specialist_degrees set document_file='"+req.files['documentfile'][0]['filename']+"' where id="+degree_id;
       console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
          if(err2)
          { 
            console.log(err2); 
           var data = {
               Status: false, 
               Message: 'Something wroing in query.',
               Error:err2
           }; 
            //var logStatus = 0;
            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
            res.end(JSON.stringify(data));
            return false;
           }  
         });  
       }  // end of if   

       var data = {
        Status: true, 
        Message:'Done'  
    };   
    var logStatus = 1;
    res.end(JSON.stringify(data));  

  });



  router.get('/deletePublicDegreeById', function (req, res) { 
    var  apiName  = 'deletePublicDegreeById'; 
    console.log(req);

    var degree_id = req.query.degree_id; 
    var sql2 = "delete from  specialist_degrees where id="+degree_id;
    console.log(sql2);
     pool.query(sql2, async function (err2, result2, fields) {
                if(err2)
                { 
                  console.log(err2); 
                 var data = {
                     Status: false, 
                     Message: 'Something wroing in query.',
                     Error:err2
                 }; 
                  //var logStatus = 0;
                  //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                  res.end(JSON.stringify(data));
                  return false;
                 } 
             
                 var data = {
                   Status: true, 
                   Message:'Done' 
               };   
               var logStatus = 1;
               res.end(JSON.stringify(data));  
             });   
    });

 

  router.post('/updatePublicDegree' ,   upload.fields([{
    name: 'documentfile', maxCount: 10
  } ]),  async function (req, res, next) {
       console.log(req.body);
       console.log(req.files);
    var specialist_id =   req.body['specialist_id']; 
    var public_degree_id =   req.body['public_degree_id'];
    var title = req.body['title'];
    var institute =req.body['institute'];
    var year  = req.body['year'];
    var details =  req.body['details'];
    var otherinformation = req.body['otherinformation'];
    
    var language_code = req.body['language_id'];   
    var setting_lanaguage_id =   req.body['setting_lanaguage_id'];   
    var language_id = '';
    if(setting_lanaguage_id!='null'){
      language_id = setting_lanaguage_id;
    } else {
      console.log('else condition');
      language_id = await globalVar.data.getLanguageIdByCode(language_code);
    }

    var imageIndex =0;

    console.log(language_id);
 public_degree_id.forEach((publicdegreeid, index) => { 
    if(publicdegreeid!=0){  
     // title.forEach((titleValue, index) => {
      var sql2 = "update specialist_degrees set specialist_id='"+specialist_id+"' , degree_title = '"+title[index]+"' , institute ='"+institute[index]+"' , year ='"+year[index]+"' , details = '"+details[index]+"', other_information = '"+otherinformation[index]+"' where id="+publicdegreeid;
      console.log(sql2);
      pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  
        
     }); 

    //  if(req.files['documentfile']){ 
    //   var sql2 = "update specialist_degrees set document_file='"+req.files['documentfile'][index]['filename']+"' where id="+publicdegreeid;
    // //  console.log(sql2);
    //   pool.query(sql2, async function (err2, result2, fields) {
    //       if(err2)
    //       { 
    //         console.log(err2); 
    //        var data = {
    //            Status: false, 
    //            Message: 'Something wroing in query.',
    //            Error:err2
    //        }; 
    //         //var logStatus = 0;
    //         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
    //         res.end(JSON.stringify(data));
    //         return false;
    //        }  
    //      });  
    //    }  // end of if  
     // })// 2 for loop end  
    } else { 
      //title.forEach((titleValue, index) => { 
        var sql2 = "insert into specialist_degrees (specialist_id, degree_title, institute , year, details , other_information,language_id ) values('"+specialist_id+"', '"+title[index]+"','"+institute[index]+"','"+year[index]+"','"+details[index]+"','"+otherinformation[index]+"','"+language_id+"');";
        console.log(sql2); 
       pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         }  

         var myJSON = JSON.stringify(result2);
         var Result = JSON.parse(myJSON);
         var public_degree_id  = Result.insertId;  

         if(req.files['documentfile']){  
          var sql2 = "update specialist_degrees set document_file='"+req.files['documentfile'][imageIndex]['filename']+"' where id="+public_degree_id;
            console.log(sql2);
          pool.query(sql2, async function (err2, result2, fields) {
              if(err2)
              { 
                console.log(err2); 
               var data = {
                   Status: false, 
                   Message: 'Something wroing in query.',
                   Error:err2
               }; 
                //var logStatus = 0;
                //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                res.end(JSON.stringify(data));
                return false;
               }  
             });  
             imageIndex++;
          }  
       });  
    // }); // end of foreach 

    }     // end of main else  
   }); // main for loop 

   var data = {
    Status: true, 
    Message:'Done' ,
    Publicdegreeid:public_degree_id
};   
var logStatus = 1;
res.end(JSON.stringify(data));  

 });

  

  router.get('/GetFeaturedSpecialist',  async  function (req, res) { 
    var  apiName  = 'GetFeaturedSpecialist'; 
    var language_code = req.query.language_id;


    var language_id = await globalVar.data.getLanguageIdByCode(language_code);

  
    var sql2 = "SELECT specialist_private.healthcare_university_degree , specialist_private.id as specialist_private_id,specialist_public_intros.id as intro_id,specialist_public_intros.your_title ,  specialist_public_intros.profile_photo, specialist_public_intros.working_time, specialist_private.first_name , countries.country_name, cities.city_name, GROUP_CONCAT(specialist_public_consultations.provided_type) AS GROUPOFTYPE  FROM `specialist_public_intros`  LEFT JOIN specialist_private  on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id)  LEFT JOIN specialist_public_consultations  on (specialist_public_consultations.specialist_id=specialist_private.id) LEFT JOIN cities  ON (cities.id=specialist_public_intros.city_id)  where specialist_private.mark_featured_spec=1 and specialist_private.status=6 and specialist_public_consultations.specialist_id!=0 and specialist_public_intros.language_id="+language_id+"  group by specialist_private.id order by featured_order ASC  LIMIT 0,10";
    console.log(sql2);
    console.log(sql2);
    pool.query(sql2,  async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
           var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
           }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        
          console.log('memberArray2 start');
           console.log(memberArray2);
           
        SepcialistFeatured=[];
        if(memberArray2.length){    
            for(var i =0 ;i<memberArray2.length;i++) 
            {  

              var HolesticArray =   await globalVar.data.GetSpecialistHolestic(memberArray2[i].intro_id); 
              var PriceArray =   await globalVar.data.GetSpecialistPrice(memberArray2[i].specialist_private_id); 
              var RatingData =   await globalVar.data.GetSpecialistRatingCountAvg(memberArray2[i].specialist_private_id); 

              princestring = '';
              if(PriceArray[0]['HighestPrice']!=null){
                princestring = '$'+PriceArray[0]['LowPrice']+'-$'+PriceArray[0]['HighestPrice']
              } 

              var GroupType =  memberArray2[i].GROUPOFTYPE;
 
 
                  var messageValue  = 0;
              if(GroupType!=null){
                var MyArray = GroupType.split(',');  
                console.log(MyArray);
                 const  found = MyArray.find(element => element ==1);
                console.log('pos');
                console.log(found);
                
                  if(found){
                    messageValue = 1
                 }
 
 
              }
              
              

        
            
              console.log(messageValue);
              var ProfileImage='';
              console.log('its mee');
              console.log(memberArray2[i].profile_photo);

              if(memberArray2[i].profile_photo!=null)
              ProfileImage=process.env.APIURL+"/public/uploads/docs/profileresize/"+memberArray2[i].profile_photo;
              else
              ProfileImage='assets/img/doctors/doctor-thumb-02.jpg';

              var workingTime ='';
              if(memberArray2[i].working_time!=null)
              workingTime = memberArray2[i].working_time.slice(0,10);
              else 
              workingTime = '';
              
            var HolesticArrayString =''; 
              if(HolesticArray!=null)
              HolesticArrayString = HolesticArray.slice(0,20);
              else 
              HolesticArrayString = '';



               SepcialistFeatured.push({ 
                SpecialistPublicIntroId:memberArray2[i].intro_id,
                SpecialistPublicPrivateID:memberArray2[i].specialist_private_id,
                SpecialistName:memberArray2[i].first_name,
                SpecialistPic:ProfileImage,
                SpecialistTitle:memberArray2[i].your_title, 
                SpecialistHolestic: HolesticArrayString, 
                SpecialistPrice:princestring,
                SpecialistCountry:memberArray2[i].country_name,
                SpecialistCity:memberArray2[i].city_name,
                SpecialistWorkingTime:workingTime,
                SpecialistHealthCare:memberArray2[i].healthcare_university_degree,
                MessageValue:messageValue, 
                SpecilistRatingCount : RatingData.Count,
                SpecilistRatingAvg : RatingData.Avg,
                SpecilistRatingAvgPer : RatingData.AvgPer,
            })
         }

         // console.log(SepcialistFeatured);
          var data = {
            Status: true, 
            Result: SepcialistFeatured 
          };  
          res.end(JSON.stringify(data)); 
        }
      }); 
}); 
 
 
router.get('/GetSpecialistWorkingTimeByID',   async function (req, res) { 
  var  apiName  = 'GetSpecialistWorkingTimeByID';  
  var specialist_id =  req.query.specialist_id;  
  var language_code =  req.query.language_id;
  
  console.log(req.query);
    var seetingLanguage =  req.query.seetingLanguage;
  if(seetingLanguage!='null'){
    var language_id = seetingLanguage ; //await globalVar.data.getLanguageIdByCode(language_code); 
  } else {
    var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  }
  //var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
 // var specialist_public_intro_id = await globalVar.data.getSpecialistIntroID(specialist_id,language_id); 
 // var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  var sql2 = "SELECT start_time,end_time,days ,id  from  specialist_working_hours  where  specialist_id ='"+specialist_id+"' and language_id="+language_id;
  console.log(sql2);
  pool.query(sql2, async  function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
     // var GetAllHolistic = await globalVar.data.GetAllHolistic(language_id);
       if(memberArray2.length){  
        var data = {
          Status: true, 
          WorkingData: memberArray2 
        }; 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(data)); 
       } else{
        var data = {
          Status: false, 
          WorkingData: [] 
        }; 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(data)); 
       }
    }); 
}); 


router.get('/GetFeaturedSpecialistFullDetails',async function (req, res) { 
  var  apiName  = 'GetFeaturedSpecialistFullDetails';  
  var specialist_id =  req.query.specialist_id; 
  var language_code = req.query.language_id; 
  console.log('language_code-GetFeaturedSpecialistFullDetails');
  console.log(language_code);
  var language_id = await globalVar.data.getLanguageIdByCode(language_code);

//  var sql2 = "SELECT specialist_private.healthcare_university_degree , specialist_private.id as specialist_private_id,specialist_public_intros.id as intro_id,specialist_public_intros.your_title ,specialist_public_intros.your_studies,  specialist_public_intros.profile_photo, specialist_public_intros.working_time, specialist_private.first_name ,specialist_private.last_name , countries.country_name, cities.city_name , specialist_public_intros.work_experience , specialist_public_intros.activity_image1, specialist_public_intros.activity_image2, specialist_public_intros.activity_image3, specialist_public_intros.activity_image4 , specialist_public_intros.consultation_description_message , specialist_public_intros.consultation_description_message_part , specialist_public_intros.about_me,  specialist_public_intros.holistic_expertise , specialist_public_intros.education , specialist_public_intros.work_experience_detail ,specialist_public_intros.presentation_video_url1,specialist_public_intros.presentation_video_url2,specialist_public_intros.available_languages,specialist_public_intros.other_contribution,specialist_public_intros.comments,specialist_public_intros.mission ,specialist_public_intros.holistic_center,specialist_public_intros.holistic_location  FROM `specialist_public_intros`   LEFT JOIN specialist_private  on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id) LEFT JOIN cities  ON (cities.id=specialist_public_intros.city_id)  where specialist_public_intros.language_id='"+language_id+"' and specialist_private.id='"+specialist_id+"'";
  var sql2 = "SELECT  specialist_private.timezone ,specialist_private.utc_offset_string ,specialist_public_intros.working_time, specialist_private.healthcare_university_degree , specialist_private.id as specialist_private_id,specialist_public_intros.id as intro_id,specialist_public_intros.your_title ,specialist_public_intros.your_studies,  specialist_public_intros.profile_photo, specialist_public_intros.working_time, specialist_private.first_name ,specialist_private.last_name , countries.country_name, cities.city_name , specialist_public_intros.work_experience , specialist_public_intros.activity_image1, specialist_public_intros.activity_image2, specialist_public_intros.activity_image3, specialist_public_intros.activity_image4 , specialist_public_intros.consultation_description_message , specialist_public_intros.consultation_description_message_part , specialist_public_intros.about_me,  specialist_public_intros.holistic_expertise , specialist_public_intros.education , specialist_public_intros.work_experience_detail ,specialist_public_intros.presentation_video_url1,specialist_public_intros.presentation_video_url2,specialist_public_intros.available_languages,specialist_public_intros.other_contribution,specialist_public_intros.comments,specialist_public_intros.mission ,specialist_public_intros.holistic_center,specialist_public_intros.holistic_location  FROM `specialist_public_intros` LEFT JOIN specialist_private  on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id) LEFT JOIN cities  ON (cities.id=specialist_public_intros.city_id)   where specialist_public_intros.language_id='"+language_id+"' and specialist_private.id='"+specialist_id+"'";
  console.log(sql2);
  console.log(sql2);
  pool.query(sql2,  async function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      SepcialistFeatured=[];
      if(memberArray2.length){    
          for(var i =0 ;i<memberArray2.length;i++) 
          {   
            var HolesticArray =   await globalVar.data.GetSpecialistHolestic(memberArray2[i].intro_id); 
             var Tags =   await globalVar.data.GetSpecialistTags(memberArray2[i].intro_id); 
           var RatingData =   await globalVar.data.GetSpecialistRatingCountAvg(memberArray2[i].specialist_private_id); 
            


             if(memberArray2[i].activity_image1)
            var SpecialistActivityImg1 = process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].activity_image1
              else 
              var SpecialistActivityImg1 = null ;

            if(memberArray2[i].activity_image2)
            var SpecialistActivityImg2 = process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].activity_image2
            else
              var SpecialistActivityImg2 = null

           
            if(memberArray2[i].activity_image3)
           var  SpecialistActivityImg3 = process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].activity_image3
            else 
            var  SpecialistActivityImg3 = null;
           
           if(memberArray2[i].activity_image4) 
           var SpecialistActivityImg4 = process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].activity_image4
             else  
          var  SpecialistActivityImg4 = null


          if(memberArray2[i].profile_photo!=null)
          ProfileImage=process.env.APIURL+"/public/uploads/docs/profileresize/"+memberArray2[i].profile_photo;
          else
          ProfileImage='/assets/img/doctors/doctor-thumb-02.jpg';
          
          
                  var workingtime = '';
          if(memberArray2[i].working_time)
            workingtime = memberArray2[i].working_time.substring(0,10)



             SepcialistFeatured.push({ 
              SpecialistPublicIntroId:memberArray2[i].intro_id,
              SpecialistPublicPrivateID:memberArray2[i].specialist_private_id,
              SpecialistName:memberArray2[i].first_name + ' ' +memberArray2[i].last_name,
              SpecialistPic:ProfileImage,
              SpecialistTitle:memberArray2[i].your_title, 
              SpecialistHolestic: HolesticArray,  
              SpecialistCountry:memberArray2[i].country_name,
              SpecialistCity:memberArray2[i].city_name,
              SpecialistWorkingTime:workingtime,
              SpecialistWorkingExperience:memberArray2[i].work_experience,
              SpecialistActivityImg1:SpecialistActivityImg1,
              SpecialistActivityImg2:SpecialistActivityImg2,
              SpecialistActivityImg3:SpecialistActivityImg3,
              SpecialistActivityImg4:SpecialistActivityImg4,
              SpecialistMessage:memberArray2[i].consultation_description_message,
              SpecialistMessagePart:memberArray2[i].consultation_description_message_part,
              SpecialistAbout:memberArray2[i].about_me,
              SpecialistStudy:memberArray2[i].your_studies,
              SpecialistHolesticExp:memberArray2[i].holistic_expertise,
              SpecialistEducation:memberArray2[i].education,
              SpecialistWorkingExperienceDetails:memberArray2[i].work_experience_detail,
              SpecialistVedioUrl1:memberArray2[i].presentation_video_url1,
              SpecialistVedioUrl2:memberArray2[i].presentation_video_url2,
              SpecialistAvaLanguage:memberArray2[i].available_languages,
              SpecialistOtherContribution:memberArray2[i].other_contribution,
              SpecialistOtherComments:memberArray2[i].comments ,
              SpecialistMission:memberArray2[i].mission ,
              SpecialistOtherTags:Tags  ,
              Holisticcenter:memberArray2[i].holistic_center ,
              Holisticlocation:memberArray2[i].holistic_location ,
              SpecialistHealthCare:memberArray2[i].healthcare_university_degree, 
               SpecialistTimezone:memberArray2[i].timezone, 
              SpecialistOffsetString:memberArray2[i].utc_offset_string, 
              SpecialistWorkingTime:memberArray2[i].working_time,  
              SpecilistRatingCount : RatingData.Count,
              SpecilistRatingAvg : RatingData.Avg,
              SpecilistRatingAvgPer : RatingData.AvgPer,

          })
       }

       // console.log(SepcialistFeatured);
        var data = {
          Status: true, 
          Result: SepcialistFeatured 
        };  
        res.end(JSON.stringify(data)); 
      }
    }); 
}); 


router.get('/GetSpecialistDegreeByID', async  function (req, res) { 
  var  apiName  = 'GetSpecialistDegreeByID';  
  var specialist_public_intro_id =  req.query.specialist_id;
  
    var language_code = req.query.language_id; 
  console.log('language_code');
  console.log(language_code);
  var language_id = await globalVar.data.getLanguageIdByCode(language_code);
  
  var sql2 = "SELECT degree_title, institute , year ,details , other_information , document_file from  specialist_degrees  where specialist_id="+specialist_public_intro_id+' and language_id='+language_id;
  console.log(sql2);
  pool.query(sql2,   function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        } 
      var SepcialistFeatured = [];
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      if(memberArray2.length){   
        for(var i =0 ;i<memberArray2.length;i++) 
        {   

          var doc = memberArray2[i].document_file;
          if(doc)
          doc = process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].document_file;
          else 
          doc = null ;

        SepcialistFeatured.push({ 
          SpecialistDegreeTitle:memberArray2[i].degree_title,
          SpecialistInstitute:memberArray2[i].institute,
          Year:memberArray2[i].year,
          Details:memberArray2[i].details,
          OtherInformation:memberArray2[i].other_information,
          DocFile:doc
        });  
      }

        

        var data = {
          Status: true, 
          Result: SepcialistFeatured 
        }; 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(data)); 
      }
    }); 
}); 
 

router.get('/GetSpecialistHolisticByID',   async function (req, res) { 
  var  apiName  = 'GetSpecialistHolisticByID';  

var specialist_id =  req.query.specialist_id;  
  var language_code =  req.query.language_id;
 console.log('language_code------>holistic');
  console.log(req.query);
    var seetingLanguage =  req.query.seetingLanguage;
  if(seetingLanguage!='null'){
    var language_id = seetingLanguage ; //await globalVar.data.getLanguageIdByCode(language_code); 
  } else {
    var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  }
  //var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  var specialist_public_intro_id = await globalVar.data.getSpecialistIntroID(specialist_id,language_id); 
 // var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  var sql2 = "SELECT holistic_name from  specialist_holistics  where specialist_public_intro_id="+specialist_public_intro_id;
  console.log(sql2);
  pool.query(sql2, async  function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      var GetAllHolistic = await globalVar.data.GetAllHolistic(language_id);
     // if(memberArray2.length){  
        var data = {
          Status: true, 
          SelectedResult: memberArray2 ,
          GetAllHolistic:GetAllHolistic
        }; 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(data)); 
      //}
    }); 
}); 

router.get('/GetSpecialistTagsByID',   async function (req, res) { 
  var  apiName  = 'GetSpecialistTagsByID';  
 var specialist_id =  req.query.specialist_id;  
  var language_code =  req.query.language_id;
 console.log('language_code------>');
  console.log(req.query);
    var seetingLanguage =  req.query.seetingLanguage;
  if(seetingLanguage!='null'){
    var language_id = seetingLanguage ; //await globalVar.data.getLanguageIdByCode(language_code); 
  } else {
    var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  }
  //var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  var specialist_public_intro_id = await globalVar.data.getSpecialistIntroID(specialist_id,language_id); 
 // var language_id = await globalVar.data.getLanguageIdByCode(language_code); 
  var sql2 = "SELECT tags from  specialist_tags  where specialist_public_intro_id="+specialist_public_intro_id;
  console.log(sql2);
  pool.query(sql2, async  function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
         }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      var GetAllTags = await globalVar.data.GetAllTags(language_id);
     // if(memberArray2.length){  
        var data = {
          Status: true, 
          SelectedResult: memberArray2 ,
          GetAllTags:GetAllTags
        }; 
        // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
        res.end(JSON.stringify(data)); 
      //}
    }); 
}); 

router.post('/addReply', function (req, res) { 
  var  apiName  = 'addReply';   
  var review_id = req.body.review_id;
  var specialist_id = req.body.specialist_id;
  var reply_desc = req.body.reply_desc; 
  var u_email = req.body.u_email; 
 //connect to the database
  //var sql2="select * from replies where user_id="+user_id+" and specialist_id="+specialist_id;

  var sql3 = "insert into replies(review_id,specialist_id,reply_desc) value ('"+review_id+"','"+specialist_id+"','"+reply_desc+"')";
    console.log('review query');
    console.log(sql3);

  //var sql4 = "update replies set review_desc='"+review_desc+"',review_star="+review_star+",recommend_status="+recommend_status+" where user_id="+user_id+" and specialist_id="+specialist_id;
    console.log('review query');
    //console.log(sql2);
       


    //return false;
    pool.query(sql3, function (err3, result, fields) {

     // console.log(result.length);

   if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }

    
 pool.query(sql3, function (err3, result, fields) {

 if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }
 var myJSON = JSON.stringify(result);

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
    //   auth: {
    //     user: 'cresoluser@gmail.com', // here use your real email
    //     pass: 'cresoluser@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
    //   }
      
        auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
          
    }); 

    var mailOptions = {
      from: 'nitesh@cresol.in',
      to: u_email,
      subject: 'Medaloha : Review Replied by Specialist',
      html: 'Dear user , Thanks for your review.'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response); 
      }

    }); 

      var Result = JSON.parse(myJSON); 
      var data = {
         Status: true, 
         Message: 'specialist User Reply Done' 
     };  
     res.end(JSON.stringify(data));   

 });

    
   

      
  });  
   
});


router.get('/getReply', function (req, res) { 
  console.log(req.query.specialist_id);
  var  apiName  = 'getReply';   
  var specialist_id = req.query.specialist_id;
  var sql2 = "SELECT * from replies where replies.specialist_id="+specialist_id+" group by replies.specialist_id";
  console.log(sql2);
pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
       console.log(err2); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
       res.end(JSON.stringify(data));
       return false;
      }


 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
      var data = {
         Status: true, 
         Message: 'ger replay Specialist Listing',
         Data: Result,
          Query:sql2
     };  
     res.end(JSON.stringify(data)); 


})

      
  }); 


router.get('/userSpecialistReviewListing', function (req, res) { 
  console.log(req.query.specialist_id);
  var  apiName  = 'userSpecialistReviewListing';   
  var specialist_id = req.query.specialist_id;
  var sql2 = "SELECT reviews.*,reviews.id as review_id,users.id as u_id,users.user_image as u_image,users.first_name as u_first_name,users.email as u_email,users.last_name as u_last_name,specialist_private.email AS semail,specialist_private.first_name,specialist_private.last_name,specialist_public_intros.profile_photo from reviews left join specialist_private on specialist_private.id=reviews.specialist_id left join specialist_public_intros on specialist_public_intros.specialist_id=reviews.specialist_id  left join users on users.id=reviews.user_id where reviews.specialist_id="+specialist_id+" group by reviews.user_id ";
  console.log(sql2);
pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
       console.log(err2); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
       res.end(JSON.stringify(data));
       return false;
      }


 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
      var data = {
         Status: true, 
         Message: 'User Review Specialist Listing',
         Data: Result,
          Query:sql2
     };  
     res.end(JSON.stringify(data)); 


})

      
  }); 



  router.get('/GetSpecialistPublicOverViewByID', async  function (req, res) { 
      var  apiName  = 'GetSpecialistPublicOverViewByID';  
      var specialist_id =  req.query.specialist_id;
      console.log(req.query);

      var language_code =  req.query.language_code;  // default 
      var seetingLanguage =  req.query.seetingLanguage;  //  choose under Action tabs 
      var language_id ='';

      console.log('seetingLanguage'); console.log(seetingLanguage);

      if(seetingLanguage!='null'){ 
            language_id = seetingLanguage;
       } else {  
        language_id = await globalVar.data.getLanguageIdByCode(language_code);
       }

      console.log(language_id);
      

      var sql2 = "SELECT specialist_private.timezone,specialist_private.utc_offset_string, specialist_public_intros.language_id,specialist_public_intros.id,specialist_public_intros.holistic_center,specialist_public_intros.holistic_location,specialist_public_intros.working_time, specialist_public_intros.consultation_description_message, specialist_public_intros.consultation_description_message_part , specialist_public_intros.about_me, specialist_public_intros.holistic_expertise, specialist_public_intros.education, work_experience, work_experience_detail, specialist_public_intros.presentation_video_url1, specialist_public_intros.presentation_video_url2, specialist_public_intros.available_languages, specialist_public_intros.other_contribution, specialist_public_intros.mission, specialist_public_intros.comments ,specialist_private.country_id,specialist_private.city_id , countries.country_name , cities.city_name from  specialist_public_intros left join  specialist_private  on (specialist_private.id=specialist_public_intros.specialist_id)  left join countries on (specialist_private.country_id=countries.id) left join cities on (specialist_private.city_id=cities.id)    where   specialist_public_intros.language_id = '"+language_id+"' and specialist_public_intros.specialist_id="+specialist_id;
      console.log(sql2);
      pool.query(sql2,   function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
            var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }
          var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
            res.end(JSON.stringify(memberArray2)); 
          }
        }); 
  }); 



  router.get('/GetLegendCommission', async  function (req, res) { 
    var  apiName  = 'GetLegendCommission';  
      
    var sql2 = "SELECT legends_type , commission_percentage from legends_commissions where status= 1";
     pool.query(sql2,   function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
         // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
          res.end(JSON.stringify(memberArray2)); 
        }
      }); 
}); 
  


router.get('/getConsultationsCount', async function (req, res) { 
  var  apiName  = 'getConsultationsCount';  
  var specialist_id =  req.query.specialist_id;
  var sql2 = "SELECT count(id) AS consultations_count from booking_histories where specialist_id="+specialist_id;
   pool.query(sql2, async function (err2, result2, fields) {
       if(err2)
       { 
         console.log(err2); 
        var data = {
            Status: false, 
            Message: 'Something wroing in query.',
            Error:err2
        };  
         res.end(JSON.stringify(data));
         return false;
        }
      var myJSON2 = JSON.stringify(result2);
      var memberArray2 = JSON.parse(myJSON2); 
      if(memberArray2.length){ 
        res.end(JSON.stringify(memberArray2[0]['consultations_count'])); 
      }
    }); 
}); 





// GetConfirmCondition
router.get('/GetConfirmCondition', async function (req, res) { 
  var  apiName  = 'GetConfirmCondition';  
  var specialist_id =  req.query.specialist_id; 
  var sql2 = "SELECT * FROM `events` where  DATE(event_date)>=CURDATE()  and specialist_id='"+specialist_id+"' and booking_status=1";
  
  pool.query(sql2, async function (err2, result2, fields) {
      if(err2)
      { 
        console.log(err2); 
        var data = {
           Status: false, 
           Message: 'Something wroing in query.',
           Error:err2
        }; 
        //var logStatus = 0;
        //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
        res.end(JSON.stringify(data));
        return false;
       }
     var myJSON2 = JSON.stringify(result2);
     var memberArray2 = JSON.parse(myJSON2); 
     console.log(memberArray2);
        var confirm = false;
     if(memberArray2.length){
      confirm = true;
     }   
     res.end(JSON.stringify(confirm)); 
   }); 
}); 



  router.get('/GetSpecialistConsultationByID', async function (req, res) { 
      var  apiName  = 'GetSpecialistConsultationByID';  
      var specialist_id =  req.query.specialist_id;
      var sql2 = "SELECT provided_type, private_price, public_price from specialist_public_consultations where  specialist_public_consultations.specialist_id="+specialist_id;
       pool.query(sql2, async function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
            var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }
          var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
            res.end(JSON.stringify(memberArray2)); 
          }
        }); 
  }); 



  router.get('/GetSpecialistPublicIntroByID', async function (req, res) { 
       var  apiName  = 'GetSpecialistPublicIntroByID';  

       console.log(req.query);
       
       var specialist_id =  req.query.specialist_id; 
       var language_code =  req.query.language_code;  // default 
       var seetingLanguage =  req.query.seetingLanguage;  //  choose under Action tabs 
       var language_id ='';

       console.log(seetingLanguage);

       if(seetingLanguage!='null'){
             language_id = seetingLanguage;
        } else {  
         language_id = await globalVar.data.getLanguageIdByCode(language_code);
        }

       console.log(language_id);

       var sql2 = "SELECT specialist_private.id,specialist_private.first_name, specialist_private.last_name,specialist_private.main_consult_language , specialist_public_intros.id AS Spcialist_id, specialist_public_intros.your_title,specialist_public_intros.your_studies,specialist_public_intros.work_experience,specialist_public_intros.country_id , specialist_public_intros.city_id, specialist_public_intros.profile_photo ,specialist_public_intros.activity_image1 ,specialist_public_intros.activity_image2,specialist_public_intros.activity_image3,specialist_public_intros.activity_image4 from specialist_private left join specialist_public_intros on (specialist_private.id=specialist_public_intros.specialist_id)  where specialist_public_intros.language_id = '"+language_id+"'  and  specialist_private.id="+specialist_id;
      console.log(sql2);
       pool.query(sql2, async function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
             var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
             }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }
          var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
            res.end(JSON.stringify(memberArray2)); 
          }
        }); 
  }); 



  router.get('/GetSpecialistPublicDegreeByID', async function (req, res) { 
    var  apiName  = 'GetSpecialistPublicDegreeByID';  
    var specialist_id =  req.query.specialist_id;

    var language_code =  req.query.language_code;  // default 
    var seetingLanguage =  req.query.seetingLanguage;  //  choose under Action tabs 
    var language_id ='';

    console.log(seetingLanguage);

    if(seetingLanguage!='null'){
          language_id = seetingLanguage;
     } else {  
      language_id = await globalVar.data.getLanguageIdByCode(language_code);
     }

    console.log(language_id);
    
       var sql2 = "SELECT id,  degree_title, institute , year, details , other_information , document_file	 from specialist_degrees   where specialist_degrees.specialist_id="+specialist_id+' and specialist_degrees.language_id='+language_id;
       pool.query(sql2, async function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
            var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }
          var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
            res.end(JSON.stringify(memberArray2)); 
          }
        });
  
   
  }); 


router.get('/GetSpecialistPrivateDetailsByID', async function (req, res) { 
    var  apiName  = 'GetSpecialistPrivateDetailsByID';  
    var specialist_id =  req.query.specialist_id;
    
       var sql2 = "SELECT specialist_private.id,specialist_private.first_name, specialist_private.last_name,specialist_private.email,specialist_private.country_id,specialist_private.place_birth,specialist_private.password ,specialist_private.mobile , specialist_private.dob , specialist_private.std_code , specialist_private.id_document_front, specialist_private.id_document_back,specialist_private.healthcare_university_degree , specialist_private.university_degree, specialist_private.other_text, specialist_private.healthcare_documents, specialist_private.university_documents, specialist_private.other_documents,specialist_private.account_holder , specialist_private.iban , specialist_private.bic ,specialist_private.main_consult_language  ,specialist_public_intros.profile_photo from specialist_private left join specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id) where specialist_private.id="+specialist_id;
       console.log(sql2);
       pool.query(sql2, async function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
            var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }
          var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
            res.end(JSON.stringify(memberArray2)); 
          }
        });
  
   
  }); 



router.post('/ChangePassword', function (req, res) { 
    var  apiName  = 'ChangePassword';    
    var currentpassword = req.body.currentpassword;
    var newpassword = req.body.newpassword; 
    var confirmpassword = req.body.confirmpassword;
   
      if(currentpassword==""){
        var data = {
            Status: false, 
            Message: 'current password is not blank.'
        };
  
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }  
  
     if(newpassword==""){
      var data = {
          Status: false, 
          Message: 'new password is not blank.'
      };
  
      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  

   if(confirmpassword==""){
    var data = {
        Status: false, 
        Message: 'confirm password is not blank.'
    }; 
    res.end(JSON.stringify(data));
    var logStatus = 0;
    //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
    }  
  
  
   var sql2 = "select id from specialist_private where  id ='"+req.body.specialist_id+"' and password=md5('"+currentpassword+"')";
       pool.query(sql2, async function (err2, result2, fields) {
           if(err2)
           { 
             console.log(err2); 
            var data = {
                Status: false, 
                Message: 'Something wroing in query.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
            }

           var myJSON2 = JSON.stringify(result2);
          var memberArray2 = JSON.parse(myJSON2); 
          if(memberArray2.length){ 


            var sql2 = "update specialist_private set password =md5('"+newpassword+"') where id="+req.body.specialist_id;
            pool.query(sql2, async function (err2, result2, fields) {
                if(err2)
                { 
                  console.log(err2); 
                 var data = {
                     Status: false, 
                     Message: 'Something wroing in query.',
                     Error:err2
                 }; 
                  //var logStatus = 0;
                  //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                  res.end(JSON.stringify(data));
                  return false;
                 } 
             
                 var data = {
                   Status: true, 
                   Message:'Done' 
               };   
               var logStatus = 1;
               res.end(JSON.stringify(data));  
             });  

          } else {
            var data = {
                Status: false, 
                Message: 'your current password is not matched.',
                Error:err2
            }; 
             //var logStatus = 0;
             //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
             res.end(JSON.stringify(data));
             return false;
          } 
  
        }); 
  
    });



router.post('/Updatepayment', function (req, res) { 
    var  apiName  = 'ChangePassword';    
    var accountholder = req.body.accountholder;
    var iban = req.body.iban; 
    var bic = req.body.bic;
   
      if(accountholder==""){
        var data = {
            Status: false, 
            Message: 'accountholder is not blank.'
        };
  
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }  
  
     if(iban==""){
      var data = {
          Status: false, 
          Message: 'iban is not blank.'
      };
  
      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  

   if(bic==""){
    var data = {
        Status: false, 
        Message: 'bic is not blank.'
    }; 
    res.end(JSON.stringify(data));
    var logStatus = 0;
    //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
    }  
   


            var sql2 = "update specialist_private set account_holder = '"+accountholder+"' , iban= '"+iban+"' , bic= '"+bic+"'  where id="+req.body.specialist_id;
            pool.query(sql2, async function (err2, result2, fields) {
                if(err2)
                { 
                  console.log(err2); 
                 var data = {
                     Status: false, 
                     Message: 'Something wroing in query.',
                     Error:err2
                 }; 
                  //var logStatus = 0;
                  //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                  res.end(JSON.stringify(data));
                  return false;
                 } 
             
                 var data = {
                   Status: true, 
                   Message:'Done' 
               };   
               var logStatus = 1;
               res.end(JSON.stringify(data));  
             });   
    });



 router.get('/GetCalendarEvents', async function (req, res) { 
         var  apiName  = 'GetCalendarEvents';  
         var specialist_id =  req.query.specialist_id; 
         var legend_id =  req.query.legend;
         console.log(legend_id)
         
         
         if(legend_id)
         var sql2 = "SELECT id,title, event_date as start FROM events where legend_id='"+legend_id+"' and  specialist_id="+specialist_id;
          else  
         var sql2 = "SELECT id,title, event_date as start FROM events where specialist_id="+specialist_id;
        
         console.log(sql2);
         pool.query(sql2, async function (err2, result2, fields) {
             if(err2)
             { 
               console.log(err2); 
              var data = {
                  Status: false, 
                  Message: 'Something wroing in query.',
                  Error:err2
              }; 
               //var logStatus = 0;
               //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
               res.end(JSON.stringify(data));
               return false;
              }
            var myJSON2 = JSON.stringify(result2);
            var memberArray2 = JSON.parse(myJSON2); 
            if(memberArray2.length){ 
                
                  timezone = await globalVar.data.GetSpecialistTimeZoneById(specialist_id);
                  
                  var EventsData = [];
          memberArray2.forEach(element => {  
        if(timezone!=''){ 
       // var a = moment.tz(element['start'], timezone);  
        var stringDatetime = moment.utc(element['start']).tz(timezone); 
        console.log(stringDatetime);
      } else {
        var stringDatetime = element['start'];
      }

        EventsData.push({
          id:element['id'],
          title:element['title'],
          start: stringDatetime
        })
      }); 
      
              res.end(JSON.stringify(EventsData)); 
            } else {
              memberArray2 = [{}];
              res.end(JSON.stringify(memberArray2)); 
            }
          }); 
    }); 
 
// router.get('/GetSpecialistChatChannel', async function (req, res) { 
//   var  apiName  = 'GetSpecialistChatChannel';  
//   var  specialist_id =  req.query.specialist_id; 
//   var  sql2 = "SELECT  booking_histories.twilio_chat_id2 ,booking_histories.user_id ,booking_histories.specialist_id, booking_histories.payment_stripe_id , legends.legend_name , users.first_name ,users.last_name , booking_histories.booking_date , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join users on (booking_histories.user_id=users.id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.payment_status=1 and booking_histories.specialist_id="+specialist_id;
//   pool.query(sql2, async function (err2, result2, fields) {
//          if(err2)
//          { 
//            console.log(err2); 
//           var data = {
//               Status: false, 
//               Message: 'Something wroing in query.',
//               Error:err2
//           }; 
//            //var logStatus = 0;
//            //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
//            res.end(JSON.stringify(data));
//            return false;
//           }
//         var myJSON2 = JSON.stringify(result2);
//         var memberArray2 = JSON.parse(myJSON2); 
//         if(memberArray2.length){ 
//          // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];  
//           res.end(JSON.stringify(memberArray2)); 
//         }
//       }); 
// }); 
  
router.get('/GetSpecialistChatChannel', async function (req, res) { 
  var  apiName  = 'GetSpecialistChatChannel';  
  var specialist_id =  req.query.specialist_id; 
  var sql2 = "SELECT booking_histories.id,specialist_public_intros.profile_photo,booking_histories.twilio_chat_id2 ,booking_histories.user_id ,booking_histories.specialist_id, booking_histories.payment_stripe_id , legends.legend_name , users.first_name ,users.last_name ,users.user_image, booking_histories.booking_date , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join users on (booking_histories.user_id=users.id) left join  specialist_public_intros on specialist_public_intros.specialist_id= booking_histories.specialist_id  left join legends on (booking_histories.legend_id=legends.id) where booking_histories.twilio_chat_id2 IS NOT NULL and booking_histories.payment_status=1 and booking_histories.specialist_id="+specialist_id+" GROUP by booking_histories.id ";
  console.log(sql2);  
  pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
           // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];  
           res.end(JSON.stringify(memberArray2)); 
          }
      }); 
}); 

router.get('/GetSpecialistBookingUpdate', async function (req, res) { 
  var  apiName  = 'GetSpecialistBookingUpdate';  
  var specialist_id =  req.query.specialist_id;
  var status =  req.query.status;
  var bookingId =  req.query.bookingId; 

 if(status==3){ // Cancel  
  var sql2 = "SELECT  booking_histories.rebook_session_date1,booking_histories.session_date, users.id AS Uid ,users.first_name ,users.last_name,users.email  , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room  from booking_histories left join users on (booking_histories.user_id=users.id)  where booking_histories.id = "+bookingId;
  console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
       
          var sessionDate = memberArray2[0]['session_date']; 
          var first_name = memberArray2[0]['first_name'];
          var last_name = memberArray2[0]['last_name'];
          var Room = memberArray2[0]['Room'];  
          var email = memberArray2[0]['email'];  
           URLForVidep =   "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);
          // GLOBAL.URLForVidep =  "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);         

          var startDate = moment(sessionDate);
          var endDate = moment(); 


          console.log(startDate);

          var result = 'days: ' + endDate.diff(startDate, 'days');

          var result2 = 'hours: ' + endDate.diff(startDate, 'hours');

          var result3 = 'minutes: ' + endDate.diff(startDate, 'minutes');
 
           console.log(result);
           console.log(result2);
           console.log(result3);

         //  if(endDate.diff(startDate, 'days')>1){ 
         
         
           var event_id = await globalVar.data.GetEventIDByBookingID(bookingId); 
          if(event_id!=0)
          await globalVar.data.UpdateEventBookedbyID(event_id,1); 


            var sql2 = "update booking_histories set booking_status=3 where id="+bookingId;
            console.log(sql2);
            pool.query(sql2, async function (err2, result2, fields) {
                if(err2)
                { 
                  console.log(err2); 
                 var data = {
                     Status: false, 
                     Message: 'Something wroing in query.',
                     Error:err2
                 }; 
                  //var logStatus = 0;
                  //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
                  res.end(JSON.stringify(data));
                  return false;
                 } 


                 var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  secure: false,
               
                    auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
          
                }); 
    
                var mailOptions = {
                  from: 'nitesh@cresol.in',
                  to: email,
                  subject: 'Medaloha :Booking Cancelled ',
                  html: 'Your Booking have been Cancelled.'
                };
    
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response); 
                  }
    
                }); 


                 var data = {
                  Status: true, 
                  Message: 'Status Changed',
                  Validation:true // if status will not change then we will pass false 
                }; 
                res.end(JSON.stringify(data));   
             });  
        //   } else {
        //      var data = {
        //       Status: false, 
        //       Message: 'You can\'t Cancel before 24 hours.',
        //       Validation:false // if status will not change then we will pass false 
        //     }; 
        //     res.end(JSON.stringify(data)); 
        //   }
       
  

        }

      });

 }
 
 
 
  if(status==5){ // PAST

    var sql2 = "SELECT booking_histories.session_date, users.first_name ,users.email ,users.last_name   , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room  from booking_histories left join users on (booking_histories.user_id=users.id)  where booking_histories.id = "+bookingId;
  console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
       
          var sessionDate = memberArray2[0]['session_date']; 
          var first_name = memberArray2[0]['first_name'];
          var last_name = memberArray2[0]['last_name'];
          var Room = memberArray2[0]['Room'];  
          var email = memberArray2[0]['email'];  

           URLForVidep =   "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);
          // GLOBAL.URLForVidep =  "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);         

    var sql2 = "update booking_histories set booking_status=5 where id="+bookingId;
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         } 

         console.log(URLForVidep);



         var transporter = nodemailer.createTransport({
          service: 'gmail',
          secure: false,
          auth: {
            user: 'cresoluser@gmail.com', // here use your real email
            pass: 'cresoluser@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
        }); 

        var mailOptions = {
          from: 'nitesh@cresol.in',
          to: email,
          subject: 'Medaloha :Booking PAST ',
          html: 'Your Booking have been PAST.'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response); 
          }

        }); 

         
         var data = {
           URL:URLForVidep ,
           Status: true, 
           Message: 'Status Changed',
           Validation:true // if status will not change then we will pass false 
        }; 
        res.end(JSON.stringify(data));   
     }); 
    }

  }); 

  }

  if(status==2){ // Done

    var sql2 = "SELECT booking_histories.session_date, users.first_name ,users.email ,users.last_name   , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room  from booking_histories left join users on (booking_histories.user_id=users.id)  where booking_histories.id = "+bookingId;
  console.log(sql2);
  pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
       
          var sessionDate = memberArray2[0]['session_date']; 
          var first_name = memberArray2[0]['first_name'];
          var last_name = memberArray2[0]['last_name'];
          var Room = memberArray2[0]['Room'];  
          var email = memberArray2[0]['email'];  

           URLForVidep =   "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);
          // GLOBAL.URLForVidep =  "http://localhost:9000/room/param?payment="+btoa(first_name +'_'+ last_name+'||'+Room);         

    var sql2 = "update booking_histories set booking_status=2 where id="+bookingId;
    pool.query(sql2, async function (err2, result2, fields) {
        if(err2)
        { 
          console.log(err2); 
         var data = {
             Status: false, 
             Message: 'Something wroing in query.',
             Error:err2
         }; 
          //var logStatus = 0;
          //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
          res.end(JSON.stringify(data));
          return false;
         } 

         console.log(URLForVidep);



         var transporter = nodemailer.createTransport({
          service: 'gmail',
          secure: false,
        //   auth: {
        //     user: 'cresoluser@gmail.com', // here use your real email
        //     pass: 'cresoluser@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
        //   }
          
            auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
          
        }); 

        var mailOptions = {
          from: 'nitesh@cresol.in',
          to: email,
          subject: 'Medaloha :Booking Done ',
         html: 'Your Booking have been Done. you can give review now click here'+ '<a href="https://medaloha.cresol.in/customerdashboard?pat_review">Review Now</a>'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response); 
          }

        }); 

         
         var data = {
           URL:URLForVidep ,
           Status: true, 
           Message: 'Status Changed',
           Validation:true // if status will not change then we will pass false 
        }; 
        res.end(JSON.stringify(data));   
     }); 
    }

  }); 

  }

}); 



router.get('/GetSpecialistBooking', async function (req, res) { 
  var  apiName  = 'GetSpecialistBooking';  
  var specialist_id =  req.query.specialist_id;
  
  var sql2 = "SELECT `booking_histories`.`rebook_session_date1` , users.id AS Uid ,  (CASE WHEN legends.id = '4' THEN 'Video' WHEN legends.id = '5' THEN 'Video' WHEN legends.id = '6' THEN 'Video' WHEN legends.id = '7' THEN 'Audio' WHEN legends.id = '8' THEN 'Audio' WHEN legends.id = '9' THEN 'Audio' ELSE 'Message' END) AS 'Track' , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room , legends.legend_name , legends.id AS legendId , users.first_name ,users.last_name,users.email , booking_histories.booking_date ,booking_histories.booking_status ,booking_histories.id AS bookingID , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join users on (booking_histories.user_id=users.id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.payment_status=1 and booking_histories.specialist_id="+specialist_id;
     pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
         // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
          res.end(JSON.stringify(memberArray2)); 
        }
      }); 
}); 





router.get('/GetBookingInvoice', async function (req, res) { 
  var  apiName  = 'GetBookingInvoice';  
  var invoice_id =  req.query.invoice_id;
  
  var sql2 = "SELECT (CASE WHEN legends.id = '4' THEN 'Video' WHEN legends.id = '5' THEN 'Video' WHEN legends.id = '6' THEN 'Video' WHEN legends.id = '7' THEN 'Audio' WHEN legends.id = '8' THEN 'Audio' WHEN legends.id = '9' THEN 'Audio' ELSE 'Message' END) AS 'Track' , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room , legends.legend_name , legends.id AS legendId , users.first_name AS UserName ,users.last_name AS UserLast ,users.street_address AS UserAddress, users.country_id AS u_country_id , users.city_id AS u_city_id,users.zipcode AS Userzip , booking_histories.booking_date ,booking_histories.booking_status ,booking_histories.id AS bookingID , booking_histories.session_date , specialist_private.first_name AS Sname , specialist_private.last_name AS Slastname, specialist_private.country_id AS s_country_id , specialist_private.city_id AS s_city_id , booking_histories.booking_price , specialist_public_intros.holistic_center, specialist_public_intros.holistic_location ,booking_histories.user_rebooking_status  , booking_histories.card_type,booking_histories.last4 FROM `booking_histories` left join users on (booking_histories.user_id=users.id) left join specialist_private on (booking_histories.specialist_id=specialist_private.id) left join specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.payment_status=1 and booking_histories.id="+invoice_id;
     pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
           console.log(err2); 
          var data = {
              Status: false, 
              Message: 'Something wroing in query.',
              Error:err2
          }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){ 
         // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
         SepcialistInvoice=[];
         for(var i =0 ;i<memberArray2.length;i++) 
         {  

           var scityName =   await globalVar.data.GetCitynamebyID(memberArray2[i].s_city_id); 
           var scountryName =   await globalVar.data.GetCountrynamebyID(memberArray2[i].s_country_id); 
         
           var ucityName =   await globalVar.data.GetCitynamebyID(memberArray2[i].u_city_id); 
           var ucountryName =   await globalVar.data.GetCountrynamebyID(memberArray2[i].u_country_id); 

        

           SepcialistInvoice.push({ 
              Room:memberArray2[i].Room,
              Slastname:memberArray2[i].Slastname,
              Sname:memberArray2[i].Sname, 
              Track:memberArray2[i].Track, 
              UserAddress:memberArray2[i].UserAddress, 
              UserLast:memberArray2[i].UserLast, 
              UserName:memberArray2[i].UserName, 
              Userzip:memberArray2[i].Userzip, 
              bookingID:memberArray2[i].bookingID,
              booking_date:memberArray2[i].booking_date,
              booking_price:memberArray2[i].booking_price,
              holistic_center:memberArray2[i].holistic_center, 
              holistic_location:memberArray2[i].holistic_location , 
              legend_name:memberArray2[i].legend_name ,
              s_city_name:scityName , 
              s_country_name:scountryName ,  
              u_city_name:ucityName , 
              u_country_name:ucountryName ,  
              user_rebooking_status:memberArray2[i].user_rebooking_status , 
              cardType : memberArray2[i].card_type,
              Last4:memberArray2[i].last4
         })
      }

      console.log(SepcialistInvoice);
          res.end(JSON.stringify(SepcialistInvoice)); 
        }
      }); 
}); 



router.get('/userNotifications', function (req, res) { 
  //console.log(req.query.specialist_id);
  var  apiName  = 'userNotifications';   
  var user_id = req.query.user_id;
  var sql2 = "SELECT reviews.id as review_id from reviews  where reviews.user_id="+user_id+" and reviews.user_read_status=0 group by reviews.specialist_id ";
  console.log(sql2);
   var sql3 = "SELECT user_favourite_specialists.id as user_fav_spec_id from user_favourite_specialists  where user_favourite_specialists.user_id="+user_id+" group by user_favourite_specialists.specialist_id ";
  console.log(sql3);
   var sql4 = "SELECT booking_histories.id as booking_history_id from booking_histories  where booking_histories.user_id="+user_id+" and booking_histories.user_read_status=0 group by booking_histories.specialist_id ";
  console.log(sql4); 

pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
       console.log(err2); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 

       res.end(JSON.stringify(data));
       return false;
      }

      pool.query(sql3, function (err3, result2, fields) {
   if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3,

        }; 
        
       res.end(JSON.stringify(data));
       return false;
      }


 pool.query(sql4, function (err4, result3, fields) {
   if(err4)
     { 
       console.log(err4); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql4,
          Error:err4,

        }; 
        
       res.end(JSON.stringify(data));
       return false;
      }


 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
       var myJSON2 = JSON.stringify(result2);
      var Result2 = JSON.parse(myJSON2); 
      var myJSON3 = JSON.stringify(result3);
      var Result3 = JSON.parse(myJSON3); 
      var data = {
         Status: true, 
         Message: 'User Review Specialist Listing',
         Data: Result,
         favData: Result2,
         bookingData: Result3,
         Query2:sql2,
          Query3:sql3,
          Query4:sql4
     };  
     res.end(JSON.stringify(data)); 
})
 })

})
 }); 
 
  
router.get('/specialistNotifications', function (req, res) { 
  console.log(req.query.specialist_id);
  var  apiName  = 'specialistNotifications';   
  var specialist_id = req.query.specialist_id;
  var sql2 = "SELECT reviews.id as review_id from reviews  where reviews.specialist_id="+specialist_id+" and reviews.specialist_read_status=0 group by reviews.user_id ";
  console.log(sql2);
   var sql3 = "SELECT user_favourite_specialists.id as user_fav_spec_id from user_favourite_specialists  where user_favourite_specialists.specialist_id="+specialist_id+" group by user_favourite_specialists.user_id ";
  console.log(sql3);
   var sql4 = "SELECT booking_histories.id as booking_history_id from booking_histories  where booking_histories.specialist_id="+specialist_id+" and booking_histories.specialist_read_status=0 group by booking_histories.user_id ";
  console.log(sql4); 

pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
       console.log(err2); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 

       res.end(JSON.stringify(data));
       return false;
      }

      pool.query(sql3, function (err3, result2, fields) {
   if(err3)
     { 
       console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql3,
          Error:err3,

        }; 
        
       res.end(JSON.stringify(data));
       return false;
      }


 pool.query(sql4, function (err4, result3, fields) {
   if(err4)
     { 
       console.log(err4); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql4,
          Error:err4,

        }; 
        
       res.end(JSON.stringify(data));
       return false;
      }


 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
       var myJSON2 = JSON.stringify(result2);
      var Result2 = JSON.parse(myJSON2); 
      var myJSON3 = JSON.stringify(result3);
      var Result3 = JSON.parse(myJSON3); 
      var data = {
         Status: true, 
         Message: 'User Review Specialist Listing',
         Data: Result,
         favData: Result2,
         bookingData: Result3,
         Query2:sql2,
          Query3:sql3,
          Query4:sql4
     };  
     res.end(JSON.stringify(data)); 
})
 })

})
 }); 


 router.get('/SpecialistReadBookingNotification', function (req, res) { 
  console.log(req.query.history_id);
  var  apiName  = 'SpecialistReadBookingNotification';   
  var history_id = req.query.history_id;
  var sql2 = "update booking_histories set specialist_read_status=1  where booking_histories.id="+history_id+"";
console.log(sql2); 

pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
  var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
    
       res.end(JSON.stringify(data));
       return false;
    }
 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 


var data = {
         Status: true, 
         Message: 'User booking Review read Specialist Listing',
         Data: Result,
         
         Query2:sql2
        
     };  
     res.end(JSON.stringify(data)); 


});

});


router.get('/SpecialistReadReviewNotification', function (req, res) { 
  console.log(req.query.history_id);
  var  apiName  = 'SpecialistReadReviewNotification';   
  var review_id = req.query.review_id;
  var sql2 = "update reviews set specialist_read_status=1  where reviews.id="+review_id+"";
console.log(sql2);


pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
  var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
    
       res.end(JSON.stringify(data));
       return false;
    }
 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 


var data = {
         Status: true, 
         Message: 'User booking Review read Specialist Listing',
         Data: Result,
         
         Query2:sql2
        
     };  
     res.end(JSON.stringify(data)); 


}) 

});




router.get('/UserReadReviewNotification', function (req, res) { 
  console.log(req.query.history_id);
  var  apiName  = 'UserReadReviewNotification';   
  var review_id = req.query.review_id;
  var sql2 = "update reviews set user_read_status=1  where reviews.id="+review_id+"";
console.log(sql2);


pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
  var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
    
       res.end(JSON.stringify(data));
       return false;
    }
 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 


var data = {
         Status: true, 
         Message: 'User booking Review read Specialist Listing',
         Data: Result,
         
         Query2:sql2
        
     };  
     res.end(JSON.stringify(data)); 


}) 

});




router.get('/UserReadBookingNotification', function (req, res) { 
  console.log(req.query.history_id);
  var  apiName  = 'UserReadBookingNotification';   
  var history_id = req.query.history_id;
  var sql2 = "update booking_histories set user_read_status=1  where booking_histories.id="+history_id+"";
console.log(sql2); 

pool.query(sql2, function (err2, result, fields) {
   if(err2)
     { 
  var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2,

        }; 
    
       res.end(JSON.stringify(data));
       return false;
    }
 var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 


var data = {
         Status: true, 
         Message: 'User booking Review read Specialist Listing',
         Data: Result,
         
         Query2:sql2
        
     };  
     res.end(JSON.stringify(data)); 


});

});



  module.exports = router;