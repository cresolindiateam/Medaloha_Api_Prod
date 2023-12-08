const router = require("express").Router();
const pool = require('../dbconfig/database.js'); // db connection file
var nodemailer = require('nodemailer');
const moment = require('moment');
var multer = require('multer');
var axios = require('axios');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/profile')
    },
    filename: function (req, file, cb) { 
        const newfilename = file.originalname;
      cb(null, Date.now() + '-' + newfilename.replace(/\s/g,''))
    }
  });
   
  var upload = multer({ storage: storage });


router.post('/profilepic', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file);
  console.log(req.body);
});

router.post('/EmailRegisterForNextSlot', function (req, res, next) 
{ 
    var  apiName  = 'EmailRegisterForNextSlot';   
    var specialist_id = req.body.specialist_id;
    var email = req.body.email;
    var sql3 = "insert into email_next_slot(spec_id,email) value('"+specialist_id+"','"+email+"')";
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
  
  
   var sql2 = "select id from users where  id ='"+req.body.customer_id+"' and password=md5('"+currentpassword+"')";
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


            var sql2 = "update users set password =md5('"+newpassword+"') where id="+req.body.customer_id;
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



router.post('/CustomerUpdate' , upload.single('avatar'), function (req, res) { 
    var  apiName  = 'CustomerUpdate';  

    // var name = req.body.name; 
    // var surname = req.body.surname;
    // var email = req.body.email; 
    var stdcode = req.body.stdcode;
    var mobile = req.body.mobile; 
    var country = req.body.country;
    var city = req.body.city; 
    var dob = req.body.dob;
    if(dob)
    dob = moment(dob).format('YYYY-MM-DD');
    var streetaddress = req.body.streetaddress; 
    var zipcode = req.body.zipcode;
    var consultationlanguage = req.body.consultationlanguage;  
    var std_code = req.body.stdcode; 
    
     var timezone = req.body.timezone;
     
    var timezonestring  = '';
    var utcstring = '';
    if(timezone){
      var timezoneStringData = timezone.split('+');
        timezonestring  = timezoneStringData[0];
         utcstring = "+"+timezoneStringData[1];
    }
 
 
    
      if(country==""){
        var data = {
            Status: false, 
            Message: 'country is not blank.'
        };
  
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }  
  
     if(city==""){
      var data = {
          Status: false, 
          Message: 'city is not blank.'
      };
  
      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  
  
   console.log(req.body);

   if(req.file !== undefined ){ 
    var sql2 = "update users set user_image='"+req.file['filename']+"' where id="+req.body.customer_id;
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


  
       var sql2 = "update users set mobile ='"+mobile+"', country_id='"+country+"',timezone = '"+timezonestring+"' ,utc_offset_string ='"+utcstring+"',  city_id='"+city+"',dob='"+dob+"' , street_address='"+streetaddress+"' ,zipcode='"+zipcode+"' ,consultation_language='"+consultationlanguage+"' , std_code='"+std_code+"' where id="+req.body.customer_id;
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




// router.get('/GetCustomerDetailsByID', async function (req, res) { 
//     var  apiName  = 'GetCustomerDetailsByID';  
//     var customer_id = req.query.customer_id; 
//     var sql2 = "SELECT id,first_name, last_name,email,country_id,city_id,password ,mobile , dob,street_address , zipcode , consultation_language , std_code ,user_image from users where id="+customer_id;
//     pool.query(sql2, async function (err2, result2, fields) {
//        if(err2)
//            { 
//              console.log(err2); 
//              var data = {
//                 Status: false, 
//                 Message: 'Something wroing in query.',
//                 Error:err2
//             }; 
//              //var logStatus = 0;
//              //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
//              res.end(JSON.stringify(data));
//              return false;
//             }
//           var myJSON2 = JSON.stringify(result2);
//           var memberArray2 = JSON.parse(myJSON2); 
//           if(memberArray2.length){ 
//            // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
//             res.end(JSON.stringify(memberArray2)); 
//           }
//         }); 
// }); 

 
router.get('/GetBookingInformationByID', async function (req, res) { 
  var  apiName  = 'GetBookingInformationByID';  
  var bookingID = req.query.bookingID; 
  var sql2 = "SELECT legend_id from booking_histories where payment_status=1 and id="+bookingID;
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
        var myJSON2 = JSON.stringify(result2);
        var memberArray2 = JSON.parse(myJSON2); 
        if(memberArray2.length){  
          res.end(JSON.stringify(memberArray2)); 
        }
      }); 
}); 


router.get('/GetCustomerDetailsByID', async function (req, res) { 
  var  apiName  = 'GetCustomerDetailsByID';  
  var customer_id = req.query.customer_id; 
  var sql2 = "SELECT users.id,users.first_name, users.last_name,users.email,users.country_id,users.city_id,users.password ,users.mobile , users.dob,users.street_address , users.zipcode , users.consultation_language , users.std_code ,users.user_image ,users.timezone, users.utc_offset_string,countries.country_name ,cities.city_name from users left join countries on (countries.id=users.country_id) left join cities on (cities.id=users.city_id) where users.id="+customer_id;
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

router.get('/GetCustomerBooking', async function (req, res) { 
  var  apiName  = 'GetCustomerBooking';  
  var customer_id =  req.query.customer_id; 
  var sql2 = "SELECT `booking_histories`.`rebook_session_date1` ,`booking_histories`.`updated_at` ,specialist_private.id AS Sid, (CASE WHEN legends.id = '4' THEN 'Video' WHEN legends.id = '5' THEN 'Video' WHEN legends.id = '6' THEN 'Video' WHEN legends.id = '7' THEN 'Audio' WHEN legends.id = '8' THEN 'Audio' WHEN legends.id = '9' THEN 'Audio'  ELSE 'Message' END) AS 'Track' , CONCAT(booking_histories.specialist_id, '|' , booking_histories.user_id) AS Room ,  legends.id AS legendId ,legends.legend_name , specialist_private.first_name ,booking_histories.id AS bookingID,specialist_private.last_name, booking_histories.booking_status , booking_histories.booking_date , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join specialist_private on (booking_histories.specialist_id=specialist_private.id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.payment_status=1 and booking_histories.user_id="+customer_id;
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


// router.get('/GetCustomerChatChannel', async function (req, res) { 
//   var  apiName  = 'GetCustomerChatChannel';  
//   var customer_id =  req.query.customer_id; 
//   var sql2 = "SELECT booking_histories.twilio_chat_id1  ,   booking_histories.user_id ,booking_histories.specialist_id, booking_histories.payment_stripe_id , legends.legend_name , specialist_private.first_name ,specialist_private.last_name,specialist_private.email , booking_histories.booking_date , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join specialist_private on (booking_histories.specialist_id=specialist_private.id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.payment_status=1 and booking_histories.user_id="+customer_id;
//      pool.query(sql2, async function (err2, result2, fields) {
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


router.get('/GetCustomerChatChannel', async function (req, res) 
{ 
  var  apiName  = 'GetCustomerChatChannel';  
  var customer_id =  req.query.customer_id; 
  var sql2 = "SELECT users.first_name as u_first_name,users.last_name as u_last_name,users.user_image as u_image,booking_histories.id ,specialist_public_intros.profile_photo,booking_histories.twilio_chat_id1  ,   booking_histories.user_id ,booking_histories.specialist_id, booking_histories.payment_stripe_id , legends.legend_name ,booking_histories.specialist_id,specialist_private.first_name ,specialist_private.last_name,specialist_private.email , booking_histories.booking_date , booking_histories.session_date ,booking_histories.client_note ,booking_histories.private_note , booking_histories.booking_price FROM `booking_histories` left join specialist_private on (booking_histories.specialist_id=specialist_private.id) left join  specialist_public_intros on specialist_public_intros.specialist_id= booking_histories.specialist_id left join users on (users.id=booking_histories.user_id) left join legends on (booking_histories.legend_id=legends.id) where booking_histories.twilio_chat_id1 IS NOT NULL and booking_histories.payment_status=1 and booking_histories.user_id="+customer_id+" group by booking_histories.id";
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

// for(i=0;i<memberArray2.length;i++){

// const stripe_id=memberArray2[i].payment_stripe_id.toString();
// var session_url = 'https://chat.twilio.com/v2/Services/IS79fce8faa36740bcb62ec5343bc043ef/Channels/'+stripe_id;
// var uname = 'ACa6379577a6de4e7952cb565ba338f944';
// var pass = '3dc90b3bfcfcbbca34d75841f8548a20';
//  var response11=await axios.post(session_url, {}, {
//   auth: {
//     username: uname,
//     password: pass
//   }
// })

// const dd=response11.data.links.last_message;
//  var response12= await axios.post(dd, {}, 
//  {
//   auth: {
//     username: uname, 
//     password: pass
//   }
// })
 
// memberArray2[i].last_message=response12.data.body;
// //memberArray2[i].date_created='09/11/1111';

// }

console.log(memberArray2);
          res.end(JSON.stringify(memberArray2)); 
        };
      }); 
}); 
  module.exports = router;
