const router = require("express").Router();
const pool = require('../dbconfig/database.js'); // db connection file
var nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config();
var globalVar = require('../global/global.js'); 


router.get('/SpecialistFilterData', async function (req, res) { 
    console.log(req.query);
    var  apiName  = 'SpecialistFilterData';   
    var name = req.query.name;
    console.log(name);
    var field = req.query.field;
    var location = req.query.location;
    var tag = req.query.tags;
    var healthdegree = req.query.healthcheck;
    var universitydegree = req.query.universitycheck; 
    var events_date = req.query.events;   
    console.log(events_date); 
    console.log(healthdegree); 
    console.log(universitydegree);
  
  if(healthdegree=='true'){ 
     healthdegree = 1 ; 
  }
  console.log(healthdegree);

  if(universitydegree=='true')
    universitydegree = 1 ;  

    var sortcolumn = req.query.sortcolumn; 
    var language_code =  req.query.language_id; 
   //connect to the database
     language_id = await globalVar.data.getLanguageIdByCode(language_code);
    
    console.log(req.query);
    
 // var sql2 = "SELECT   GROUP_CONCAT (DISTINCT specialist_public_consultations.provided_type) AS provided_type ,specialist_private.healthcare_university_degree, specialist_private.id as specialist_private_id,specialist_private.first_name , countries.country_name, cities.city_name,specialist_public_intros.profile_photo,specialist_public_intros.id as specialist_public_intro_id,specialist_public_intros.your_title,specialist_public_intros.your_studies FROM `specialist_private` LEFT JOIN specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN specialist_tags on (specialist_tags.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN tags on(tags.id=specialist_tags.tags) LEFT JOIN specialist_holistics on  (specialist_holistics.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN categories on(categories.id=specialist_holistics.holistic_name) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id)  LEFT JOIN cities ON (cities.id=specialist_public_intros.city_id) left join specialist_public_consultations on (specialist_public_consultations.specialist_id=specialist_private.id)   where specialist_private.status=6"; 
   var sql2 = "SELECT   GROUP_CONCAT (DISTINCT specialist_public_consultations.provided_type) AS provided_type ,specialist_private.healthcare_university_degree, specialist_private.id as specialist_private_id,specialist_private.first_name , countries.country_name, cities.city_name,specialist_public_intros.profile_photo,specialist_public_intros.id as specialist_public_intro_id,specialist_public_intros.your_title,specialist_public_intros.your_studies FROM `specialist_private` LEFT JOIN specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN specialist_tags on (specialist_tags.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN tags on(tags.id=specialist_tags.tags) LEFT JOIN specialist_holistics on  (specialist_holistics.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN categories on(categories.id=specialist_holistics.holistic_name) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id)  LEFT JOIN cities ON (cities.id=specialist_public_intros.city_id) left join specialist_public_consultations on (specialist_public_consultations.specialist_id=specialist_private.id) left join  reviews on (reviews.specialist_id=specialist_private.id)  left join  events on (events.specialist_id=specialist_private.id)   where specialist_private.status=6 and specialist_public_consultations.specialist_id!=0 and specialist_public_intros.country_id!=0 and specialist_public_intros.language_id="+language_id;
  if(name)
  {
     sql2= sql2+' and (specialist_private.first_name LIKE "%'+name+'%" or specialist_private.last_name LIKE "%'+name+'%"  or categories.category_name LIKE "%'+name+'%")';
  } 
  if(location)
  {
    sql2= sql2+' and (countries.country_name="'+location+'" OR cities.city_name="'+location+'")';
  } 
  if(tag)
  {
    sql2= sql2+' and (specialist_tags.tags="'+tag+'")';
  } 
  if(field)
  {
    sql2= sql2+' and (categories.category_name="'+field+'")';
  }
  
  if(healthdegree==1)
  {
     sql2= sql2+' and (specialist_private.healthcare_university_degree="'+healthdegree+'")';
  }
  
  if(universitydegree==1)
  {
    sql2= sql2+' and (specialist_private.university_degree="'+universitydegree+'")';
  }
  
    
  if(sortcolumn=='Written')
  {
    sql2= sql2+' and (specialist_public_consultations.provided_type) IN (1,2,3)';
  } 
  
  if(sortcolumn=='Audio')
  {
    sql2= sql2+' and (specialist_public_consultations.provided_type) IN (7,8,9)';
  }   
  
  if(sortcolumn=='Person')
  {
    sql2= sql2+' and (specialist_public_consultations.provided_type) IN (10,11,12)';
  }  
  if(sortcolumn=='Video')
  {
    sql2= sql2+' and (specialist_public_consultations.provided_type) IN (4,5,6)';
  }  
  
 if(events_date!='null')
  {
    sql2= sql2+' and (DATE(events.event_date)>="'+events_date+'")';
  }
  
  
  sql2= sql2+' group by specialist_private.id';
  
   
  if(sortcolumn=='Rating')
  {
    sql2= sql2+' ORDER BY reviews.review_star DESC';
  } 

  if(sortcolumn=='Price')
  {
    sql2= sql2+' ORDER BY specialist_public_consultations.public_price DESC';
  }  
  
 if(sortcolumn=='Count')
  {
    sql2= sql2+' ORDER BY COUNT(reviews.review_star) DESC';
  }  

 if(sortcolumn=='Surname')
  {
    sql2= sql2+' ORDER BY specialist_private.last_name DESC';
  }  

  console.log(sql2);
  
  pool.query(sql2, async function (err2, result, fields) {
     if(err2)
       { 
         console.log(err2); 
         var data = {
            Status: false, 
            Message: 'Something wroing in query.'+sql2,
            Error:err2,
  
          }; 
         //var logStatus = 0;
         //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
         res.end(JSON.stringify(data));
         return false;
        }
  
 
   var myJSON = JSON.stringify(result);
   var Result = JSON.parse(myJSON); 
   var SepcialistFilterData=[];
    if(Result.length){   
          for(var i =0 ;i<Result.length;i++) 
          {    
 
            var PriceArray =   await globalVar.data.GetSpecialistPrice(Result[i].specialist_private_id); 
            var Tabs =   await globalVar.data.GetTagsnamebyID(Result[i].specialist_public_intro_id); 
            var RatingData =   await globalVar.data.GetSpecialistRatingCountAvg(Result[i].specialist_private_id); 
           var MessageData =   await globalVar.data.GetSpecialistMessageData(Result[i].specialist_private_id);
           var OthersData =   await globalVar.data.GetSpecialistOthersData(Result[i].specialist_private_id);

             console.log('RatingData'); console.log(RatingData);

            princestring = '';
            if(PriceArray[0]['HighestPrice']!=null){
              princestring = '$'+PriceArray[0]['LowPrice']+'-$'+PriceArray[0]['HighestPrice']
            } 


           // process.env.APIURL+"/public/uploads/docs/profileresize/"+Result[i].profile_photo
            if(Result[i].profile_photo!=null)
            ProfileImage=process.env.APIURL+"/public/uploads/docs/profileresize/"+Result[i].profile_photo;
            else
            ProfileImage='/assets/img/doctors/doctor-thumb-02.jpg';

                var HolesticArray =  await  globalVar.data.GetSpecialistHolestic(Result[i].specialist_public_intro_id);
                  SepcialistFilterData.push({ 
                  SpecialistPublicIntroId:Result[i].intro_id,
                  SpecialistPublicPrivateID:Result[i].specialist_private_id,
                  SpecialistPublicProfileURL:'/specialistDetails/'+Result[i].specialist_private_id,
                  SpecialistName:Result[i].first_name,
                  SpecialistPic:ProfileImage,
                  SpecialistTitle:Result[i].your_title, 
                  SpecialistHolestic: HolesticArray, 
                  SpecialistCountry:Result[i].country_name,
                  SpecialistCity:Result[i].city_name,
                  SpecialistTitle:Result[i].your_title,
                  SpecialistStudy:Result[i].your_studies,
                  HealthCareuniversitydegree:Result[i].healthcare_university_degree,
                  Princestring:princestring ,
                  Tabs:Tabs,
                  LengendId:Result[i].provided_type, 
                  SpecilistRatingCount : RatingData.Count,
                  SpecilistRatingAvg : RatingData.Avg,
                  SpecilistRatingAvgPer : RatingData.AvgPer,
                  MessageData : MessageData,
                  OthersData : OthersData 
                 
                 })
  
          }}

           var data = {
              Status: true, 
              Result: SepcialistFilterData 
            };  
            res.end(JSON.stringify(data));  
    })
 });  




router.post('/UserFavSpecialist', function (req, res) { 
  var  apiName  = 'UserFavSpecialist';   
  var user_id = req.body.user_id;
  var specialist_id = req.body.specialist_id;
  var status =  1; // default fav should active  

 //connect to the database 

  var sql2="select * from user_favourite_specialists where user_id="+user_id+" and specialist_id="+specialist_id; 
  console.log(sql2);
    pool.query(sql2, function (err2, result, fields) {  
   if(err2)
     { 
      // console.log(err3); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql2,
          Error:err2
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }

      if(result.length<1)
      { 
 var sql3 = "insert into user_favourite_specialists(user_id, specialist_id,status) value ('"+user_id+"','"+specialist_id+"','"+status+"')";
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
      var data = {
         Status: true, 
         Message: 'User Favourite Specialist Done' 
     };  
     res.end(JSON.stringify(data));   

   });
 }  else { 

  var sql4 = "update user_favourite_specialists set status="+status+" where user_id="+user_id+" and specialist_id="+specialist_id;
 pool.query(sql4, function (err4, result, fields) {

 if(err4)
     { 
       console.log(err4); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.'+sql4,
          Error:err4
        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      }
     var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 
      var data = {
         Status: true, 
         Message: 'Specialist already in your Favourite list.' 
     };  
     res.end(JSON.stringify(data));   
   });
 }

      
  });  
   
});






router.get('/UserFavouriteSpecialistRemove', async function (req, res) { 
  var  apiName  = 'UserFavouriteSpecialistRemove';  
  var f_id =  req.query.f_id; 
  var sql2 = "delete from user_favourite_specialists where id='"+f_id+"'";
  console.log('consultation query sql'); 
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
        Message: 'Removed.', 

      }; 
     //var logStatus = 0;
     //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
     res.end(JSON.stringify(data));
     
   }); 
}); 


router.get('/UserFavouriteSpecialistListing', async function (req, res) { 
  console.log(req.query.user_id);
  var  apiName  = 'UserFavouriteSpecialistListing';   
  var UserID = req.query.user_id;  //connect to the database
   
var sql2 = "SELECT GROUP_CONCAT(DISTINCT specialist_public_consultations.provided_type) AS provided_type,user_favourite_specialists.id AS Fid,specialist_private.healthcare_university_degree, specialist_private.id as specialist_private_id,specialist_private.first_name , countries.country_name, cities.city_name,specialist_public_intros.profile_photo,specialist_public_intros.id as specialist_public_intro_id,specialist_public_intros.your_title,specialist_public_intros.your_studies FROM `specialist_private` left join specialist_public_consultations on (specialist_public_consultations.specialist_id=specialist_private.id) LEFT JOIN specialist_public_intros on (specialist_public_intros.specialist_id=specialist_private.id) LEFT JOIN specialist_tags on (specialist_tags.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN tags on(tags.id=specialist_tags.tags) LEFT JOIN specialist_holistics on  (specialist_holistics.specialist_public_intro_id=specialist_public_intros.id) LEFT JOIN categories on(categories.id=specialist_holistics.holistic_name) LEFT JOIN countries ON (countries.id=specialist_public_intros.country_id)  LEFT JOIN cities ON (cities.id=specialist_public_intros.city_id) left join user_favourite_specialists on (specialist_private.id =user_favourite_specialists.specialist_id) where user_favourite_specialists.user_id='"+UserID+"' group by  user_favourite_specialists.specialist_id"; 
console.log('sql2');
console.log(sql2);
console.log(UserID);

pool.query(sql2, async function (err2, result, fields) {
   if(err2)
     { 
       console.log(err2); 
       var data = {
          Status: false, 
          Message: 'Something wroing in query.',
          Error:err2,

        }; 
       //var logStatus = 0;
       //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
       res.end(JSON.stringify(data));
       return false;
      } 

      var myJSON = JSON.stringify(result);
      var Result = JSON.parse(myJSON); 

      var SepcialistFilterData=[];
    if(Result.length){   
          for(var i =0 ;i<Result.length;i++) 
          {     
            var PriceArray =   await globalVar.data.GetSpecialistPrice(Result[i].specialist_private_id); 

            var Tabs =   await globalVar.data.GetTagsnamebyID(Result[i].specialist_public_intro_id); 
            var RatingData =   await globalVar.data.GetSpecialistRatingCountAvg(Result[i].specialist_private_id); 
            console.log(Tabs);

          var MessageData =   await globalVar.data.GetSpecialistMessageData(Result[i].specialist_private_id);
           var OthersData =   await globalVar.data.GetSpecialistOthersData(Result[i].specialist_private_id);


            princestring = '';
            if(PriceArray[0]['HighestPrice']!=null){
              princestring = '$'+PriceArray[0]['LowPrice']+'-$'+PriceArray[0]['HighestPrice']
            } 


            if(Result[i].profile_photo!=null)
            ProfileImage=process.env.APIURL+"/public/uploads/docs/profileresize/"+Result[i].profile_photo;
            else
            ProfileImage='/assets/img/doctors/doctor-thumb-02.jpg';

                var HolesticArray =  await  globalVar.data.GetSpecialistHolestic(Result[i].specialist_public_intro_id);
                  SepcialistFilterData.push({ 
                  SpecialistPublicIntroId:Result[i].intro_id,
                  SpecialistPublicPrivateID:Result[i].specialist_private_id,
                  SpecialistPublicProfileURL:'/specialistDetails/'+Result[i].specialist_private_id,
                  SpecialistName:Result[i].first_name,
                  SpecialistPic:ProfileImage,
                  SpecialistTitle:Result[i].your_title, 
                  SpecialistHolestic: HolesticArray, 
                  SpecialistCountry:Result[i].country_name,
                  SpecialistCity:Result[i].city_name,
                  SpecialistTitle:Result[i].your_title,
                  SpecialistStudy:Result[i].your_studies,
                  HealthCareuniversitydegree:Result[i].healthcare_university_degree,
                  Princestring:princestring ,
                  Tabs:Tabs,
                  Fid:Result[i].Fid,
                   SpecilistRatingCount : RatingData.Count,
                  SpecilistRatingAvg : RatingData.Avg,
                  SpecilistRatingAvgPer : RatingData.AvgPer,
                  LengendId:Result[i].provided_type,
                  MessageData : MessageData,
                  OthersData : OthersData 
                 
                 })
  
          }}


      var data = {
         Status: true, 
         Message: 'User Favourite Specialist Listing',
         Data: SepcialistFilterData 
     };  
     res.end(JSON.stringify(data)); 


})

      
  }); 



  router.post('/addReview', function (req, res) { 
    var  apiName  = 'addReview';   
    var user_id = req.body.user_id;
    var specialist_id = req.body.specialist_id;
    var recommend_status = req.body.recommend_status; 
    var review_desc = req.body.review_desc; 
    var review_star = req.body.review_star; 
    var specialist_country_id = req.body.specialist_country_id; 
  
   //connect to the database
    var sql2="select * from reviews where user_id="+user_id+" and specialist_id="+specialist_id;
  
    var sql3 = "insert into reviews(user_id, specialist_id,recommend_status,review_desc,review_star,created_at,review_status,specialist_country_id) value ('"+user_id+"','"+specialist_id+"','"+recommend_status+"','"+review_desc+"','"+review_star+"','"+new Date()+"',1, '"+specialist_country_id+"')";
      console.log('review query');
      console.log(sql2);
  
  var sql4 = "update booking_histories set review_status=1 where user_id="+user_id+" and specialist_id="+specialist_id;
      console.log('review query');
      console.log(sql2); 
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
  
   pool.query(sql4, function (err3, result, fields) {
  
   })
  
   var SpecialistEmail = globalVar.data.GetSpecialistEmailbyid(specialist_id);
 
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
  
   var myJSON = JSON.stringify(result);
        var Result = JSON.parse(myJSON); 
        var data = {
           Status: true, 
           Message: 'User Specialist Review Done' 
       };  
       res.end(JSON.stringify(data));   
  
   });
  
       
        
   // });  
     
  });
  



 router.get('/GetTestimonialListing', function (req, res) { 
   
    var  apiName  = 'GetTestimonialListing';   
    var sql2 = "SELECT  text_author,text_comment,status from  testimonial  where  1 and status=1";
    
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
        var memberArray2 = JSON.parse(myJSON); 


        TestimonialFeatured=[];
        if(memberArray2.length){    
            for(var i =0 ;i<memberArray2.length;i++) 
            {   
          
               TestimonialFeatured.push({  
                TextAuthor:memberArray2[i].text_author, 
                TextComment:memberArray2[i].text_comment, 
                Status: memberArray2[i].status,  
                
            })
         }

         // console.log(SepcialistFeatured);
          var data = {
            Status: true, 
            Data: TestimonialFeatured 
          };  
          res.end(JSON.stringify(data)); 
        } 
   })
 }); 




  router.get('/userpastSpecialistReviewListing', function (req, res) { 
    console.log(req.query.user_id);
    var  apiName  = 'userpastSpecialistReviewListing';   
    var user_id = req.query.user_id;
    var sql2 = "SELECT replies.reply_desc,reviews.*,reviews.id as review_id,users.id as u_id,users.user_image as u_image,users.first_name as u_first_name,users.last_name as u_last_name,specialist_private.first_name,specialist_private.last_name ,specialist_public_intros.profile_photo from reviews left join specialist_private on specialist_private.id=reviews.specialist_id  left join specialist_public_intros on specialist_public_intros.specialist_id=reviews.specialist_id   left join users on users.id=reviews.user_id left join replies on replies.review_id=reviews.id where  reviews.specialist_country_id= specialist_public_intros.country_id and reviews.user_id="+user_id+ " ";
    
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
        var memberArray2 = JSON.parse(myJSON); 


        SepcialistFeatured=[];
        if(memberArray2.length){    
            for(var i =0 ;i<memberArray2.length;i++) 
            {   
            
            

               if(memberArray2[i].u_image==="")
               var user_pics = "doctor-thumb-02.jpg";
               else 
               var user_pics = memberArray2[i].u_image; 


               SepcialistFeatured.push({  
                UserPic:user_pics,
                UserName:memberArray2[i].u_first_name+' '+memberArray2[i].u_last_name, 
                ReviewCreated:memberArray2[i].created_at, 
                RecommandStatus: memberArray2[i].recommend_status,  
                ReviewStar:memberArray2[i].review_star,
                ReviewDescription:memberArray2[i].review_desc,
                ReplyId:memberArray2[i].reply_id,  
                SpecilistPic:process.env.APIURL+"/public/uploads/docs/"+memberArray2[i].profile_photo,
                SpecialistName:memberArray2[i].first_name+' '+memberArray2[i].last_name, 
                ReplyDescription:memberArray2[i].reply_desc,
            })
         }

         // console.log(SepcialistFeatured);
          var data = {
            Status: true, 
            Data: SepcialistFeatured 
          };  
          res.end(JSON.stringify(data)); 
        } 
   })
 }); 



 router.get('/SpecialistListingUserReview', function (req, res) { 
      console.log(req.query.user_id);
      var  apiName  = 'SpecialistListingUserReview';   
      var user_id = req.query.user_id;
      var sql2 = "SELECT DISTINCT (booking_histories.specialist_id),specialist_private.first_name,booking_histories.review_status, specialist_private.last_name ,specialist_private.country_id, specialist_private.timezone  from booking_histories   left join specialist_private on specialist_private.id= booking_histories.specialist_id where booking_histories.review_status=0 and booking_histories.user_id="+user_id;
      
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
          
          
    var finalData = []
          Result.forEach(element => {
            var date = moment(element['session_date']).format('YYYY-MM-DD'); 
            if(element['rebook_session_date1']!=null)
            var date = moment(element['rebook_session_date1']).format('YYYY-MM-DD'); 
            finalData.push({'specialist_id':element['specialist_id'],'country_id':element['country_id'] ,'ListData':element['first_name']+' '+element['first_name'] +'-'+date})
          });

          var data = {
             Status: true, 
             Message: 'User Review Specialist Listing',
             Data: finalData,
             Query:sql2
         };  
         res.end(JSON.stringify(data)); 
    
    
    
    })
    
    });



 router.get('/GetLanguageIdByCountryCode', function (req, res) { 
  console.log(req.query.countryCode);
  var  apiName  = 'GetLanguageIdByCountryCode';   
  var countryCode = req.query.countryCode;
  var sql2 = "SELECT languages.language_code FROM `multiple_country_with_languages` join countries ON (countries.id=multiple_country_with_languages.country_id) left join languages on (languages.id=multiple_country_with_languages.language_id) WHERE countries.country_code ='"+countryCode+"'";
  
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
      if(Result.length){
          var data = {
            Status: true, 
            Message: 'Done Coming From Db',
            LanguageCode: Result[0]['language_code'] 
        };  
        res.end(JSON.stringify(data)); 
      } else {
        var data = {
          Status: true, 
          Message: 'Done Default lanaguage Code ',
          LanguageCode: 'eng'
      };  
      res.end(JSON.stringify(data)); 

      }
     


})

});


    router.post('/addSignupNewsletter', function (req, res) { 
      var  apiName  = 'addSignupNewsletter';    
      var name = req.body.name;
      var email = req.body.email; 
     //connect to the database
      var sql2="select * from signup_newsletter where email='"+email+"'"; 
      var sql3 = "insert into signup_newsletter(name, email) value ('"+name+"','"+email+"')";
        console.log('review query');
        console.log(sql3); 
    
        //return false;
        pool.query(sql2, function (err2, result, fields) {
    
          console.log(result.length);
    
       if(err2)
         { 
           console.log(err3); 
           var data = {
              Status: false, 
              Message: 'Something wroing in query.'+sql2,
              Error:err2
            }; 
           //var logStatus = 0;
           //globalVar.data.dbLogs(req,data,logStatus,apiName); // DB Logs function 
           res.end(JSON.stringify(data));
           return false;
          }
    
          if(result.length<1)
          {
     
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
          var data = {
             Status: true, 
             Message: 'Sign-up Newsletter Done' 
         };  

         var transporter = nodemailer.createTransport({
          service: 'gmail',
             auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }
        });
  
        var mailOptions = {
          from: 'nitesh@cresol.in',
          to: email,
          subject: 'Sign-up Newsletter',
          html: 'Dear , your Sign-up Newsletter have been updated.'
        };
  
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response); 
          }
  
        }); 

         res.end(JSON.stringify(data));   
    
     });
    
          }
        
    else
    {
        //  var data = {
        //      Status: true, 
        //      Message: 'Email Already Exist' 
        //  };  
        
         var data = {
             Status: false, 
             Message: 'Newsletter Already Enabled' 
         };  
         
         res.end(JSON.stringify(data));  
    
    }
    
      
    
          
      });  
       
    });


     router.post('/addAboutContact', function (req, res) { 
      var  apiName  = 'addAboutContact';    
      var name = req.body.name;
      var email = req.body.email;
      var message = req.body.message; 
      
     //connect to the database
     // var sql2="select * from suggestions where email='"+email+"'";
      var sql3 = "insert into suggestions(name, email,message,created_at) value ('"+name+"','"+email+"','"+message+"',now())";
        console.log('review query');
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
          var data = {
             Status: true, 
             Message: 'User Contact Done' 
         };  

         var transporter = nodemailer.createTransport({
          service: 'gmail',
           auth: {
            user: 'ajay@cresol.in', // here use your real email
            pass: 'petipa@#$' // put your password correctly (not in this question please) // put your password correctly (not in this question please)
          }

        });
  
        var mailOptions = {
          from: 'nitesh@cresol.in',
          to: email,
          subject: 'Sign-up Suggestion',
          html: 'Dear , your Sign-up Suggestion have been updated.'
        };
  
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response); 
          }
  
        }); 
         res.end(JSON.stringify(data));   
    
     }); 
    });
 module.exports = router;
     