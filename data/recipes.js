const connection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const recipes = mongoCollections.recipes;
const {ObjectId, ObjectID} = require('mongodb');
const helpers = require('../helpers');


const getallrecipes = async (
    page_no,
) => {
    if(!page_no) throw 'please provide page number for the data function!';
    if(isNaN(page_no)){
        throw 'page number should be valid number'
    }
    if(page_no<1){
        throw 'page number should be greater than 1';
    }

    const each_page = 50;
    const skip = (page_no - 1) * each_page;
    const recipescollection= await recipes();

    //const all_recipes= await recipescollection.find({}).toArray();
    const all_recipes= await recipescollection.find({}).skip(skip).limit(each_page).toArray();


    if(!all_recipes){
        throw "can't fetch recipes";
    }

    all_recipes.forEach(element => {
        element._id=element._id.toString();
    });

    return all_recipes;
}

const create_recipes = async (
    title,
    ingredients,
    cookingSkillRequired,
    steps,
    userThatPosted
) => {
    if (!title) throw 'all parameters are not passed'; 
    if(!cookingSkillRequired) throw 'all parameters are not passed';
    if (!ingredients) throw 'all parameters are not passed';
    if (!steps) throw 'all parameters are not passed';
    if (!userThatPosted) throw 'all paramerers are not passed';

    title=helpers.checkTitle(title);
    ingredients=helpers.checkIngredients(ingredients);
    cookingSkillRequired=helpers.checkcookingSkillRequired(cookingSkillRequired);
    steps=helpers.checkSteps(steps);

    let recipe={
        title:title,
        ingredients:ingredients,
        cookingSkillRequired:cookingSkillRequired,
        steps:steps,
        userThatPosted:userThatPosted,
        comment:[],
        likes:[]
    }

    const recipescollection= await recipes();
    const insertInfo=await recipescollection.insertOne(recipe);

    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'could not add movie';
    }
    
    const newID= insertInfo.insertedId.toString();
    const recipe_=await getRecipeById(newID);
    return recipe_;
}

const getRecipeById = async (id) => {
    if (!id) throw 'You must provide a ID';
    id=helpers.checkId(id);
    const recipescollection= await recipes();
    const recipe_by_id= await recipescollection.findOne({_id: ObjectId(id)});

    if(recipe_by_id==null){
        throw 'No recipe found with this id'
    }

    recipe_by_id._id=recipe_by_id._id.toString();
    //TODO: convert recipe's comment and likes id from object id to string-
    recipe_by_id.comment.forEach(element => {
        element._id=element._id.toString();
    });
    return recipe_by_id;
}

const patchRecipe = async (
    id,
    title,
    ingredients,
    cookingSkillRequired,
    steps,
) => {
    if (!id) throw 'You must provide a ID';
    if (!title) throw 'all parameters are not passed'; 
    if(!cookingSkillRequired) throw 'all parameters are not passed';
    if (!ingredients) throw 'all parameters are not passed';
    if (!steps) throw 'all parameters are not passed';

    id=helpers.checkId(id);
    title=helpers.checkTitle(title);
    ingredients=helpers.checkIngredients(ingredients);
    cookingSkillRequired=helpers.checkcookingSkillRequired(cookingSkillRequired);
    steps=helpers.checkSteps(steps);
    

    const recipescollection= await recipes();
    const recipe_by_id= await recipescollection.findOne({_id: ObjectId(id)});
    if(recipe_by_id==null){
        throw 'No recipe found with this id';
    }

    new_receipe={
        title:title,
        ingredients:ingredients,
        cookingSkillRequired:cookingSkillRequired,
        steps:steps,
    }

    const updatedInfo = await recipescollection.updateOne(
        {_id: ObjectId(id)},
          {$set: new_receipe}
    );

    if(!updatedInfo.matchedCount || !updatedInfo.modifiedCount){
        throw 'could not update receipe';
    }
    
    const recipe_=await getRecipeById(id);
    return recipe_;
}

const addComment = async(
    id,
    userThatPostedComment,
    comment
) => {
    if (!id) throw 'You must provide a ID';
    if(!userThatPostedComment) throw 'you must provide user that posted comment';
    if(!comment) throw 'you must provide comment';

    id=helpers.checkId(id);
    comment=helpers.checkComment(comment);

    const recipescollection= await recipes();
    const recipe_by_id= await recipescollection.findOne({_id: ObjectId(id)});

    if(recipe_by_id==null){
        throw 'No recipe found with this id';
    }

    const commentobj={
        _id:ObjectId(),
        userThatPostedComment:userThatPostedComment,
        comment:comment
    }

    const insertinfo=await recipescollection.updateOne(
        {_id:ObjectId(id)},
        {$addToSet: {comment:commentobj}}
    );
      
    if(!insertinfo.matchedCount || !insertinfo.modifiedCount){
        throw 'could not add comment';
    }

    const recipe_=await getRecipeById(id);
    return recipe_;
}

const addAndRemoveLike = async(
    id,
    userid
) => {
    if(!id) throw 'you must pass id of the recipe';
    if(!userid) throw 'you must provide user id';
    id=helpers.checkId(id);
    userid=helpers.checkId(userid);
    let inlikes=false;

    const recipescollection= await recipes();
    const rec=await getRecipeById(id);
    if(rec==null){
        throw 'no recipe found with this ID';
    }

    const likees=rec.likes;
    if(likees.includes(userid)){
        inlikes=true;
    }

    if(!inlikes){
        const updatedInfo = await recipescollection.updateOne(
            {_id: ObjectId(id)},
            {$push: {likes:userid}}
        );

        if(!updatedInfo.matchedCount || !updatedInfo.modifiedCount){
            throw 'could not update receipe...';
        }

    }else{
        const updatedInfo = await recipescollection.updateOne(
            {_id: ObjectId(id)},
            {$pull: {likes:userid}}
        );

        if(!updatedInfo.matchedCount || !updatedInfo.modifiedCount){
            throw 'could not update receipe!';
        }

    }

    const recipe_=await getRecipeById(id);
    return recipe_;
}

const deleteComment = async (
    id,
    commentid
) => {
    if(!id) throw 'you must pass id of the recipe';
    if(!commentid) throw 'you must provide comment id';
    id=helpers.checkId(id);
    userid=helpers.checkId(commentid);

    const recipescollection= await recipes();
    const rec=await getRecipeById(id);
    if(rec==null){
        throw 'no recipe found with this ID';
    }

    const deleteInfo=await recipescollection.updateOne({_id: ObjectId(id)}, {$pull: {'comment': {_id: ObjectId(commentid)}}});

    if(!deleteInfo.matchedCount || !deleteInfo.modifiedCount){
        throw 'could not delete recipe';
    }

    const recipe_=await getRecipeById(id);
    return recipe_;
}

const getCommentByID = async (
    id,
    commentid
) =>{
    if(!id) throw 'you must pass id of the recipe';
    if(!commentid) throw 'you must provide comment id';
    id=helpers.checkId(id);
    userid=helpers.checkId(commentid);

    const recipescollection= await recipes();
    const rec=await getRecipeById(id);
    if(rec==null){
        throw 'no recipe found with this ID';
    }
    //console.log(rec)

    // const comment_=await recipescollection.findOne(
    //     {"comment._id":ObjectId(commentid)},
    //     {projection:{_id:0,title:0,ingredients:0,cookingSkillRequired:0 ,steps:0, userThatPosted:0 ,likes:0}}
    // );

    const comment_=await recipescollection.findOne(
        {"comment":{$elemMatch : {"_id":ObjectId(commentid)}}});

    if(comment_==null){
        throw 'no comment found with this id';
    }

    for (const i in comment_.comment) {
        if(comment_.comment[i]._id==commentid){
            return comment_.comment[i];
        }
    }
    return comment_.comment;
}

module.exports = {
    getRecipeById,
    getallrecipes,
    create_recipes,
    patchRecipe,
    addComment,
    addAndRemoveLike,
    deleteComment,
    getCommentByID
  };
