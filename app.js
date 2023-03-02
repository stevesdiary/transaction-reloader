const express = require('express');
const bodyParser = require('body-parser');
const csvToJson = require('convert-csv-to-json');
const CSVToJSON = require('csvtojson');
const env = require('dotenv').config();
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const excelToJson = require('convert-excel-to-json');
const cors = require('cors');
const app = express();
const multer = require('multer');
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(cors());

let upload = multer({ 
   destination: (req, file, cb) => {
      cb(null, __basedir + "/uploads/")},
      filename: (req, file, cb) => {
      console.log(file.originalname);
      cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
      },
   });
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

app.post('/data', upload.single('file'), (req, res) => {
   const filename = req.file;
   var storage = multer.diskStorage({
      destination: (req, file, cb) => {
         cb(null, '/uploads')
      },
      filename: (req, file, cb) => {
         cb(null, file.fieldname + '-' + Date.now())
         console.log(file, storage)
      }
      
   });
   console.log("File "  + filename + " uploaded successfully!");
   res.send('File uploaded successfully');
   

});


app.post('/post', (req, res) => {
   const file = req.body.file;
   console.log(file);
   fs.createReadStream()

   const upload = async (req, res) => {
      try{
         if (req.file == undefined) {
            return res.status(400).send("Please select a CSV file");
         }
            //convert csv to json
         
            CSVToJSON().fromFile(file).then((json) => {
            //fileJ is an array of json objects
            console.log(json);
            const newRecord = Record.create({
               accountType: "SAVINGS",
               acquiringInstCode: "200018",
               amount: 15,
               authCode: "",
               cardExpiry: "2502",
               cardHolder: "AK/SAMSON",
               cardLabel: "Master card",
               maskedPan: "524910xxxxxx7932",
               merchantId: "2057LA200003890",
               originalForwardingInstCode: "627629",
               responseCode: "00",
               rrn: "2211052015920",
               terminalId: "6476868",
               transactionType: "PURCHASE",
               transmissionDateTime: "2022-11-05 09:15:28",
               responseMessage: "APPROVED"
            })

         }).catch(err => {
            console.log(err);
         })
      }catch(err){
         console.log(err);
      }
      upload();
   }
})

app.listen(3000, function(){
   console.log('Server listening on port 3000')
});