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
   if (file.mimetype === 'text/csv') {
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
      const json = csvToJson.getJsonFromCsv('./uploads/'+req.file.filename);
   // console.log ("Result:" ,json);
      let array = json
      const key = 'merchantId,terminalId,maskedPan,stan,rrn,currency,amount,transactionDate,responseCode,responseMessage'
   
      array.forEach((element) => {
         const rrn  = element[key].split(",")[4]
         const merchantId = element[key].split(",")[0]
         const terminalId = element[key].split(",")[1]
         const rawData = element[key].split(",")
         // console.log("RRN: ", rrn )
         // console.log ("MERCHANT ID ",merchantId, "TERMINAL ID", terminalId, "RAW DATA ",rawData)
         
         const query = `INSERT INTO transaction (merchantId, terminalId, rrn, rawData) VALUES ('${merchantId}', '${terminalId}', '${rrn}', '${rawData}')` 

         connection.query(query, (err, result) => {
            if (err){
               // console.log (err)
               console.log ("Error in inserting into transaction table", err)
            }
         })
      },
      console.log("All records inserted successfully"),
      res.send('All records sent successfully!')
   )}
   catch(err){
      console.log(err);
      res.status(500).send('Error inserting records!');
   }
})



app.listen(3000, function(){
   console.log('Server listening on port 3000')
});