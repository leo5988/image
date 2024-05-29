const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;
const portPath = 'taimaligebi.ddns.net:8000/';

//Multer middleware for handling file uploads
const upload = multer({dest: 'uploads/'});

const db = mysql.createConnection({
      host: 'taimaligebi.ddns.net',
      post: '3306',
      user: 'leo5988',
      password: 'g5248112',
      database: 'HtmlTest'
});

db.connect((err) => {
      if (err){ console.log("連線失敗")}
      else {console.log("連線成功")}
});
//上傳圖片
//API endpoint for uploading name and photo
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.post('/upload', upload.single('image'),(req, res)=>{
  const{ name } = req.body;
  const imagePath = req.file.path;

//Save name and photo path to MySQL
  const sql = 'INSERT INTO HtmlTest.flutterPicture(name, image_path) VALUES (?,?)';
db.query(sql, [name,imagePath], (err, result) => {
 if(err) {

   console.error('Error upload data:',err);
   res.status(500).send('Error uploading data');
  }else{
   console.log('Data uploaded successfully');
   res.status(200).send('Data  uploaded successfully');
  }
 });
 });
//下載圖片
app.get('/download',(req, res) => {
  //const{phoneSerialNumber} = req.body;
  const phoneSerialNumber = req.query.phoneSerialNumber;
  console.log(phoneSerialNumber);
  const sql = 'SELECT * FROM HtmlTest.flutterPicture WHERE phoneSerialNumber = ?';
  console.log(sql);
   db.query(sql,[phoneSerialNumber],(err,results) => {
 if(err){
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
      return;
   }
 if(results.length === 0){
      res.status(404).send('Photo not found');
      return;
   }
 try{    
 const data = {
         name:results[0].name,
         image_path:results[0].image_path,
         phoneSerialNumber:results[0].phoneSerialNumber,
         };
       res.json(data);
       console.log(data);

     } catch(error){

            console.error('Error reading file:',error.message);
            res.status(500).send('Internal Server Error');

             }

console.log(phoneSerialNumber);
    



});
});
//地圖查詢
app.get('/search',(req, res) => {
   
   const  name = req.query.name;   
 
    const sql = 'select HtmlTest.peoplePosition.locationMessage,HtmlTest.flutterPicture.image_path,HtmlTest.flutterPicture.phoneSerialNumber, HtmlTest.peoplePosition.currentAddress,HtmlTest.peoplePosition.locationTime from HtmlTest.peoplePosition join HtmlTest.flutterPicture on HtmlTest.peoplePosition.locationName = HtmlTest.flutterPicture.name where HtmlTest.peoplePosition.locationName = ? order by HtmlTest.peoplePosition.idposition desc , HtmlTest.flutterPicture.idflutterPicture desc limit 1'; 
 
  
 db.query(sql,[name],(error, results) => {
    if(error) {
       console.error(error);
       res.status(500).json({error: 'Internal server error'});
     }else{
         //時間格式修改
         const formattedResults = results.map(result => {
          const originalDateTime = results[0].locationTime;
          return new Date(originalDateTime).toLocaleString();
          });
           const formattedResultsString = formattedResults.join(',');
         //地址空補NULL
          const addressResults = results.map(result => {
           const valueAddress = results[0].currentAddress !== null ? results[0].currentAddress : 'Null';
           return valueAddress;}).join(',');
       try{
       const dataphoneSerialNumber = {
            locationMessage: results[0].locationMessage,
            image_path:results[0].image_path,
           // currentAddress:results[0].currentAddress,
            currentAddress:addressResults,
          // locationTime:results[0].locationTime,
            locationTime:formattedResultsString,
           };
          // res.json(data);
             res.json(dataphoneSerialNumber);
         console.log(dataphoneSerialNumber);

      }catch(error){

            console.error('Error reading file:',error.message);
             }
     }

 });
 });
//查詢歷史資料
app.get('/searchData',(req,res) => {
   const name = req.query.name;
   console.log(name);
   const query = 'SELECT locationTime,currentAddress,locationMessage FROM HtmlTest.peoplePosition WHERE locationName = ?';

   db.query(query,[name],(error, results) =>{
   if(error){
      console.error(error);
      res.status(500).json({error: 'Internal server error'});
     }else{
         let data = [];
         for(let i = 0;i < results.length; i++){
          //時間格式修改
            const originalDateTime = results[i].locationTime;

           data.push({
              locationTime:formattedDateTime = new Date(originalDateTime).toLocaleString(),
              currentAddress:results[i].currentAddress,
              locationMessage:results[i].locationMessage,
           });
          }
         res.json(data);
        console.log(data);
        }
});
});
//查詢時閘
app.get('/searchDate',(req,res) => {
   const name = req.query.name;
   const time = req.query.time;
   const query = 'SELECT locationTime,currentAddress,locationMessage FROM HtmlTest.peoplePosition WHERE locationName = ? AND locationTime > ?';
   console.log(time);
   db.query(query,[name,time],(error, results) =>{
   if(error){
      console.error(error);
      res.status(500).json({error: 'Internal server error'});
     }else{

         let data = [];
         for(let i = 0;i < results.length; i++){
          //時間格式修改
            const originalDateTime = results[i].locationTime;

         data.push({
              locationTime:formattedDateTime = new Date(originalDateTime).toLocaleString(),
              currentAddress:results[i].currentAddress,
              locationMessage:results[i].locationMessage,
           });
          }
         res.json(data);
        console.log(data);
        }
});
});




//查詢全部朋友
app.get('/searchFriend',(req,res) =>{
   const query = 'select t1.locationName,t1.idposition,t1.phoneSerialNumber,t1.locationMessage,t1.currentAddress,t1.locationTime,t2.image_path, t2.idflutterPicture as idflutterPicture from HtmlTest.peoplePosition as t1 inner join HtmlTest.flutterPicture as t2 on t1.locationName = t2.name where (t1.locationName,t1.idposition)in(select locationName,max(idposition)as last_id from HtmlTest.peoplePosition group by locationName)and (t2.name,t2.idflutterPicture)In(select name,max(idflutterPicture) as last_id from HtmlTest.flutterPicture group by name);'
   db.query(query,(error, results) =>{
   if(error){
     console.error(error);
     res.status(500).json({error:'Internal server error'});
    }else{
         let data = [];
         for(let i = 0;i < results.length; i++){
         const originalDateTime = results[i].locationTime;
         data.push({
         locationName:results[i].locationName,
         locationTime:formattedDateTime = new Date(originalDateTime).toLocaleString(),
         currentAddress:results[i].currentAddress,
         locationMessage:results[i].locationMessage,
         image_path:results[i].image_path,
         });
        }
        res.json(data);
        console.log(data);
      }
});
});
app.listen(port, () => {
 console.log('Server is running on port ${post}');

});


//port 8000 下載照片
const http = require('http');
const fs = require('fs');
//const path = require('path');
const PORT = 8000;
const PHOTO_DIRECTORY ='/var/www/html/';
const server = http.createServer((req,res) => {
   const filePath = path.join(PHOTO_DIRECTORY, req.url);

   fs.readFile(filePath, (err,data) => {
    if(err) {
       if(err.code === 'ENOENT'){
          res.writeHead(404);
          res.end('File not found!');
         }else {
          res.writeHead(500);
          res.end('Server Error: ${err.code}');
         }
       }else{
           res.writeHead(200, {'Content-Type': 'image/jpeg'});
           res.end(data);
       }
     });
   });


   server.listen(PORT,() => {
    console.log('Server running on port ${PORT}');
  });


