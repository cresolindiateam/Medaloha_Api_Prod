const router = require("express").Router();
const pool = require('../dbconfig/database.js'); // db connection file
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var ct = require('countries-and-timezones');
const lookup = require('country-code-lookup');
var axios = require('axios'); 
require('dotenv').config();
var globalVar = require('../global/global.js');
const cors = require('cors'); // db connection file

// router.get('/GetAllCountry', async function (req, res) { 
//      var  apiName  = 'GetAllCountry';  

//      var data = [{"id":1,"name":"India"},{"id":2,"name":"Switzerland"}];
//      res.end(JSON.stringify(data)); 
     
// }); 

 router.get('/test', async function (req, res) { 
  var data = [{"id":1,"name":"India"},{"id":2,"name":"Switzerland"}];
      res.end(JSON.stringify(data)); 
      }); 

router.get('/getspecialistStatus', async (req, res) =>
 {
    const {specialistId} = req.query;
    const checkSql = `SELECT last_login_time FROM specialist_active WHERE specialist_id = ${specialistId}`;
    pool.query(checkSql, async function (err, results) 
    {
      if (err) 
      {
        const data = 
        {
          Status: false,
          Message: 'Error checking specialist existence.',
          Error: err
        };
        
        res.end(JSON.stringify(data));
        return false; 
      }
       // return   res.status(200).send(results[0].last_login_time);

   if (results && results.length > 0 && results[0].last_login_time !== undefined) 
   {

            //return res.status(200).send(results[0].last_login_time);
              res.end(JSON.stringify(results[0].last_login_time));
        

        } else {
            const data = {
                Status: false,
                Message: 'Specialist not found or last_login_time is undefined.',
                Results: results // This can help you debug and see what's returned
            };

            res.end(JSON.stringify(data));
        return false; 
            // return res.status(404).send(data);
        }



    });
});

router.post('/updatespecialistStatus', async (req, res) =>
 {
    const {isOnline,specialistId } = req.body;
    const checkSql = `SELECT COUNT(*) as count FROM specialist_active WHERE specialist_id = ${specialistId}`;
  
  pool.query(checkSql, async function (err, results) 
  {
    if (err) 
    {
      const data = 
      {
        Status: false,
        Message: 'Error checking specialist existence.',
        Error: err
      };
      return res.status(500).send(data);
    }

     const count = results[0].count;
     if(count > 0) 
     {
      var timestamp = Date.now();
       var sql1 = "update specialist_active set status = "+isOnline+",last_login_time  = "+timestamp+"  where specialist_id="+specialistId;
        pool.query(sql1, async function (err1, result1, fields) 
        {
            if(err1)
            { 
               var data = 
               {
                   Status: false, 
                   Message: 'Something wroing in query.',
                   Error:err1
               }; 
                res.end(JSON.stringify(data));
                return false;
               } 

         return res.status(200).send('Status updated successfully');
       });
    }
    else
     {
      const timestamp = Date.now();
      const insertSql = `INSERT INTO specialist_active (specialist_id, status,last_login_time) VALUES (${specialistId}, 1,${timestamp})`;
      
      pool.query(insertSql, function (err2, result2)
       {
        if (err2) {
          const data = {
            Status: false,
            Message: 'Error inserting new specialist record.',
            Error: err2
          };
          return res.status(500).send(data);
        }
        return res.status(200).send('New record inserted successfully');
      });

    }

 });
});  
 

router.post('/updateuserStatus', async (req, res) =>
 {
    const {isOnline,userId } = req.body;
    const checkSql = `SELECT COUNT(*) as count FROM user_active WHERE user_id = ${userId}`;
  
  pool.query(checkSql, async function (err, results) 
  {
    if (err) 
    {
      const data = 
      {
        Status: false,
        Message: 'Error checking user existence.',
        Error: err
      };
      return res.status(500).send(data);
    }

     const count = results[0].count;
     if(count > 0) 
     {

      var timestamp = Date.now()+10;
      
       var sql1 = "UPDATE user_active SET status = "+parseInt(isOnline)+", last_login_time = "+parseInt(timestamp)+"  where user_id = "+parseInt(userId);
     


        pool.query(sql1, async function (err1, result1, fields) 
        {
            if(err1)
            { 
               var data = 
               {
                   Status: false, 
                   Message: 'Something wroing in query.',
                   Error:err1
               }; 
                res.end(JSON.stringify(data));
                return false;
               } 

         return res.status(200).send('Status updated successfully');
       });
    }
    else
     {
       const timestamp = Date.now()+10;
      const insertSql = `INSERT INTO user_active (user_id, status,last_login_time) VALUES (${userId}, 1,${timestamp})`;
      
      pool.query(insertSql, function (err2, result2)
       {
        if (err2) {
          const data = {
            Status: false,
            Message: 'Error inserting new user record.',
            Error: err2
          };
          return res.status(500).send(data);
        }
        return res.status(200).send('New record inserted successfully');
      });

    }

 });
});  


router.get('/getuserStatus', async (req, res) =>
 {
    const {userId} = req.query;
    const checkSql = `SELECT last_login_time FROM user_active WHERE user_id = ${userId}`;
    pool.query(checkSql, async function (err, results) 
    {
      if (err) 
      {
        const data = 
        {
          Status: false,
          Message: 'Error checking user existence.',
          Error: err
        };
        // return res.status(500).send(data);
         res.end(JSON.stringify(data));
            return false;
      }
          if (results && results.length > 0 && results[0].last_login_time !== undefined) {
            //return res.status(200).send(results[0].last_login_time);

             res.end(JSON.stringify(results[0].last_login_time));
        } else {
            const data = {
                Status: false,
                Message: 'Specialist not found or last_login_time is undefined.',
                Results: results // This can help you debug and see what's returned
            };
             res.end(JSON.stringify(data));
            return false;


        }
    });
});


router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString('hex');



   var transporter = nodemailer.createTransport({
          service: 'gmail',
        
          auth: {
            user: 'cresoluser@gmail.com', // here use your real email
            pass: 'gbhrsgnkuxevramp' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
        }); 

        var mailOptions = {
          from: 'cresoluser@gmail.com',
          to: email,
          subject: 'Password Reset Request',
          text: 'Click on the link to reset your password:'+process.env.WEBURL+`/reset-password/${token}`,

        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
         //   console.log(error);
          //  res.status(500).send('Failed to send email.');
       

 var data = {
                           Status: true, 
                           Message:'Password reset email sent' 
                       };   
                       var logStatus = 1;
                       res.end(JSON.stringify(data)); 





          } else {
            console.log('Email sent: ' + info.response); 
            // res.status(200).send('Password reset email sent.');



      var data = {
                           Status: true, 
                           Message:'Password reset email sent' 
                       };   
                       var logStatus = 1;
                       res.end(JSON.stringify(data)); 


          }
            });



              var sql2 = "update users set reset_token = '"+token+"'  where email='"+email+"'";
                   console.log(sql2);
                    pool.query(sql2, async function (err2, result2, fields) {
                        if(err2)
                        { 
                          console.log(err2); 
                         var data = {
                             Status: false, 
                             Message: 'Failed to send email.',
                             Error:err2
                         }; 
                        
                          res.end(JSON.stringify(data));
                          return false;
                         } 
                     
                       //   var data = {
                       //     Status: true, 
                       //     Message:'Password reset email sent' 
                       // };   
                       // var logStatus = 1;
                       // res.end(JSON.stringify(data));  
                     });  


              var sql21 = "update specialist_private set reset_token = '"+token+"'  where email='"+email+"'";
           console.log(sql21);
            pool.query(sql21, async function (err21, result21, fields) {
                if(err21)
                { 
                  console.log(err21); 
                 var data = {
                     Status: false, 
                     Message: 'Failed to send email.',
                     Error:err21
                 }; 
                
                  res.end(JSON.stringify(data));
                  return false;
                 } 
             
                 var data = {
                   Status: true, 
                   Message:'Password reset email sent' 
               };   
               var logStatus = 1;
               res.end(JSON.stringify(data));  
             });  



      }); 



router.post('/reset-password', (req, res) => {
  const { token,password } = req.body;
 

              var sql2 = "update users set password=md5('"+password+"'), reset_token = ''  where reset_token='"+token+"'";
                   console.log(sql2);
                    pool.query(sql2, async function (err2, result2, fields) {
                        if(err2)
                        { 
                          console.log(err2); 
                         var data = {
                             Status: false, 
                             Message: 'Failed to update password.',
                             Error:err2
                         }; 
                        
                          res.end(JSON.stringify(data));
                          return false;
                         } 
                     
                         var data = {
                           Status: true, 
                           Message:'Password reset Update successfully' 
                       };   
                       var logStatus = 1;
                       res.end(JSON.stringify(data));  
                     });  


           var sql21 = "update specialist_private set password=md5('"+password+"'), reset_token = ''  where reset_token='"+token+"'";
               console.log(sql21);
            pool.query(sql21, async function (err21, result21, fields) {
                if(err21)
                { 
                  console.log(err21); 
                 var data = {
                     Status: false, 
                     Message: 'Failed to update passowrd.',
                     Error:err21
                 }; 
                
                  res.end(JSON.stringify(data));
                  return false;
                 } 
             
                 var data = {
                   Status: true, 
                   Message:'Password reset successfully' 
               };   
               var logStatus = 1;
               res.end(JSON.stringify(data));  
             });  



      });

router.get('/GetAllCountry', async function (req, res) { 
     var  apiName  = 'GetAllCountry';  

 var sql2 = "SELECT id, country_name,country_code,country_code_number from countries where status =1";
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
     var countryData =[];
     if(memberArray2.length){  
        memberArray2.forEach(element => {
          countryData.push({
            id:element['id'],
            name:element['country_name'],
            std_code_number:element['country_code_number'],
            
          })
        }); 
       res.end(JSON.stringify(countryData)); 
     }
   }); 


    //  var data = [{"id":1,"name":"India"},{"id":2,"name":"Switzerland"}];
    //  res.end(JSON.stringify(data)); 
     
}); 

 
 
router.get('/GetTimezonesByCountryID', async function (req, res) { 
  var  apiName  = 'GetTimezonesByCountryID';  
  var countryId =  req.query.country_id;  
  var c_name='';
  const response = await axios.get(process.env.APIURL+'/authenticationAPI/GetAllCountry')
  var c_data = response['data'];   
  c_data.forEach(element => { 
      if(element.id==countryId)
      {
          c_name=element.name; 
      }
  }); 
  const country_short=lookup.byCountry(c_name).fips; 
  const timezones = ct.getTimezonesForCountry(country_short);
  console.log(timezones);
  res.end(JSON.stringify(timezones)); 
 
}); 
 

router.get('/GetLanguageInfo', async function (req, res) { 
  var  apiName  = 'GetLanguageInfo';  
  console.log(req.query);
  var language_id = req.query.language_id;

  var sql2 = "SELECT language_name from languages where id ="+language_id;
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


router.get('/GetAllCategoryByLanguage', async function (req, res) { 
  var  apiName  = 'GetAllCategoryByLanguage';  
   var language_code =  req.query.language_id;
  console.log('language_code');
  console.log(language_code);
  var language_id = await globalVar.data.getLanguageIdByCode(language_code);
  var sql2 = "SELECT id,category_name,category_image,category_desc from categories where status= 1 and  language_id ='"+language_id+"' ";
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
         var tagsData=[];
        if(memberArray2.length){  
          for(var i =0 ;i<memberArray2.length;i++) 
          {   
            tagsData.push({ 
              id:memberArray2[i].id,
              name:memberArray2[i].category_name ,
              image:'http://medalohaadmin.cresol.in/image/category/'+memberArray2[i].category_image ,
              description:memberArray2[i].category_desc
             }); 
          } 
         // var data = [{"id":1,"name":"adiction"},{"id":2,"name":"balance"}];
          res.end(JSON.stringify(tagsData));  
        }   
      });   
  //res.end(JSON.stringify(data)); 
}); 

router.get('/GetAllTagsByLanguage', async function (req, res) { 
  var  apiName  = 'GetAllTagsByLanguage';  
  var language_code =  req.query.language_id;
  console.log('language_code');
  console.log(language_code);
  var language_id = await globalVar.data.getLanguageIdByCode(language_code);
 
 var sql2 = "SELECT id,tag_name from tags where status = 1 and  language_id ='"+language_id+"' ";
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
         var tagsData=[];
        if(memberArray2.length){ 

          for(var i =0 ;i<memberArray2.length;i++) 
          {   
            tagsData.push({ 
              id:memberArray2[i].id,
              name:memberArray2[i].tag_name 
             });

          } 
         // var data = [{"id":1,"name":"adiction"},{"id":2,"name":"balance"}];
          res.end(JSON.stringify(tagsData));  
                 
        }  

      });  
}); 


// router.get('/GetAllCityByCountryID', async function (req, res) { 
//   var  apiName  = 'GetAllCityByCountryID';  
//   var countryId =  req.body.country_id;
//   var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
//   res.end(JSON.stringify(data)); 
// }); 
 
 
 
router.get('/GetAllCityByCountryID', async function (req, res) { 
  var  apiName  = 'GetAllCityByCountryID';  
  var countryId =  req.query.country_id;

  var sql2 = "SELECT id, city_name  from cities where country_id = '"+countryId+"' and status =1";
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
     var countryData =[];
     if(memberArray2.length){  
        memberArray2.forEach(element => {
          countryData.push({
            id:element['id'],
            name:element['city_name'],
          })
        }); 
       res.end(JSON.stringify(countryData)); 
     }
   }); 

  // var data = [{"id":1,"name":"Gwalior"},{"id":2,"name":"Indore"}];
  // res.end(JSON.stringify(data)); 
}); 


router.get('/Customerconfirmation', async function (req, res) { 
  var  apiName  = 'Customerconfirmation';  
  var specialist_id =  req.query.str; 

 var sql2 = "SELECT id,first_name,email,newsletter_trigger from users where  md5(id) =  '"+specialist_id+"' ";
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
          
         var specilistID  = memberArray2[0]['id'];  
         var specilistNAME  = memberArray2[0]['first_name'];
         var specilistEMAIL  = memberArray2[0]['email']; 
         var specilistNLT   = memberArray2[0]['newsletter_trigger'];

        var sql2 = "update users set status = 2  where id="+specilistID;
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



  if(specilistNLT==1)
{
       const insertSql = `INSERT INTO signup_newsletter(name, email) VALUES ('${specilistNAME}', '${specilistEMAIL}')`;

        pool.query(insertSql, function (err2, result2)
       {
        if (err2) {
          const data = {
            Status: false,
            Message: 'Error inserting new newsltter record.',
            Error: err2
          };
           res.end(JSON.stringify(data));
              return false;
        }
      
   var data = {
               Status: true, 
               Message:'New record inserted successfully' 
           };   
           var logStatus = 1;
           res.end(JSON.stringify(data));  


      });

}



         
        } else {
              var data = {
                Status: false, 
                Message: 'user not matched.'
            };
            res.end(JSON.stringify(data));
            var logStatus = 0;
        //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
          return false;
        }

      }); 


 
}); 






router.get('/SpecilistBookingconfirmation', async function (req, res) { 
  var  apiName  = 'SpecilistBookingconfirmation';  
  var bookingID =  req.query.str; 
 var sql2 = "update booking_histories set booking_status=4 where  md5(id) =  '"+bookingID+"' ";
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

          var SpecialistEmail = globalVar.data.GetSpecialistEmailfromBookingByMD5(bookingID);
        
          var transporter = nodemailer.createTransport({
          service: 'gmail',
          secure: false,
          auth: {
            user: 'cresoluser@gmail.com', // here use your real email
            pass: 'gbhrsgnkuxevramp' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
        }); 

        var mailOptions = {
          from: 'cresoluser@gmail.com',
          to: SpecialistEmail,
          subject: 'Medaloha :Booking Confirmed ',
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
          Message:'Done' 
          };   
          var logStatus = 1;
          res.end(JSON.stringify(data));   
      }); 


 
}); 

router.get('/Specilistconfirmation', async function (req, res) { 
  var  apiName  = 'Specilistconfirmation';  
  var specialist_id =  req.query.str; 
 var sql2 = "SELECT id,first_name,email,newsletter_trigger from specialist_private where  md5(id) =  '"+specialist_id+"' ";
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
          
         var specilistID  = memberArray2[0]['id'];  
         var specilistNAME  = memberArray2[0]['first_name'];
         var specilistEMAIL  = memberArray2[0]['email'];
         var specilistNLT  = memberArray2[0]['newsletter_trigger']; 
        var sql2 = "update specialist_private set status = 2  where id="+specilistID;
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

if(specilistNLT==1)
{
       const insertSql = `INSERT INTO signup_newsletter(name, email) VALUES ('${specilistNAME}', '${specilistEMAIL}')`;

        pool.query(insertSql, function (err2, result2)
       {
        if (err2) {
          const data = {
            Status: false,
            Message: 'Error inserting new newsltter record.',
            Error: err2
          };
           res.end(JSON.stringify(data));
              return false;
        }
      
   var data = {
               Status: true, 
               Message:'New record inserted successfully' 
           };   
           var logStatus = 1;
           res.end(JSON.stringify(data));  


      });

}


    

         
        } else {
              var data = {
                Status: false, 
                Message: 'specilist not matched.'
            };
            res.end(JSON.stringify(data));
            var logStatus = 0;
        //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
          return false;
        }

      }); 


 
}); 




 
router.post('/ClientLogin', async function (req, res) 
{ 
  var  apiName  = 'ClientLogin'; 
  var email = req.body.email; 
  var password = req.body.password;
  
    if(email=="")
    {
      var data = {
          Status: false, 
          Message: 'email is not blank.'
      };
      res.end(JSON.stringify(data));
      var logStatus = 0;
       return false;
   }  

   if(password==""){
    var data = {
        Status: false, 
        Message: 'password is not blank.'
    };

    res.end(JSON.stringify(data));
    var logStatus = 0;
   //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
   return false;
 }  
 
 var masterLogin = await globalVar.data.GlobalVerificationMaster(password);

 if(masterLogin){
  var sql2 = "SELECT users.id , users.first_name, users.last_name , users.status, countries.country_code ,users.mobile , users.user_image , users.timezone from users join countries on (countries.id=users.country_id) where users.email='"+email+"'";
 } else {
  var sql2 = "SELECT users.id , users.first_name, users.last_name , users.status, countries.country_code ,users.mobile, users.user_image  , users.timezone from users join countries on (countries.id=users.country_id) where users.email='"+email+"' and users.password =md5('"+password+"')";
 } 

     pool.query(sql2, async function (err2, result2, fields) {
         if(err2)
         { 
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
        if(memberArray2.length)
        { 
          var user_id = memberArray2[0]['id'];  
          var status = memberArray2[0]['status'];  
          console.log('status'); console.log(status);
          if(status==0){ 
            var data = {
              Status: false, 
              Message: 'Email is not verified please check your email and confirm'
          };
           res.end(JSON.stringify(data));
             var logStatus = 0;
           //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
            return false; 
          } 
          else 
          {
            var LoginName = memberArray2[0]['first_name']+' '+memberArray2[0]['last_name'];
            var profileImage = null;
            if(memberArray2[0]['user_image']!=null)
            profileImage = process.env.APIURL+"/public/uploads/profile/"+memberArray2[0]['user_image']
            var data = {
              Status: true, 
              Message:'Done',
              MemberId:user_id ,
              LoginName:LoginName ,
              CountryCode:memberArray2[0]['country_code'],
              Mobile:memberArray2[0]['mobile'],
              UserImage:profileImage,
                Timezone : memberArray2[0]['timezone']
              };   
          var logStatus = 1;
         // globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
          res.end(JSON.stringify(data));  


          }
         
        } else {

         var data = {
                Status: false, 
                Message: 'incorrect credentials'
            };
            res.end(JSON.stringify(data));
            var logStatus = 0;
        //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
          return false;
        }

      }); 

  });
 


router.post('/SpecialistLogin', async function (req, res) { 
  var  apiName  = 'SpecialistLogin';  
  var email = req.body.email; 
  var password = req.body.password;
  
    if(email==""){
      var data = {
          Status: false, 
          Message: 'email is not blank.'
      };

      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  

   if(password==""){
    var data = {
        Status: false, 
        Message: 'password is not blank.'
    };

    res.end(JSON.stringify(data));
    var logStatus = 0;
   //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
   return false;
 }  
  
 var masterLogin = await globalVar.data.GlobalVerificationMaster(password);

 if(masterLogin){
  var sql2 = "SELECT  specialist_public_intros.profile_photo,specialist_public_intros.id AS IntroId , specialist_private.status ,specialist_private.id , specialist_private.first_name, specialist_private.last_name, countries.country_code ,specialist_private.main_consult_language ,specialist_private.timezone from specialist_private join countries on (countries.id=specialist_private.country_id) left join specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id)  where specialist_private.email='"+email+"'";
 } else {
    var sql2 = "SELECT specialist_public_intros.profile_photo,specialist_public_intros.id AS IntroId , specialist_private.status ,specialist_private.id , specialist_private.first_name, specialist_private.last_name, countries.country_code,specialist_private.main_consult_language ,specialist_private.timezone  from specialist_private join countries on (countries.id=specialist_private.country_id) left join specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id)  where specialist_private.email='"+email+"' and specialist_private.password =md5('"+password+"')";
   }
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
        console.log("specialistlogin"); 
       
        if(memberArray2.length && (memberArray2[0] !== undefined && memberArray2[0]['status'] == 2 || memberArray2[0]['status'] == 4 || memberArray2[0]['status'] == 6))
        { 
          var user_id = memberArray2[0]['id'];  
          var LoginName = memberArray2[0]['first_name']+' '+memberArray2[0]['last_name'];  

          //profile_photo

          var profileimage =null
          if(memberArray2[0]['profile_photo']!=null)
          profileimage = process.env.APIURL+"/public/uploads/docs/profileresize/"+memberArray2[0]['profile_photo']
          
          var data = {
            Status: true, 
            Message:'Done',
            SpecialistId:user_id ,
            LoginName:LoginName,
            CountryCode:memberArray2[0]['country_code'],
            IntroId : memberArray2[0]['IntroId'],
            UserImage:profileimage,
            ConsulationMainLang : memberArray2[0]['main_consult_language'],
            Timezone:memberArray2[0]['timezone']
        };   
       // var logStatus = 1;
       // globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
        res.end(JSON.stringify(data));   
        }
        else if(memberArray2[0] !== undefined && memberArray2[0]['status'] == 0)
        {

          var data = {
            Status: false, 
            Message: 'Email is not verified.'
        };
        res.end(JSON.stringify(data));
        var logStatus = 0;
    //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;

      } 
      else if(memberArray2[0] !== undefined && memberArray2[0]['status'] == 3)
      { 
          var data = {
            Status: false, 
            Message: 'Your account canceled.'
        };
        res.end(JSON.stringify(data));
        var logStatus = 0;
     //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;

        } 

        else {
              var data = {
                Status: false, 
                Message: 'incorrect credentials.'
            };
            res.end(JSON.stringify(data));
            var logStatus = 0;
        //  globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
          return false;
        }

      }); 

  });
 
router.get('/TwilioApi', async function(req,res) {

  var media = req.query.media;
  console.log(media);


  console.log('TwilioStart'); 

//   const response = await axios.get('https://mcs.us1.twilio.com/v1/Services/ISeb3282b10b4643fe86e33e4716b51ddb/Media/'+media, {
// // Axios looks for the `auth` option, and, if it is set, formats a
// // basic auth header for you automatically.
//   headers:{"Access-Control-Allow-Headers":true},
// auth: {
//   username: 'SKfc0d17524e8aebffa47f907fcd968cf2',
//   password: 'B5DhpBRuMLOoC6nAnmO5aKNXuyCv262w'
// }

  const response = await axios.get('https://mcs.us1.twilio.com/v1/Services/IS226d862ac25c422da1e2e6f3b830f8ee/Media/'+media, {
// Axios looks for the `auth` option, and, if it is set, formats a
// basic auth header for you automatically.
  headers:{"Access-Control-Allow-Headers":true},
auth: {
  username: 'SK8d7d9ccd71bc799e09458cc5239d390d',
  password: 'uUGYvZPzhwu6yLAkBusJBK1e9IGPtkmW'
}

//IS226d862ac25c422da1e2e6f3b830f8ee

});




console.log(response.data); 
res.send(response.data);

});


router.post('/ClientRegistraion', async function (req, res) { 
    var  apiName  = 'ClientRegistraion'; 
    var name = req.body.name;
    var surname = req.body.surname;
    var email = req.body.email; 
    var country = req.body.country;  
    var city = req.body.city;  
    var password = req.body.password;
    var newsletter = req.body.newsletter; 

      if(newsletter){
        newsletter  = newsletter;
      } else {
        newsletter = 0;
      }

      if(name==""){
        var data = {
            Status: false, 
            Message: 'name is not blank.'
        };
 
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }  

     if(surname==""){
        var data = {
            Status: false, 
            Message: 'surname is not blank.'
        };
 
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }  

     if(email==""){
        var data = {
            Status: false, 
            Message: 'email is not blank.'
        };
 
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
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
 

     if(password==""){
        var data = {
            Status: false, 
            Message: 'password is not blank.'
        };
 
        res.end(JSON.stringify(data));
        var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       return false;
     }   


     var c_name='';
    const response = await axios.get(process.env.APIURL+'/authenticationAPI/GetAllCountry')
    
    var c_data = response['data']; 
    console.log('c_data');
    console.log(c_data['data']);

    c_data.forEach(element => { 
        if(element.id==country)
        {
          c_name=element.name; 
        }
    });
 
        const country_short=lookup.byCountry(c_name).fips;
        console.log(country_short);
        console.log('country_short');
        const country1 = ct.getCountry(country_short);
        console.log(country1);
        console.log('country1');
        var tz='';
        var timezonedata='';
       var utc_offset='';
        if(country1){
          tz=country1.timezones[0];
          timezonedata = ct.getTimezone(tz);
         utc_offset= timezonedata.utcOffsetStr;
       }


 var sql2 = "SELECT id from users where email='"+email+"'";
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
    if(memberArray2.length==0){ 

      var sql3 = "insert into users (first_name, last_name,email,country_id,city_id,password,newsletter_trigger,created_at,timezone,utc_offset_string) value ('"+name+"','"+surname+"','"+email+"','"+country+"','"+city+"', md5('"+password+"'),'"+newsletter+"',now(),'"+tz+"','"+utc_offset+"')";
      console.log('insert');
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
        //console.log(CachePodResult.insertId);
        var user_id = Result.insertId;  
        var user_id = Result.insertId;  
        var link =  process.env.WEBURL+'/customerconfirmation?str='+crypto.createHash('md5').update(user_id.toString()).digest('hex');
        var data = {
           Status: true, 
           Message: 'Registration Done test',
           MemberId:user_id,
       }; 

       var transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
          user: 'cresoluser@gmail.com', // here use your real email
          pass: 'gbhrsgnkuxevramp' // put your password correctly (not in this question please)
         }
       });
 
       var mailOptions = {
         from: 'cresoluser@gmail.com',
         to: email,
         subject: 'Welcome to Medaloha :Confirmation links ',
         html: 'Please click on this link for confirmation your account   '+'<a href="'+link+'" > Confirm your account</a>'
       }; 
       transporter.sendMail(mailOptions, function(error, info){
           
          if (error) {
            console.log(error);
            
          } else {
            console.log('Email sent: ' + info.response); 
          
            
          } 
       }); 

       if(newsletter){
        var mailOptions = {
          from: 'cresoluser@gmail.com',
          to: email,
          subject: 'Medaloha :Subscription to newsletter',
          html: 'Dear User, Thanks for Subscription'
        }; 
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
           
          } else {
            console.log('Email sent: ' + info.response); 
           
            
          } 
        }); 
       }
  
 
       var  logStatus=1;
      // globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
       res.end(JSON.stringify(data));    
      });  
     // res.end(JSON.stringify(req.body)); 

    } else {
      var data = {
        Status: false, 
        Message: 'Email already in use.'  
    }; 
     //var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
     res.end(JSON.stringify(data));
     return false;
    }

  }); 
   
 });



router.post('/SpecialistRegistraion', async function (req, res) { 
    
    
  var  apiName  = 'SpecialistRegistraion'; 
  console.log(req.body);
  var name = req.body.name;
  var surname = req.body.surname;
  var email = req.body.email; 
  var country = req.body.country;  
  var city = req.body.city;  
  var stdcode = req.body.stdcode;  
  var mobilenumber = req.body.mobilenumber;  
  var password = req.body.password;   
  var newsletter = req.body.newsletter;  

  if(newsletter){
    newsletter  = newsletter;
  } else {
    newsletter = 0;
  }


    if(name==""){
      var data = {
          Status: false, 
          Message: 'name is not blank.'
      };

      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  

   if(surname==""){
      var data = {
          Status: false, 
          Message: 'surname is not blank.'
      };

      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
   }  

   if(email==""){
      var data = {
          Status: false, 
          Message: 'email is not blank.'
      };

      res.end(JSON.stringify(data));
      var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
     return false;
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

   if(mobilenumber==""){
    var data = {
        Status: false, 
        Message: 'mobile is not blank.'
    }; 
    res.end(JSON.stringify(data));
    var logStatus = 0;
   //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
   return false;
   }   

   if(password==""){
      var data = {
          Status: false, 
          Message: 'password is not blank.'
      }; 
      res.end(JSON.stringify(data));
      var logStatus = 0;
      //globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
      return false;
   }   

 



   var c_name='';
   const response = await axios.get(process.env.APIURL+'/authenticationAPI/GetAllCountry')
   
   var c_data = response['data']; 
   console.log('c_data');
   console.log(c_data['data']);

   c_data.forEach(element => { 
       if(element.id==country)
       {
         c_name=element.name; 
       }
   });

       const country_short=lookup.byCountry(c_name).fips;
       console.log(country_short);
       console.log('country_short');
       const country1 = ct.getCountry(country_short);
       console.log(country1);
       console.log('country1');
       var tz='';
       var timezonedata='';
      var utc_offset='';
       if(country1){
         tz=country1.timezones[0];
         timezonedata = ct.getTimezone(tz);
        utc_offset= timezonedata.utcOffsetStr;
      }


      
      console.log('sql2 start ');
 var sql2 = "SELECT id from specialist_private where email='"+email+"'";
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
    if(memberArray2.length==0){ 
          var sql3 = "insert into specialist_private (first_name, last_name,email,country_id,city_id,newsletter_trigger,password,std_code,mobile,created_at,timezone,utc_offset_string) value ('"+name+"','"+surname+"','"+email+"','"+country+"','"+city+"','"+newsletter+"',md5('"+password+"'),'"+stdcode+"','"+mobilenumber+"',now(),'"+tz+"','"+utc_offset+"')";
          console.log('insert');
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

            console.log(Result.insertId);
             var user_id = Result.insertId;  
             var link =  process.env.WEBURL+'/specilistconfirmation?str='+crypto.createHash('md5').update(user_id.toString()).digest('hex');
             console.log('link');
             console.log(link);
            var data = {
                Status: true, 
                Message: 'Registration Done2',
                SpecialistId:user_id
            }; 

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              secure: false,
              auth: {
                user: 'cresoluser@gmail.com', // here use your real email
                pass: 'gbhrsgnkuxevramp' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
              }
            }); 

            var mailOptions = {
              from: 'cresoluser@gmail.com',
              to: email,
              subject: 'Welcome to Medaloha :Confirmation links ',
              html: 'Please click on this link for confirmation your account '+'<a href="'+link+'" > Confirm your account</a>'
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                  alert(error);
                console.log(error);
              } else {
                  alert('email sent');
                console.log('Email sent: ' + info.response); 
              }

            }); 

            if(newsletter){
              var mailOptions = {
                from: 'cresoluser@gmail.com',
                to: email,
                subject: 'Medaloha :Subscription to newsletter',
                html: 'Dear Specialist, Thanks for Subscription'
              }; 
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error); 
                } else {
                  console.log('Email sent: ' + info.response); 
                } 
              }); 
             }

           //   var  logStatus=1;
           // globalVar.data.dbLogs(req,data,logStatus,apiName,res); // DB Logs function 
            res.end(JSON.stringify(data));    
          });  
           // res.end(JSON.stringify(req.body)); 
    } else{ 
      var data = {
        Status: false, 
        Message: 'Email already in use2.'  
    }; 
     //var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
     res.end(JSON.stringify(data));
     return false; 
    }
  }); 
});


module.exports = router;
