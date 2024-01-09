const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  app = express(), //app stores the express module
  bodyParser = require("body-parser")


//Changes ==================================
const { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const fileUpload = require('express-fileupload')
app.use(fileUpload());

//grab environmental variable for the bucket name, if none use assignment default
let bucketName = process.env.BUCKET_NAME || "my-cool-local-bucket";
console.log(bucketName);

const S3Config = {
    region: 'us-west-1'
  };
  
  if ( process.env.S3_ENDPOINT) {
    S3Config.endpoint = process.env.S3_ENDPOINT;
    S3Config.forcePathStyle = true;
  }
  
  const s3Client = new S3Client(S3Config);


const listObjectsParams = {
  Bucket: bucketName
};

listObjectsCmd = new ListObjectsV2Command(listObjectsParams);

//Checking to see if it can connect to S3
const listBucketsParams = {};
const listBucketsCmd = new ListBucketsCommand(listBucketsParams);

s3Client.send(listBucketsCmd)
  .then(data => {
    console.log('List of Buckets:', data.Buckets);
  })
  .catch(err => {
    console.error('Error listing buckets:', err);
  });

//End Changes ==================================

/** 
 * Database connection
 * @description connect to either local or online DB based on where its being run 
 */


app.use(bodyParser.json());


//logger for terminal only, not to write in log.txt
app.use(morgan("common"));

//Error Handling
// MUST BE PLACED BEFORE app.listen
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


//Check origin
const cors = require('cors');
app.use(cors()); //allows all origins





//Changes ==================================

//get all images
app.get('/images', (req, res) => {
  //grab all images
  let listObjectsParams = {
      Bucket: bucketName,
      Prefix: 'resized-images/' // changed
  }
  //
  s3Client.send(new ListObjectsV2Command(listObjectsParams))
      .then((listObjectsResponse) => {
          res.send(listObjectsResponse)
  })
});

//upload image
app.post('/upload', async (req, res) => {
  const file = req.files.image;
  const fileName = req.files.image.name;

  const uploadParams = {
    Bucket: bucketName, 
    Key: `original-images/${fileName}`, // changed
    Body: file.data
  };

  putObjectCmd = new PutObjectCommand(uploadParams);

  try {//check to see if it uploads
    await s3Client.send(putObjectCmd);
    return res.status(200).send('File uploaded to S3 successfully');
} catch (error) {//if it doesnt then send error
    console.error('Error uploading file to S3:', error);
    return res.status(500).send('Error uploading file to S3');
}
});

//download image
app.get('/download/:fileName', async (req, res) => {
  //get the data based on the file
  const downloadParams = {
    Bucket: bucketName, 
    Key: `resized-images/${req.params.fileName}`, // changed
  };

  getObjectCmd = new GetObjectCommand(downloadParams);

  try {//check to see if it downloads
    const data = await s3Client.send(getObjectCmd);

    //res.attachment(req.params.fileName);
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream'); 
    //res.send(data.Body);
    data.Body.pipe(res);
} catch (error) {//if it doesnt then send error
    console.error('Error downloading file from S3:', error);
    return res.status(500).send('Error downloading file from S3');
}
});
//End Changes ==================================












app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
