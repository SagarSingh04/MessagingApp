const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid');
const database = require('../database/database');

//Database connectivity
const db = database.makeDb();

//API to get groups for a user
router.get('/getGroups', async(req, res, next) => {
    try{
        const userId = req.query.userId;
        let numPerPage = req.query.numPerPage;
        let page = req.query.page;
        let skip = (page - 1) * numPerPage;
        //Limiting the retrieved user list for pagination
        let limit = skip + ',' + numPerPage

        //Query to retrieve total number users from table
        let rowResult = await db.query("SELECT count(*) as numRows FROM chat_group");
        let numRows = rowResult[0].numRows;
        let numPages = Math.ceil(numRows / numPerPage);
        console.log("No. of pages: " + numPages);

        if(page <= numPages){
            message = "Success";
        }else{
            message = "Number of pages exceeded";
        }

        //Database query to get groups for a user
        let result = await db.query("SELECT * FROM chat_group WHERE group_id in (SELECT group_id FROM user_chat_rel WHERE user_id = " + "'" + userId + "') LIMIT " + limit);
        console.log(result);

        res.status(200).json({
            message: message,
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

//API to greate group and insert user into user chat table
router.post('/createGroup', async(req, res, next) => {
    try{
        const group_name = req.body.groupName;
        const owner_id = req.body.ownerId;
        const added_user_ids = req.body.addedUserList;
        const createDate = new Date();
        const group_id = uuidv4();

        await db.beginTransaction();

        //Query to insert data chat group table on group creation
        let groupCreationQuery = "INSERT INTO chat_group (group_id, group_name, owner, create_date) VALUES (?, ?, ?, ?)";
        let groupCreationResult = await db.query(groupCreationQuery, [group_id, group_name, owner_id, createDate]);
        console.log(groupCreationResult);

        let userChatRelId = uuidv4();
        let userIsOwner = 1;
        //Query to insert group owner in relationship table
        let RelEntryQuery = "INSERT INTO user_chat_rel (id, group_id, user_id, is_owner) VALUES (?, ?, ?, ?)";
        let ownerEntryRELResult = await db.query(RelEntryQuery, [userChatRelId, group_id, owner_id, userIsOwner]);
        console.log(ownerEntryRELResult);

        let userIsNotOwner = 0;
        for(let i = 0; i < added_user_ids.length; i++){
            userChatRelId = uuidv4();
            //Query to insert other users in relationship table
            let userEntryRELResult = await db.query(RelEntryQuery, [userChatRelId, group_id, added_user_ids[i], userIsNotOwner]);
            console.log(userEntryRELResult);
        }

        await db.commit();
        res.status(200).json({
            message: "Success",
            result: "Transaction completed"
        });
    }
    catch(err){
        await db.rollback();
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        })
    }
});

//API to update group details by owner
router.patch('/updateGroup/:groupId/:userId', async(req, res, next) => {
    try{
        const group_id = req.params.groupId;
        const user_id = req.params.userId;
        const group_name = req.body.groupName;
        const added_user_list = req.body.addedUserList;
        const deleted_user_list = req.body.deletedUserList;

        //Query to check if the user is the group owner
        let user_is_owner = await db.query("SELECT is_owner FROM user_chat_rel where group_id = " + "'" + group_id + "'" + " AND user_id = " + "'" + user_id + "'");
        console.log(user_is_owner);

        if(user_is_owner !== null && user_is_owner[0].is_owner == 1){
            await db.beginTransaction();

            if(group_name){
                //Query to update the group name
                let updateGroupname = await db.query("UPDATE chat_group SET group_name = " + "'" + group_name + "' WHERE group_id = " + "'" + group_id + "' AND owner = " + "'" + user_id + "'");
                console.log(updateGroupname);
            }
            
            if(added_user_list.length > 0){
                let user_chat_id = 0;
                let isNotOwner = 0;
                //Query to insert user data on user added in the relationship table
                let user_add_query = "INSERT INTO user_chat_rel (id, group_id, user_id, is_owner) VALUES (?, ?, ?, ?)";

                for(let i = 0; i < added_user_list.length; i++){
                    user_chat_id = uuidv4();
                    let user_added_to_rel = await db.query(user_add_query, [user_chat_id, group_id, added_user_list[i], isNotOwner]);
                    console.log(user_added_to_rel);
                }
            }

            if(deleted_user_list.length > 0){
                
                for(let i = 0; i < deleted_user_list.length; i++){
                    //Query to delete user data on user deleted in the relationship table
                    let user_deleted_from_rel = await db.query("DELETE FROM user_chat_rel WHERE group_id = " + "'" + group_id + "' AND user_id = " + "'" + deleted_user_list[i] + "'");
                    console.log(user_deleted_from_rel);
                }
            }

            await db.commit();

            res.status(200).json({
                message: "Updated"
            })
        }
        else{
            res.status(200).json({
                message: "User is not owner"
            });
        }

    }
    catch(err){
        await db.rollback();
        console.log(err);
        res.status(500).json({
            message: "Error",
            error: err
        });
    }
});

module.exports = router;
