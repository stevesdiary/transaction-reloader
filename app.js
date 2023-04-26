const express = require('express');
const bodyParser = require('body-parser');
const csvToJson = require('convert-csv-to-json');
const CSVToJSON = require('csvtojson');
const env = require('dotenv').config();
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const axios = require('axios');
const multer = require('multer');
const csvToObj = require('csv-to-js-parser').csvToObj;
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(cors());


let connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.USERNAME,
   dialect: process.env.DIALECT,
   password: process.env.DB_PASSWORD,
   port: process.env.PORT,
   database: process.env.DB_NAME
})
connection.connect((err)=>{
   if (err) throw err;
   console.log('Connected to MYSQL server!')
});
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './uploads');
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
      // console.log (Date.now())
   }
});
const multerFilter = (req, file, cb) => {
   if (file.mimetype === 'user.csv') {
      cb(null, true);
   }else{
      cb(new Error('Invalid file type! Upload csv file.'), false);
   }
}
const upload = multer({
   storage: storage,
   limits: {filesize: 10000000},
   filefilter: multerFilter
})

app.post('/upload',  upload.single('file'), async (req, res) => {
   const file = req.body.file
   try{
      try{
         const upload = multer({ dest: 'uploads/' });
      }catch(err){
         console.log(err)
         res.status(404).json({error: err.message, message: 'Invalid file type! Upload csv file.'})
      }
         res.status(200).send({
            statuscode: 200,
            message: 'File sent successfully!'
         })
      try{
         CSVToJSON().fromFile('./uploads/'+req.file.filename).then(jsonArray =>{
            // console.log('Json Array = ',jsonArray)
            let count =0;
            for(let item of jsonArray){
               let obj = {};
               obj.hash = null;
               obj.body = {
                  "accountType": "SAVINGS",
                  "acquiringInstCode": "",
                  "amount": item.amount,
                  "authCode": "",
                  "cardExpiry": "",
                  "cardHolder": "",
                  "cardLabel": "",
                  "maskedPan": item.maskedPan,
                  "merchantId": item.merchantId,
                  "originalForwardingInstCode": "",
                  "responseCode": item.responseCode,
                  "rrn": item.rrn,
                  "terminalId": item.terminalId,
                  "transactionType": "",
                  "transmissionDateTime": item.transactionDate,
                  "responseMessage": item.responseMessage
               }
               console.log('obj '+count++,obj);
               
               const json = csvToJson.getJsonFromCsv('./uploads/'+req.file.filename);
               const key = Object.keys(json[0])
               json.forEach((element) => {
               const rawData = element[key].split(",")
               // console.log(rawData)
               const query = `INSERT INTO transaction (merchantId, terminalId, rrn, rawData) VALUES ('${item.merchantId}', '${item.terminalId}', '${item.rrn}', '${rawData}')` 
               connection.query(query, (err, result) => {
               if (err){
                  console.log ("Error in inserting into transaction table", err)
               }
            
            })
            axios({
               method: 'post',
               url: 'https://fawaya.aellapp.com/merchant',
               data: {
                  obj
               }
            });
            })

         }
         })
   }catch(err){
      console.log(err)
   }

   }catch(err){
      console.log(err);
   }
});

   //To delete processed files in uploads folder

app.post('/delete', async (req, res) => {
   const filePath = './uploads/fileName.txt';

   // Check if the file exists
   if (fs.existsSync(filePath)) {
     // Delete the file
      fs.unlink(filePath, (err) => {
         if (err) {
         console.error(err);
         return;
         }
   
         console.log('File deleted successfully');
      });
   } else {
      console.error('File not found');
   }
});


app.listen(3000, function(){
   console.log('Server listening on port 3000')
});
