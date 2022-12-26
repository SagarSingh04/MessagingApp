const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid');
const database = require('../database/database');

//Database connectivity
const db = database.makeDb();

//API to get 5 users with most messages
router.get('/usersMostMessage/:startDate/:endDate', async(req, res, next) => {
    try{
        const start_date = req.params.startDate;
        const end_date = req.params.endDate;

        //Query to get 5 users with most messages
        let query = `SELECT  distinct cnt,UserName
        FROM (
        SELECT count( distinct p.message) cnt, q.UserName   FROM sagardb.message  p , sagardb.user q
        WHERE p.creator_id=q.UserID
        AND (p.create_date  BETWEEN '` + start_date +`' AND '` + end_date + `')
        GROUP BY q.UserName ) a ORDER BY cnt DESC LIMIT 0,5`

        let result = await db.query(query);
        console.log(result);

        res.status(200).json({
            message: "Success",
            result: result
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        });
    }
});

//API to get 5 chats with most messages
router.get('/chatMostMessage', async(req, res, next) => {
    try{
        //Query to get 5 chats with most messages
        let query = `SELECT  distinct cnt,group_name
        FROM (
        SELECT count( distinct p.message) cnt, q.group_name FROM sagardb.message  p , sagardb.chat_group q
        WHERE p.group_id=q.group_id
        GROUP BY q.group_name ) a ORDER BY cnt DESC LIMIT 0,5`

        let result = await db.query(query);
        console.log(result);

        res.status(200).json({
            message: "Success",
            result: result
        });
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