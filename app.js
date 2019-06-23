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
        while (!checkFile('./uploads/','image '+index+'.png')){

        }
        //send photo back to client
        server.clients.forEach(clients => {
            if (clients.readyState=== WebSocket.OPEN){
            ws.send(base64Data)
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
        const targetPath = path.join(__dirname, "./uploads/image"+index+".png");
        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);
                res
                    .status(200)
                    .contentType("text/plain")
                    .end("File uploaded!");
                while (!checkFile()){
                }

                ws.send(base64Data)
                index++;
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
let checkFile = (async(fileName,path) => {
    try {
        const stat = await fs.lstat(path+fileName);
        console.log(stat.isFile());
    } catch(err) {
        console.error(err);
    }
})();

app.get("/image.png", (req, res) => {
    res.sendFile(path.join(__dirname, "./uploads/image.png"));
});

app.listen(process.env.PORT || 5000,'0.0.0.0', () => console.log('Example app listening on port 5000!'));