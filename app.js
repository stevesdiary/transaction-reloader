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
         CSVToJSON().fromFile('./user.csv').then(jsonArray =>{
            console.log('user list = ',jsonArray)
            let count =0;
            for(let item of jsonArray){
               let obj = {};
               obj.hash = null;
               obj.body = {
                  "accountType": "SAVINGS",
                  "acquiringInstCode": "200018",
                  "amount": item.amount,
                  "authCode": "",
                  "cardExpiry": "2502",
                  "cardHolder": "AK/SAMSON",
                  "cardLabel": "Master card",
                  "maskedPan": item.maskedPan,
                  "merchantId": item.merchantId,
                  "originalForwardingInstCode": "627629",
                  "responseCode": item.responseCode,
                  "rrn": item.rrn,
                  "terminalId": item.terminalId,
                  "transactionType": "PURCHASE",
                  "transmissionDateTime": item.transactionDate,
                  "responseMessage": item.responseMessage
               }
               console.log('obj '+count++,obj);
            }
         })
      }catch(err){
         console.log(err)
      }
   
         const json = csvToJson.getJsonFromCsv('./uploads/'+req.file.filename);
        // console.log ("Result:" ,json);
        // return;

        // for(item of)

         const key = Object.keys(json[0])
         // const key = 'merchantId,terminalId,maskedPan,stan,rrn,currency,amount,transactionDate,responseCode,responseMessage'
         
         json.forEach((element) => {
            const rrn  = element[key].split(",")[4]
            const merchantId = element[key].split(",")[0]
            const terminalId = element[key].split(",")[1]
            const rawData = element[key].split(",")
            
            const query = `INSERT INTO transaction (merchantId, terminalId, rrn, rawData) VALUES ('${merchantId}', '${terminalId}', '${rrn}', '${rawData}')` 

            connection.query(query, (err, result) => {
               if (err){
                  console.log ("Error in inserting into transaction table", err)
               }
            })
            const status = 1
            const send_data = `SELECT rawData FROM transaction WHERE rrn = '${rrn}'`
            const send = connection.query(send_data)
            const sql = `UPDATE transaction SET status = '${status}' WHERE rrn = '${rrn}'`
            let data = [false, 1];
            connection.query(send_data, (err, result) => {
               if (err) {console.log(err)}
               else{
                  // console.log("RESULT: ", key, "RRDDD: ",rawData)
                  // arrayOfStrings= (key[0].split(","));
            }

            


            
            // let keys = ['merchantId','terminalId','maskedPan','stan','rrn','currency','amount','transactionDate','responseCode','responseMessage'];
            // json.split
            // let answer = keys.split(",")
            // console.log("Answer: ",answer)
            // let mainArray = [];
            // for (let value of keys) {
            //    let obj = {};
            //    obj.merchantId = "";
            //    obj.id = "";
            //    mainArray.push(obj);
            //    console.log("Answer: ",)
            // }
            // key.forEach(k => {
            //    rawData.forEach(i => {
                  // console.log(i,k)
               // })
            // })
         });





      })
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