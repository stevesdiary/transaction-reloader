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
      const upload = multer({ dest: 'uploads/' });
   console.log(
      {file: req.file}
   )
   res.status(200).send({
      statuscode: 200,
      message: 'File uploaded successfully',
   })
   }catch(err){
      console.log(err)
      res.status(404).json({error: err.message})
   }

   // const csvk= fs.readFileSync('./uploads/'+req.file.filename, 'utf-8')
   // let array = (await csvk.writeToString()).split("\r")

   // let result = []

   // let headers = array[0].split(",")

   // for(let i = 1; i < array.length-1; i++){
   //    let obj = {}
   //    let str = array[i].split(",")
   //    let s = ''
   // }
   
   
   let json = csvToJson.getJsonFromCsv('./uploads/'+req.file.filename);
   for(let i=0; i<json.length;i++){
      console.log("JSON FILE: " , json[i]);
   }

});

var type = upload.single('recfile');



app.listen(3000, function(){
   console.log('Server listening on port 3000')
});