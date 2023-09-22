const express = require('express');
const {users} = require('../data');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const helpers = require('../helpers');

router
    .route('/signup')
    .post( async (req , res) => {
        let userInfo=req.body;
        let name=userInfo.name;
            let username=userInfo.username;
            let password=userInfo.password;
        try{
            if(!name || !username || !password) throw 'name or username or password is not provided';
            username=helpers.validate_user(username);
            name=helpers.checkName(name);
            password=helpers.validate_password(password);

        }catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const result=await userData.createUser(name,username,password);
            if(result!=null){
                return res.json(result);
            }

        }catch(e){
            return res.status(404).json({error: e});
        }
        return res.status(500).send('Internal Server Error');
    })


router
    .route('/login')
    .post( async (req , res) => {
        let userInfo=req.body;
        let username=userInfo.username;
        let password=userInfo.password;
        try{
            if(!username || !password) throw 'username or password is not provided!';
            username=helpers.validate_user(username);
            password=helpers.validate_password(password);
        }catch(e){
            return res.status(400).json({error: e});
        }

        try{
            const result=await userData.checkUser(username,password);
            if(result!=null){
                req.session.user = {id:result._id,username:result.username};
                return res.json(result);
            }
        }catch(e){
            return res.status(404).json({error: e});
        }

        return res.status(500).send('Internal Server Error');
    })

router
    .route('/logout')
    .get(async (req, res) => {
        try{
            if(req.session.user){
                req.session.destroy();
                return res.json("you are loggedout");
            }else{
                throw 'you are already logged out!';
            }
        }catch(e){
            return res.status(401).json({error: e});
        }
        return res.status(500).send('Internal Server Error');
    })

module.exports = router;