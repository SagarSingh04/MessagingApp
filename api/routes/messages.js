const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid');
const database = require('../database/database');

//Database connectivity
const db = database.makeDb();

//API to get messages of a users from a group
router.get('/getMessages/:groupId/:userId', async(req, res, next) => {
    try{
        const group_id = req.params.groupId;
        const user_id = req.params.userId;

        //Query to check if user is member of the group
        let userIsMember = await db.query("SELECT * FROM user_chat_rel WHERE group_id = " + "'" + group_id + "' AND user_id = " + "'" + user_id + "'");
        console.log(userIsMember);

        if(userIsMember.length > 0){
            //Query to fetch all messages from a group
            let allMessages = await db.query("SELECT message FROM message where group_id = " + "'" + group_id + "'");
            console.log(allMessages);
            res.status(200).json({
                message: "Success",
                result: allMessages
            });
        }else{
            res.status(200).json({
                message: "User is not a group member"
            });
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        });
    }
});

//API to create message
router.post('/createMessage', async(req, res, next) => {
    try{
        const group_id = req.body.groupId;
        const creator_id = req.body.creatorId;
        const message = req.body.message;
        const message_id = uuidv4();
        const create_date = new Date();

        //Query to check if user is member of the group
        let userIsMember = await await db.query("SELECT * FROM user_chat_rel WHERE group_id = " + "'" + group_id + "' AND user_id = " + "'" + creator_id + "'");
        console.log(userIsMember);

        if(userIsMember.length > 0){
            //Query to insert message in message table
            let query = "INSERT INTO message (message_id, message, create_date, update_date, creator_id, group_id) VALUES (?, ?, ?, ?, ?, ?)"
            let insertMessage = await db.query(query, [message_id, message, create_date, create_date, creator_id, group_id]);
            console.log(insertMessage);

            res.status(200).json({
                message: "Sucess",
                result: insertMessage
            });
        }
        else{
            res.status(200).json({
                message: "User is not a group member"
            });
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        });
    }
});

module.exports = router;