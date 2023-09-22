const connection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const user_collection= mongoCollections.users;
const {ObjectId} = require('mongodb');
const helpers = require('../helpers');
const bcrypt=require('bcrypt');
const saltRounds=8;


const createUser = async (name, username, password) => {
  if(!name) throw 'name is not provided';
  if(!username || !password) throw 'username or password is not provided';

  username=helpers.validate_user(username);
  name=helpers.checkName(name);

  const user_col = await user_collection();

  const find_user= await user_col.findOne({username: username});

  if(find_user) throw 'there is already a user with that username';

  password=helpers.validate_password(password);

  const hash=await bcrypt.hash(password,saltRounds);

  let userInfo={
    name:name,
    username:username,
    password:hash
  }

  const insertInfo=await user_col.insertOne(userInfo);

  if(!insertInfo.acknowledged || !insertInfo.insertedId){
    throw 'could not add user';
  }

  const userID= insertInfo.insertedId.toString();

  const user_=await getUserByID(userID);

  return user_;
};

const checkUser = async (username, password) => {
  if(!username || !password) throw 'username or password is not provided';

  username=helpers.validate_user(username);

  const user_col = await user_collection();

  const find_user= await user_col.findOne({username: username});

  if(!find_user) throw 'Either the username or password is invalid';

  const user_pass=find_user.password;

  password=helpers.validate_password(password);

  let compare=false;

  compare=await bcrypt.compare(password,user_pass);

  if(!compare) throw 'Either the username or password is invalid';

  const userID=find_user._id.toString();

  const user_=await getUserByID(userID);

  return user_;
};

const getUserByID = async (userID) => {
    if(!userID) throw 'no userID provided';

    userID=helpers.checkId(userID);

    const user_col = await user_collection();

    const userdetails=await user_col.findOne(
      {_id: ObjectId(userID)},
      {projection:{password:0}}
      );

      if(userdetails==null){
        throw 'No movie found with this id'
    }

    userdetails._id=userdetails._id.toString();

    return userdetails;

}

module.exports = {
  createUser,
  checkUser,
  getUserByID
};