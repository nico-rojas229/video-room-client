import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();

// const socket = io('http://localhost:5000');
const socket = io("https://video-room-api.herokuapp.com/");

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [roomId, setRoomId] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  let messages = [];

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        myVideo.current.srcObject = currentStream;
      });

    socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    socket.on("new-broadcast-messsage", (data) => {
      messages.push(data);
      setChat(messages);
      console.log("mensaje recivido", data);
    });

    connectionRef.current = peer;
  };

  const broadcastMessage = async (message) => {
    const sendMessage = [
      message,
      {
        idRoom: me,
      },
    ];
    messages.push(message);
    console.log("mensaje a emitir", sendMessage);
    socket.emit("broadcast-message", sendMessage);
  };

  const reciveMessage = () => {
    socket.on("new-broadcast-messsage", (data) => {
      message.push(data);
      console.log("mensaje recivido", data);
    });
  };

  const callUser = (id) => {
    setRoomId(id);
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    socket.on("new-broadcast-messsage", (data) => {
      messages.push(data);
      setChat(messages);
      console.log("mensaje recivido", data);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        chat,
        callUser,
        broadcastMessage,
        reciveMessage,
        setMessage,
        leaveCall,
        answerCall,
      }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
