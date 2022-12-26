const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid');
const database = require('../database/database');

//Database connectivity
const db = database.makeDb();

//API to get list of users
router.get('/getUsers', async(req, res, next) => {
    try{
        let numPerPage = req.query.numPerPage;
        let page = req.query.page;
        let skip = (page - 1) * numPerPage;
        //Limiting the retrieved user list for pagination
        let limit = skip + ',' + numPerPage

        //Query to retrieve total number users from table
        let rowResult = await db.query("SELECT count(*) as numRows FROM user");
        let numRows = rowResult[0].numRows;
        let numPages = Math.ceil(numRows / numPerPage);
        console.log("No. of pages: " + numPages);

        if(page <= numPages){
            message = "Success";
        }else{
            message = "Number of pages exceeded";
        }

        //Query to retrieve users from users table
        let result = await db.query("SELECT * FROM user LIMIT " + limit);

        console.log(result);
        res.status(200).json({
            message: message,
            result: result
        })
    }
    catch(error){
        console.log("Error occured");
        console.log(error);
        res.status(500).json({
            message: "Error",
            error: error
        })
    }
});

//API to create user on signup
router.post('/signUp', async(req, res, next) => {
    try{
        const name = req.body.name;
        const email = req.body.email;
        const userId = uuidv4();
        const createDate = new Date();

        //Query to check if user already exists
        let selectResult = await db.query("SELECT * FROM user WHERE UserEmail = " + "'" + email + "'");
        console.log(selectResult);
        if(selectResult.length > 0){
            return res.status(200).json({
                    message: 'Row already exists'
                });
        }

        //Query to insert user data into user table
        const insertQuery = `INSERT INTO user (UserId, UserName, UserEmail, CreateDate) VALUES (?, ?, ?, ?)`;
        let result = await db.query(insertQuery,[userId, name, email, createDate]);
        res.status(200).json({
            message: 'Row inserted',
            result: result
        });

    }catch(err){
        console.log("Error occured");
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        })
    }
    
});

module.exports = router;