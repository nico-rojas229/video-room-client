import React, { useState, useContext } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChatIcon from "@material-ui/icons/Chat";
import { Button, Drawer, Input } from "@material-ui/core";
import { SocketContext } from "../Context";
import { socket } from "../Context";

import "../assets/styles/chat.css";

const useStyles = () => ({});

function Chat(props) {
  const [chatText, setChatText] = useState("");
  const { broadcastMessage, reciveMessage, setMessage, chat } =
    useContext(SocketContext);

  const handleChatText = (event) => {
    const { value } = event.target;
    setChatText(value);
  };

  const handleSendText = (event) => {
    console.log("entro aqui", [event, chatText, props]);
    if (!(chatText.length > 0)) return;
    if (event.type === "keyup" && event.key !== "Enter") {
      return;
    }
    const messageDetails = {
      message: {
        message: chatText,
        timestamp: new Date(),
      },
      userData: { ...props.myDetails },
    };
    console.log(messageDetails);
    broadcastMessage(messageDetails);
    console.log("mensaje desde el chat", props.chat);
    setChatText("");
  };

  return (
    <>
      <Drawer
        className='chat-drawer'
        open={props.chatToggle}
        anchor={"right"}
        onClose={props.closeDrawer}>
        <div className='chat-head-wrapper'>
          <div className='chat-drawer-back-icon' onClick={props.closeDrawer}>
            <ChevronRightIcon />
          </div>
          <div className='chat-header'>
            <ChatIcon />
            <h3 className='char-header-text'>Chat</h3>
          </div>
        </div>
        <div className='chat-drawer-list'>
          {props.chat?.map((chatDetails) => {
            console.log("cjat details", chat);
            const { userData, message } = chatDetails;
            return (
              <div className='message-container'>
                <div className='message-wrapper'>
                  <p className='actual-message'>{message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className='chat-drawer-input-wrapper' onKeyUp={handleSendText}>
          <Input
            className='chat-drawer-input'
            onChange={handleChatText}
            value={chatText}
            placeholder='Type Here'
          />
          <Button onClick={handleSendText}>Send</Button>
        </div>
      </Drawer>
    </>
  );
}

export default Chat;
