const pool = require("./chatSchema");
let res
let onlineUsers = [];

//adding online users to temp data
function addingOnlineUser(username, name) {
    onlineUsers.findIndex(({username:u})=>u===username) == -1 && name ?onlineUsers.push({username, name}): ''
}

//for registration 
async function addUserToDB(username, name, passedSocket) {
    const sqlInsert = {
        text: `insert
                into
                    "users" (username, name)
                values ( $1 ,
                $2 );
            `,
        values: [username, name],
    };
    try {
        await pool.query(sqlInsert);
        res = true
    } catch (error) {
        if (error.constraint.includes("users_username_key")) res = false;
    }
    passedSocket.emit("registration", {
        username, 
        isRegistered: res
    })

    addingOnlineUser(username, name)
    passedSocket.emit("onlineUsers", onlineUsers); 
}

//for registration 
async function addUserToDB(username, name, passedSocket) {
    const sqlInsert = {
        text: `insert
                into
                    "users" (username, name)
                values ( $1 ,
                $2 );
            `,
        values: [username, name],
    };

    try {
        await pool.query(sqlInsert);
        res = true
    } catch (error) {
        if (error.constraint.includes("users_username_key")) res = false;
    }
    passedSocket.emit("registration", {
        username, 
        isRegistered: res
    })

    addingOnlineUser(username, name)
    passedSocket.emit("onlineUsers", onlineUsers); 
}

// for login
async function IsUserInDB(username, passedSocket) {
    res = true;
    const sqlSelect = {
        text: `SELECT name FROM users WHERE username = $1;`,
        values: [username],
    };

    let {rowCount, rows} = await pool.query(sqlSelect);
    if (rowCount == 0) res = false;
    passedSocket.emit("login", {
        username, 
        isLoggedIn: res
    }) 

    addingOnlineUser(username, rows[0].name) // handle the err
    passedSocket.emit("onlineUsers", onlineUsers); 
}

// add Message in the database
async function addMessage(message, username, chatId, passedSocket) {
    const sqlInsert = {
        text: `insert
                into
                    "message_chat" (message, fk_owner_username, fk_chat_id)
                values ( $1, $2, $3 );
            `,
        values: [message, username, chatId],
    };
    try {
        await pool.query(sqlInsert);
        res = true
    } catch (error) {
        console.log(error);
        res = false;
    }

    passedSocket.emit("chatId"+chatId, { 
        username, 
        isMessageAdded: res,
        message
    }) 
}

async function addChatGroup(chatId, username, message) {
    // add add Chat Group in the database
    // insert into "chat" (name) VALUES ('ello');
    // insert into "user_chat" (fk_chat_id, fk_username) values ('1', 'mohammad');
}

async function deleteChat(chatId, username) {
    // add add Chat Group in the database
    // `delete from "chat" where id = $1;`
}

// delete from user from chat users 
function deleteUserFromChat(chatId, username) {
    //`delete from "user_chat" where fk_chat_id = $1 and fk_username = $2;`
}
// function getSpicificChatBetweenTwoUsers(username1, username2) {
//     //`delete from "user_chat" where fk_chat_id = $1 and fk_username = $2;`
//     // adding new chat
//     const sqlGetChatIdsForUser = {
//         text: `select fk_chat_id from
//         "user_chat" where fk_username = $1;`,
        
//         values: [user1],
//     };

//     let { rowCount: rowChatIdsForUserCount, rows: rowChatIdsForUser } = await pool.query(sqlGetChatIdsForUser);
//     //add chat record here there is no chat for this user
    
//     if (rowChatIdsForUserCount === 0) {
//         const sqlAddChatForUser = {
//             text: `insert into "chat" (name, isGroup) VALUES ($1, $2) returning id;`,
//             values: ['private', false],
//         };
//         let { rows: returnedChat } = await pool.query(sqlAddChatForUser);
//         let chatId = returnedChat[0].id;

//         // adding new relation bettween the new user and his chat 
//         function insertChat (user) {
//             return {
//                 text: `insert into "user_chat" (fk_username, fk_chat_id) VALUES ($1, $2);`,
//                 values: [user, chatId],
//             }
//         };
//         await pool.query(insertChat(user1))
//         await pool.query(insertChat(user2))
//         passedSocket.emit("getNewChat", { chatId, user1, user2 });
//     }
// }


// getMessages
//there is emmit and on for group and for normal chat 
async function getChatsAndItsMessages (user1, passedSocket) { //user1 is the main user
    
    const sqlGetChatIdsForUser = {
        text: `select fk_chat_id from
        "user_chat" where fk_username = $1;`,
        
        values: [user1],
    };

    let { rowCount: rowChatIdsForUserCount, rows: rowChatIdsForUser } = await pool.query(sqlGetChatIdsForUser);
    //add chat record here there is no chat for this user

    var chats = [];
    let [chatIds, sqlGetUsersForChats, sqlGetMessagesForChats ] = sqlGeneratorForUsersAndMessagesInChat(rowChatIdsForUserCount, rowChatIdsForUser)
    let { rows: usersChats} = await sqlString(sqlGetUsersForChats, chatIds)
    let { rows: messagesChats} = await sqlString(sqlGetMessagesForChats, chatIds)

    // formating the final opject of messages
    for (let i = 0; i < usersChats.length; i += 2) {
        let username1 = usersChats[i].fk_username;
        let username2 = usersChats[i+1].fk_username;
        let chatId = usersChats[i].fk_chat_id;
        let messages = messagesChats
            .filter(({ fk_chat_id }) => usersChats[i].fk_chat_id == fk_chat_id)
            .map(({ fk_owner_username: sender, id, message }) => ({ sender, id, message }))
        chats.push({
            chatId,
            username1,
            username2,
            messages
        });   
    } //there is emmit and on and queries for group and for normal chat 
    passedSocket.emit("userChats", chats);
}


// Utils functions
// the sql generator
function sqlGeneratorForUsersAndMessagesInChat(rowChatIdsForUserCount, rowChatIdsForUser) {
    let sqlSelectUsersDependsOnChatIds = `select fk_username, fk_chat_id from
    "user_chat" where `;
    let sqlSelectMessagesDependsOnChatIds = `select id, message, fk_owner_username, fk_chat_id from
    "message_chat" where `;
    let chatIds = rowChatIdsForUser.map(({fk_chat_id: chatId}, i) => {
        let num = i + 1
        sqlSelectUsersDependsOnChatIds += (i == rowChatIdsForUserCount-1)? `fk_chat_id = $`+num+` order by fk_chat_id;`: `fk_chat_id = $`+num+` or `;
        sqlSelectMessagesDependsOnChatIds += (i == rowChatIdsForUserCount-1)? `fk_chat_id = $`+num+`;`: `fk_chat_id = $`+num+` or `;
        return chatId
    })
    return [chatIds, sqlSelectUsersDependsOnChatIds, sqlSelectMessagesDependsOnChatIds]
}
async function sqlString(text, values) {
    return await pool.query({
        text,
        values
    })
}
module.exports = {
    addUserToDB,
    IsUserInDB,
    addMessage,
    getChatsAndItsMessages
}