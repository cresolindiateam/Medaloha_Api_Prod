var methods = {};
const con = require('../dbconfig/database.js'); // db connection file
var moment = require('moment');
require('dotenv').config();

    


methods.GetSpecialistEmailbyid = (specialist_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT email FROM   specialist_private  where id = '"+specialist_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray[0]['email']); 
        
   }); 
 });
}




methods.deleteoverviewdata = ( specialist_id ,language_id) => {
  return new Promise((resolve, reject) => {    
    var sql2 = "delete from specialist_overivew_details  where specialist_id='"+specialist_id+"' and language_id='"+language_id+"'";
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        } 
        resolve(true);  
   }); 
 });
}



methods.updateSpecilistTimezoneandCountry = (timezone , city_id ,country_id , specialist_id ) => {
  return new Promise((resolve, reject) => {    
    var timezoneString = timezone.split('+');
    var sql2 = "update specialist_private set country_id =  '"+country_id+"', city_id = '"+city_id+"' , timezone = '"+timezoneString[0]+"' ,utc_offset_string ='"+'+'+timezoneString[1]+"'  where id = '"+specialist_id+"' ";
    console.log(sql2);  
    con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        } 
        resolve(true);  
   }); 
 });
}


methods.insertoverviewdata = (message , consultation_id ,specialist_id ,language_id) => {
  return new Promise((resolve, reject) => {    
    var sql2 = "insert into specialist_overivew_details ( specialist_id, language_id ,consultation_id,overview_data) values ('"+specialist_id+"','"+language_id+"','"+consultation_id+"','"+message+"') ";
        console.log(sql2);  
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        } 
        resolve(true);  
   }); 
 });
}


methods.GetEventDatebyID = (event_id) => {
  return new Promise((resolve, reject) => {    
var sql2 = "SELECT event_date FROM `events` where id  = '"+event_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  

        if(PriceArray.length)
        resolve(PriceArray[0]['event_date']); 
        else 
        resolve('');  
   }); 
 });
}




methods.GetEventIDByBookingID = (booking_id) => {
  return new Promise((resolve, reject) => {    
var sql2 = "select event_id from booking_histories  where id  = '"+booking_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  

        if(PriceArray.length)
        resolve(PriceArray[0]['event_id']); 
        else 
        resolve('');  
   }); 
 });
}

methods.UpdateEventBookedbyID = (event_id,status) => {
  return new Promise((resolve, reject) => {    
var sql2 = "update `events` set booking_status='"+status+"' where id  = '"+event_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        } 
        resolve(true);  
   }); 
 });
}



methods.SpecialistExtraWorking = (specialist_id,daystring , startstring , endstring , language_id) => {
  return new Promise((resolve, reject) => {    
       var sql21 = "DELETE FROM `specialist_working_hours` where specialist_id='"+specialist_id+"' and language_id='"+language_id+"'";
       con.query(sql21, (err21, result21, fields21) => {
        if(err21) {
         return reject(err21)
        }

        var workingTime = false;
       
        if(daystring.length){



          daystring.forEach((days, index) => { 

             // workingString += days+'-'+startstring[index]+'-'+endstring[index]; 
           const sql22 = "SELECT COUNT(*) as count  FROM specialist_working_hours WHERE specialist_id = '"+specialist_id+"' AND days = '"+days+"' AND start_time = '"+startstring[index]+"' AND end_time = '"+endstring[index]+"'";
         
 
             con.query(sql22, (err22, result22, fields22) => {
              if(err22)
               {
                 console.error('Error querying database:', err22);
                 return reject(err22);
                 }

             var myJSON22 = JSON.stringify(result22);
                var ocount = JSON.parse(myJSON22);
                if(ocount.length) 
         
        
        
        // Now you can use the overlappingCount variable elsewhere in your code
        if (ocount[0].count  > 0) 
        {
               workingTime = false;
              return reject("multiple");

        }
        else{

             var sql23 = "insert into `specialist_working_hours` (specialist_id,start_time,end_time,days,language_id)values('"+specialist_id+"','"+startstring[index]+"', '"+endstring[index]+"' , '"+days+"'  , '"+language_id+"'  )";
             con.query(sql23, (err23, result23, fields23) => { 
                 workingTime = true;
                 resolve(1);
              }); 
           }


         });

           });  
        }  
        // if(workingTime)
        //   resolve(1); 
        // else 
        //   resolve(0);  
        // return;
   }); 
 });
}



methods.getSpecialistIntroID = (specialist_id,language_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT id from specialist_public_intros where language_id='"+language_id+"' and  specialist_id = '"+specialist_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
       console.log(PriceArray); 
        if(PriceArray.length)
        resolve(PriceArray[0]['id']); 
        else 
        resolve(0);
        
   }); 
 });
}



methods.GetAllHolistic = (language_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT id, category_name , category_image from categories where language_id = '"+language_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray); 
        
   }); 
 });
}


methods.GetAllTags = (language_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT id, tag_name from tags where language_id = '"+language_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray); 
        
   }); 
 });
}



methods.GetSpecialistRatingCountAvg = (specialist_id) => {
  return new Promise((resolve, reject) => {    
    var sql2 = "SELECT reviews.*,reviews.id as review_id,users.id as u_id,users.user_image as u_image,users.first_name as u_first_name,users.email as u_email,users.last_name as u_last_name,specialist_private.email AS semail,specialist_private.first_name,specialist_private.last_name,specialist_public_intros.profile_photo from reviews left join specialist_private on specialist_private.id=reviews.specialist_id left join specialist_public_intros on specialist_public_intros.specialist_id=reviews.specialist_id  left join users on users.id=reviews.user_id where reviews.specialist_id="+specialist_id+" ";
    console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);   
        if(PriceArray.length)
         {
          var totalreviewsum=0;
          PriceArray.forEach((element) => 
          {
            totalreviewsum +=element.review_star 
          });

          var avg=(totalreviewsum==0)?0:Math.round(totalreviewsum/PriceArray.length);
          var avg_per=(avg*100)/5;
          var data = {
             Count: PriceArray.length, 
             Avg: avg, 
             AvgPer : avg_per 
          }; 
           resolve(data); 
         } 
        else {
              var data = {
             Count: 0, 
             Avg: 0, 
             AvgPer : 0 
          }; 
        resolve(data); 
        }

        
   }); 
 });
}



methods.GetUserTimeZoneById = (user_id) => {
  return new Promise((resolve, reject) => {    
var sql2 = "SELECT timezone FROM `users` where id  = '"+user_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        if(PriceArray.length)
        resolve(PriceArray[0]['timezone']); 
        else 
        resolve(''); 
        
   }); 
 });
}

methods.GetSpecialistTimeZoneById = (specialist_id) => {
  return new Promise((resolve, reject) => {    
var sql2 = "SELECT timezone FROM `specialist_private` where id  = '"+specialist_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  

        if(PriceArray.length)
        resolve(PriceArray[0]['timezone']); 
        else 
        resolve(''); 

        
   }); 
 });
}




methods.GetSpecialistOthersData = (specialist_id) => {
  return new Promise((resolve, reject) => {    
    var sql2 = "SELECT events.legend_id ,DATE_FORMAT(events.event_date, '%M %d') as event_date , specialist_public_consultations.public_price FROM `events` LEFT JOIN specialist_public_consultations on (events.legend_id=specialist_public_consultations.provided_type) where DATE(events.event_date)>=CURDATE() and events.specialist_id='"+specialist_id+"' and specialist_public_consultations.specialist_id="+specialist_id;
    console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);   
        if(PriceArray.length)
         {  
             
           var videoCount = 0; var audioCount = 0; var vivoCount = 0;
           var videoDate = ''; var audioDate = ''; var vivoDate = '';
             var videoPrice= 0 ; var audioPrice= 0 ; var vivoPrice= 0 ;
          PriceArray.forEach((element) => 
          {
              
            if(element.legend_id==4){
                 videoCount = 1;
                 videoDate= element.event_date;
                 videoPrice = element.public_price;
                 
                 
            }  
            
            if(element.legend_id==5 || element.legend_id==6 ){
                 videoCount = 2;
            }  
            
            
            
            if(element.legend_id==7){
                    audioCount = 1;
                     audioDate= element.event_date;
                     audioPrice = element.public_price;
            }  
            
              if(element.legend_id==8 || element.legend_id==9){
                 audioCount = 2;
            }  
            
            
            if(element.legend_id==10){
                      vivoCount=1;
                      vivoDate= element.event_date;
                      vivoPrice = element.public_price;
            }  
            
               if(element.legend_id==11 || element.legend_id==12){
                 vivoCount = 2;
            }  
            
            
            
          });
          
             
          var data = { 
            Information : PriceArray ,
            videoCount:videoCount,
            audioCount:audioCount,
            vivoCount:vivoCount,
            videoDate:videoDate,
            audioDate:audioDate,
            vivoDate:vivoDate,
             videoPrice:videoPrice,
            audioPrice:audioPrice,
            vivoPrice:vivoPrice
          }; 
          resolve(data); 
         } 
        else {
               var videoCount = 0; var audioCount = 0; var vivoCount = 0;
                 var videoDate = ''; var audioDate = ''; var vivoDate = '';
                   var videoPrice= 0 ; var audioPrice= 0 ; var vivoPrice= 0 ;
          var data = {
          Information : [],
           videoCount:videoCount,
            audioCount:audioCount,
            vivoCount:vivoCount,
            videoDate:videoDate,
            audioDate:audioDate,
            vivoDate:vivoDate,
            videoPrice:videoPrice,
            audioPrice:audioPrice,
            vivoPrice:vivoPrice
         }; 
         resolve(data); 
        } 
        
   }); 
 });
}

methods.GetSpecialistMessageData = (specialist_id) => {
  return new Promise((resolve, reject) => {    
    var sql2 = "SELECT provided_type,public_price  FROM `specialist_public_consultations` where provided_type in (1) and specialist_id = "+specialist_id;
    console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);   
        if(PriceArray.length)
         { 
          var data = {
            Count: PriceArray.length,  
            Information : PriceArray 
          }; 
          resolve(data); 
         } 
        else {
          var data = {
            Count: 0, 
            Information:[]
         }; 
         resolve(data); 
        } 
        
   }); 
 });
}


methods.GetSpecialistEmailfromBookingByMD5 = (BookingId) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT specialist_private.email FROM `booking_histories` JOIN specialist_private on (specialist_private.id=booking_histories.specialist_id) where md5(booking_histories.specialist_id) = '"+BookingId+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray[0]['email']); 
        
   }); 
 });
}


methods.GetSpecialistEmailfromBooking = (BookingId) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT specialist_private.email FROM `booking_histories` JOIN specialist_private on (specialist_private.id=booking_histories.specialist_id) where booking_histories.id = '"+BookingId+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        
        resolve(PriceArray[0]['email']); 
        
   }); 
 });
}


methods.GetSpecialistEmailById = (specialist_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT email FROM `specialist_private` where id  = '"+specialist_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray[0]['email']); 
        
   }); 
 });
}

methods.GetCountrynamebyID = (country_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT country_name from countries where id = '"+country_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray[0]['country_name']); 
        
   }); 
 });
}



methods.GlobalVerificationMaster = (Password) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT id from master_password where password = '"+Password.trim()+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);
        console.log('finalMasterpassword'); 
        console.log(PriceArray.length); 
        if(PriceArray.length>0)
          resolve(true);
        else 
          resolve(false);

        
   }); 
 });
}


methods.GetCitynamebyID = (city_id) => {
  return new Promise((resolve, reject) => {
        
var sql2 = "SELECT city_name from cities where id = '"+city_id+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray[0]['city_name']); 
        
   }); 
 });
}



methods.GetTagsnamebyID = (specialist_public_intro_id) => {
  return new Promise((resolve, reject) => {
        
    var sql2 = "SELECT tags.tag_name from  specialist_tags left join tags on (tags.id=specialist_tags.tags) where specialist_tags.specialist_public_intro_id="+specialist_public_intro_id;
    console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);  
        resolve(PriceArray); 
        
   }); 
 });
} 

methods.getLanguageIdByCode = (language_code) => {
  return new Promise((resolve, reject) => {

    console.log('logout call me '+language_code);

    if(language_code=='null')
    language_code = 'eng';

    if(language_code=='')
    language_code = 'eng';
        
var sql2 = "SELECT id from languages where language_code = '"+language_code+"'";
console.log(sql2);
       con.query(sql2, (err, result, fields) => {
        if(err) {
         return reject(err)
        }
        var myJSON = JSON.stringify(result);
        var PriceArray = JSON.parse(myJSON);
        console.log(PriceArray); 
        if(PriceArray.length)
        resolve(PriceArray[0]['id']); 
        else 
        resolve(1);
       
        
   }); 
 });
}



methods.GetSpecialistPrice = (specialist_private_id) => {
    return new Promise((resolve, reject) => {
         var sql = "SELECT min(public_price) AS LowPrice, max(public_price) AS HighestPrice  FROM specialist_public_consultations  where specialist_public_consultations.specialist_id='"+specialist_private_id+"'";
         console.log(sql);
         con.query(sql, (err, result, fields) => {
          if(err) {
           return reject(err)
          }
          var myJSON = JSON.stringify(result);
          var PriceArray = JSON.parse(myJSON);  
          resolve(PriceArray); 
          
     }); 
   });
  }


  methods.GetSpecialistHolestic = (specialist_public_intro_id) => {
    return new Promise((resolve, reject) => {
         var sql = "SELECT GROUP_CONCAT(categories.category_name) as holesticString FROM specialist_holistics left join categories on (specialist_holistics.holistic_name=categories.id) where specialist_holistics.specialist_public_intro_id='"+specialist_public_intro_id+"'";
         console.log(sql);
         con.query(sql, (err, result, fields) => {
          if(err) {
           return reject(err)
          }
          var myJSON = JSON.stringify(result);
          var holesticArray = JSON.parse(myJSON);  
          resolve(holesticArray[0]['holesticString']); 
     }); 
   });
  }
 

  methods.GetSpecialistTags = (specialist_public_intro_id) => {
     return new Promise((resolve, reject) => {
          var sql = "select GROUP_CONCAT(tags.tag_name) AS Tags from specialist_tags join tags on (tags.id=specialist_tags.tags) where specialist_tags.specialist_public_intro_id='"+specialist_public_intro_id+"'";
          console.log(sql);
          con.query(sql, (err, result, fields) => {
           if(err) {
             return reject(err)
           }
           var myJSON = JSON.stringify(result);
           var TagsArray = JSON.parse(myJSON);  
           resolve(TagsArray[0]['Tags']); 
      }); 
    });
 }
   
  exports.data = methods;
  