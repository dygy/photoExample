const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const WebSocket= require('ws');
const  server = new WebSocket.Server({port:3000});
let index=0;
let AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: '...', secretAccessKey: '...' });
app.set("view", path.join(__dirname, "./view"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./view/selfie'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/upload/index.html');
});
app.get('/selfie', (req, res) => {
    res.sendFile(__dirname + '/view/selfie/selfie.html');
});
server.on('connection',ws =>{
    ws.on('message',message=>{
        let obj = JSON.parse(message);
        let base64Data = obj['URL'].replace('data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=image.png;base64,',"")
        fs.writeFile(path.resolve(__dirname, './uploads/image '+index+'.png'), base64Data, 'base64', function(err) {
            if (err) throw err;
        });

        //s3fun(base64Data,'image '+index+'.png',obj['type']);
        //index++;
        //while (!s3Check('image '+index+'.png',obj['type'])){

        //}
        //send photo back to client
        server.clients.forEach(clients => {

            if (clients.readyState=== WebSocket.OPEN){

            }});});});

const upload = multer({
    dest: "./uploads"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.post(
    "/upload",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./uploads/image.png");

        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);
                res
                    .status(200)
                    .contentType("text/plain")
                    .end("File uploaded!");
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);

                res
                    .status(403)
                    .contentType("text/plain")
                    .end("Only .png files are allowed!");
            });
        }
    }
);


let s3Check = async (bucketName,fileName) => {
    let params = {
        Bucket: bucketName,
        Key: fileName
    };
    try {
        const headCode = await s3.headObject(params).promise();
        const signedUrl = await s3.getSignedUrl('getObject', params).promise();
        // Do something with signedUrl
        return true
    }
    catch (headErr) {
        if (headErr.code === 'NotFound') {
            return false
            // Handle no object on cloud here
        }
    }
};
let s3fun = (data,index,bucketName,fileName)=> {
        let base64data = Buffer.from(data, 'binary');
        let s3 = new AWS.S3();
        s3.putObject( {
        Bucket: bucketName,
        Key: fileName,
        timeout: 6000000,
        Body: base64data,
        ACL: 'public-read',
        ContentType: 'binary'
        }, ( error, data ) => {
            if( error ) console.log( error );
            console.log(data)
        });
};
app.get("/image.png", (req, res) => {
    res.sendFile(path.join(__dirname, "./uploads/image.png"));
});

app.listen(process.env.PORT || 5000,'0.0.0.0', () => console.log('Example app listening on port 5000!'));