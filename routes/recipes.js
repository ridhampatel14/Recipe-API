const express = require('express');
const session = require('express-session');
const {recipes} = require('../data');
const router = express.Router();
const data = require('../data');
const recipeData = data.recipes;
const helpers = require('../helpers');



router
    .route('/recipes')
    .get(async (req, res)=> {
        const page_no= req.query.page || 1;
        try{
            if(isNaN(page_no)){
                throw 'page number should be valid number'
            }
            if(page_no<1){
                throw 'page number should be greater than 1';
            }
        }catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const result=await recipeData.getallrecipes(page_no);
            if(result!==null){
                if(result.length!=0){
                    return res.status(200).json(result);
                }else{
                    throw 'no more recipes on this page!';
                }
            }
        }catch(e){
            return res.status(404).json({error: e});
        }
        return res.status(500).send('Internal Server Error');
    })
    .post(async (req , res) => {
        let recipeInfo=req.body;
        try{

            title=recipeInfo.title;
            ingredients=recipeInfo.ingredients;
            cookingSkillRequired=recipeInfo.cookingSkillRequired;
            steps=recipeInfo.steps;

            if(!title) throw 'you must provde title';
            if(!ingredients) throw 'you mustprovide ingderients';
            if(!cookingSkillRequired) throw 'you must provide cookingskillrequired';
            if(!steps) throw 'you must provide steps';
            
            title=helpers.checkTitle(title);
            ingredients=helpers.checkIngredients(ingredients);
            cookingSkillRequired=helpers.checkcookingSkillRequired(cookingSkillRequired);
            steps=helpers.checkSteps(steps);

        }catch(e){
            return res.status(400).json({error: e});
        }
        try{
            userThatPosted={
                _id:req.session.user.id,
                username:req.session.user.username
            }
            const result=await recipeData.create_recipes(title,ingredients,cookingSkillRequired,steps,userThatPosted);
            if(result!==null){
                return res.status(200).json(result);
            }
        }catch(e){
            return res.status(404).json({error: e});
        }
        return res.status(500).send('Internal Server Error');
    });

router
    .route('/recipes/:id')
    .get(async (req , res) => {
        try {
            if(!req.params.id) throw 'you must provide recipe ID';
            req.params.id = helpers.checkId(req.params.id);
        }catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            const recipe = await recipeData.getRecipeById(req.params.id);
            if(recipe!==null){
                return res.status(200).json(recipe);
            }
        }catch(e) {
            return res.status(404).json({error:e});
        }
    })
    .patch(async (req, res) => {
        let recipeInfo=req.body;
        try {
            if(!req.params.id) throw 'you must provide recipe ID';
            req.params.id = helpers.checkId(req.params.id);
        }catch (e) {
            return res.status(400).json({error: e});
        }


        try {
            var old_recipe = await recipeData.getRecipeById(req.params.id);
            if(old_recipe==null){
                throw 'can not find the recipe with this id';
            }
        }catch(e) {
            return res.status(404).json({error:e});
        }


        try{
            if(old_recipe.userThatPosted.username.trim()!=req.session.user.username.trim()){
                throw 'you cannot update this recipe. you can only update recipe posted by you';
            }
        }catch(e){
            return res.status(403).json({error:e});
        }


        try{
            title=recipeInfo.title;
            ingredients=recipeInfo.ingredients;
            cookingSkillRequired=recipeInfo.cookingSkillRequired;
            steps=recipeInfo.steps;
            if(!title && !ingredients && !cookingSkillRequired && !steps){
                throw 'you must pass atleast one parameter';
            }
            if(title!==undefined){
                title=helpers.checkTitle(title);
                if(title==old_recipe.title){
                    throw 'old and new title are same!';
                }
            }else{
                title=old_recipe.title;
            }

            if(ingredients!=undefined){
                ingredients=helpers.checkIngredients(ingredients);
                if(ingredients==old_recipe.ingredients){
                    throw 'old and new ingredients are same!';
                }
            }else{
                ingredients=old_recipe.ingredients;
            }

            if(cookingSkillRequired!=undefined){
                cookingSkillRequired=helpers.checkcookingSkillRequired(cookingSkillRequired);
                if(cookingSkillRequired==old_recipe.cookingSkillRequired){
                    throw 'old and new cookingSkillRequired are same!';
                }
            }else{
                cookingSkillRequired=old_recipe.cookingSkillRequired;
            }

            if(steps!=undefined){
                steps=helpers.checkSteps(steps);
                if(steps==old_recipe.steps){
                    throw 'old and new steps are same!';
                }
            }else{
                steps=old_recipe.steps;
            }

        }catch(e){
            return res.status(400).json({error: e});
        }


        try{
            const result=await recipeData.patchRecipe(req.params.id,title,ingredients,cookingSkillRequired,steps);
            if(result!==null){
                return res.status(200).json(result);
            }
        }catch(e){
            return res.status(404).json({error:e});
        }
    })

router
    .route('/recipes/:id/comments')
    .post(async (req, res) => {
        let commentInfo=req.body;
        try{
            if(!req.params.id) throw 'you must provide recipe ID';
            var comment=commentInfo.comment;
            var comment=helpers.checkComment(comment);
            req.params.id = helpers.checkId(req.params.id);

        }catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const recipe = await recipeData.getRecipeById(req.params.id);
            if(recipe==null){
                throw 'no recipe found with this id ';
            }
            userThatPosted={
                _id:req.session.user.id,
                username:req.session.user.username
            }
            const recipe_=await recipeData.addComment(req.params.id,userThatPosted,comment);
            if(recipe_!==null){
                return res.status(200).json(recipe_);
            }
        }catch(e){
            return res.status(404).json({error:e});
        }
    })

router
    .route('/recipes/:id/:commentid')
    .delete(async (req, res)=> {
        try{
            if(!req.params.id) throw 'you must provide recipe ID';
            if(!req.params.commentid) throw 'you must provide comment ID';
            req.params.id = helpers.checkId(req.params.id);
            req.params.commentid = helpers.checkId(req.params.commentid);
            
        }catch(e){
            return res.status(400).json({error: e});
        }

        try{
            var re=await recipeData.getRecipeById(req.params.id);
            if(re==null) throw 'no recipe found with this id';
            var original_comment=await recipeData.getCommentByID(req.params.id,req.params.commentid); 
            if(original_comment==null) throw 'no comment found with this id';
        }catch(e){
            return res.status(404).json({error: e});
        }

        try{
            if(original_comment.userThatPostedComment.username.trim()!=req.session.user.username.trim()){
                throw 'you cannot delete this comment. you can only delete comment posted by you';
            }
        }catch(e){
            return res.status(403).json({error:e});
        }

        try{
            const updated_recpe=await recipeData.deleteComment(req.params.id,req.params.commentid);
            if(updated_recpe!=null){
                return res.status(200).json(updated_recpe);
            }
        }catch(e){
            return res.status(404).json({error:e});
        }
    })

router
    .route('/recipes/:id/likes')
    .post(async (req,res) => {
        try {
            if(!req.params.id) throw 'you must provide recipe ID';
            req.params.id = helpers.checkId(req.params.id);
        }catch (e){
            return res.status(400).json({error: e});
        }
        try {
            const recipe = await recipeData.getRecipeById(req.params.id);
            if(recipe==null){
                throw 'no recipe found with this id ';
            }
        }catch(e) {
            return res.status(404).json({error:e});
        }
        try{
            const liked_recipe=await recipeData.addAndRemoveLike(req.params.id,req.session.user.id);
            if(liked_recipe!==null){
                return res.status(200).json(liked_recipe);
            }
        }catch(e){
            return res.status(404).json({error:e});
        }
    })


module.exports = router;