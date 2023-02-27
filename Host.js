const socket = new WebSocket("ws://127.0.0.1:5500");

WebSocket.onmessage = (event) => {
  handleSignalingData(JSON.parse(event.data))
}

function handleSignalingData(data) {
  switch(data,type) {
    case "answer":
      peerConn.setRemoteDescription(data.answer)
      break
    case "candidate":
      peerConn.addIceCandidate(data.candidate)

  }
}

let username;
function sendUsername() {
  username = document.getElementById("username").value
  SendData({
    type: "store_data"
  });
};
function SendData(data) {
  data.username = username
  WebSocket.send(JSON.stringify(data));
};

let localStream;
let peerConn
function startCall() {
  document.getElementById("video-call-div").style.display = "inline";
  
  navigator.getUserMedia({
    video: {
      frameRate: 24,
      width: {
        min: 480, ideal: 720, max: 1280
      },
      aspectRatio: 1.333
    },
    audio: true
  }, (stream) => {
    localStream = stream
    document.getElementById("local-video").srcObject = localStream
    
    let configuration = {
      iceServers: [
        {
          "urls": ["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302"]
        } 
      ]
    }

    peerConn = RTCPeerConnection(configuration)
    peerConn.addStream(localStream)

    peerConn.onaddstream = (e) => {
      document.getElementById("remote-video").srcObject = e.stream
    }

    peerConn.onicecandidte = ((e) => {
      if(e.candidate == null)
        return

      SendData({
        type: "store_candidate",
        candidate: e.candidate
      })  
    })

    createAndSendOffer()
    
  }, (error) => {
    console.log("error");
  })
}

function createAndSendOffer() {
  peerConn.createOffer((offer) => {
    SendData({
      type: "store_offer",
      offer: offer
    })

    peerConn.setLocalDescription(offer) 
  }, (error) => {
    console.log("error");
  })
}
