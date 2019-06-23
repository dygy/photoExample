const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
    //отправлять base64 по WS
    document.getElementById('base64image').src = event.data;
    document.getElementById('base64image').style.minHeight='100%';
    document.getElementById('base64image').style.minWidth='100%';
    document.getElementById('base64image').style.zIndex='3';
    document.getElementById('base64image').style.visibility='visible';
    // переписать gif под необходимое расширение файла.
    document.getElementById('download-trigger').href ='data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=image.gif'+event.data;
};



let photos =0;
let constraints = {video: {facingMode: "user"}, audio: false};
let track = null;
let message = {
    photo1:null,
    photo2:null,
    type:null
};
// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger");

// Access the device camera and stream to cameraView
let cameraStart = () => {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function(error) {
            console.error("Oops. Something is broken.", error);
        });
}// Take a picture when cameraTrigger is tapped


cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/png");
    cameraOutput.classList.add("taken");
    document.getElementById('camera--trigger').innerText='Take more photo';
    let url = cameraOutput.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    dlCanvas(url)
    // track.stop();
};
let dlCanvas = (url) => {
    console.log(url);
    url = url.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=image.png');
    document.getElementById('download--trigger').href=url;
    setUpPhoto(url.replace('data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=image.png',''))
    photos++;
};
// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);


// Install ServiceWorker
if ('serviceWorker' in navigator) {
    console.log('CLIENT: service worker registration in progress.');
    navigator.serviceWorker.register( '/camera-app/part-2/sw.js' , { scope : ' ' } ).then(function() {
        console.log('CLIENT: service worker registration complete.');
    }, function() {
        console.log('CLIENT: service worker registration failure.');
    });
} else {
    console.log('CLIENT: service worker is not supported.');
}
let getBase64=() => {
    let file = document.querySelector('#file').files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result);
        setUpPhoto(reader.result)
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}


let takePhotosOut = () =>{
    message.photo1=null;
    message.photo2=null;
    photos=0;
};

let setUpPhoto = (base64) =>{
    if (photos!==1){
        message.photo1=base64
    }
    else {
        message.photo2=base64
    }
};
let sendOnWS = ()=>{
    if (message.photo1===null){alert('get first photo')}
    if (message.photo2===null){alert('get second photo')}
    if (message.type===null){alert('select filter')}
    console.log(message);
    ws.send(JSON.stringify(message));
};
