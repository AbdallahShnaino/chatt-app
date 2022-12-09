// Require the express moule
const express = require("express");
require('dotenv').config()
// console.log(pool.query())
// create a new express application
const app = express()

// require the http module
const http = require("http").Server(app)

// require the socket.io module
const io = require("socket.io");

const pool = require("./DB/chatSchema");
const { addUserToDB, IsUserInDB, addMessage, getChatsAndItsMessages } = require('./DB/queries')
const port = process.env.PORT;
const ip = process.env.IP;
const socket = io(http);
//create an event listener

http.listen(port, ip, ()=>{
    console.log("connected to port: "+ port)
});
let onlineUsers = [];

//wire up the server to listen to our port 500
socket.on("connection", socket => {

    console.log("user connected");

    socket.on("disconnect", function() {
        console.log("user disconnected");
    });

    socket.on("registration", function({username, name}) {
        username && name? addUserToDB(username, name, socket): '';
        socket.broadcast.emit("user");
    });
        
    socket.on("login",async function({ username }) {
        IsUserInDB(username, socket);
    });
    
    socket.on("message", ({ message, username, chatId }) => {
        addMessage(message, username, chatId, socket)
    })

    socket.on("userChats", ({username}) => {
        getChatsAndItsMessages(username, socket)
    })

// Someone is typing
// socket.on("typingGroup", ({groupId, username}) => {
        // socket.broadcast.emit("notifyTyping", {
        //       user: data.user,
        //       message: data.message
        // });
//  });
});
            