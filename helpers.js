const {ObjectId} = require('mongodb');
const re_for_uppercase=/[A-Z]/;
const re_for_letters=/[a-zA-Z]/;
const re_for_numbers=/\d/;
const re_for_specialcharacter=/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
const re_for_specialcharacter_and_number=/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~1234567890]/;

function checkId(id){
    if (!id) throw 'You must provide a ID';
    if (typeof id !== 'string') throw 'ID must be a string';
    id = id.trim();
    if (id.length === 0)
      throw 'ID cannot be an empty string or just spaces';
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    return id;
}

function checkTitle(title){
    if (typeof title !== 'string') throw 'title must be a string';
    if (title.trim().length === 0) throw 'Title cannot be an empty string or string with just spaces';
    title=title.trim();   
    if(title.trim().length<2) throw 'title must be at least two characters';
    if(re_for_specialcharacter.test(title)) throw 'you can not include special characters in title';
    return title;
}

function checkIngredients(ingredients){
    if(!Array.isArray(ingredients)) throw 'ingredients must be an array';
    if(ingredients.length<3) throw 'ingredients must contain atleast 3 ingredients';
    for (const i in ingredients) {
      if(typeof ingredients[i] !== 'string' || ingredients[i].trim().length===0){
        throw 'One or more ingredients is not a valid string or is an empty string';
      }
      ingredients[i]=ingredients[i].trim();
    }
    for (const i in ingredients) {
        if(ingredients[i].length<3 || ingredients[i].length>50){
          throw 'One or more ingredients have length of less than 3 or more than 50';
        }
    }
    return ingredients;
}

function checkSteps(steps){
    if(!Array.isArray(steps)) throw 'steps must be an array';
    if(steps.length<5) throw 'steps must contain atleast 5 steps';
    for (const i in steps) {
      if(typeof steps[i] !== 'string' || steps[i].trim().length===0 || !re_for_letters.test(steps[i])){
        throw 'One or more steps is not a valid string or is an empty string';
      }
      steps[i]=steps[i].trim();
    }
    for (const i in steps) {
        if(steps[i].length<20 ){
          throw 'One or more steps have length of less than 20';
        }
    }
    return steps;
}

function checkcookingSkillRequired(cookingSkillRequired){
    if (typeof cookingSkillRequired !== 'string') throw 'cookingSkillRequired must be a string';
    if (cookingSkillRequired.trim().length === 0) throw 'cookingSkillRequired cannot be an empty string or string with just spaces';
    cookingSkillRequired=cookingSkillRequired.trim();
    cookingSkillRequired=cookingSkillRequired.toLowerCase();
    const skills=['novice','intermediate','advanced'];
    if(!skills.includes(cookingSkillRequired)){
        throw 'invalid cookingSkillRequired';
    }
    return cookingSkillRequired;
}

function validate_user(username){
    if(typeof username!= 'string') throw 'username is not valid';
    username=username.trim();
    if(username.trim().length==0 ) throw 'username must not be empty string';
    if(username.includes(' ')) throw 'username can not contain spaces';
    if(re_for_specialcharacter.test(username)) throw 'invalid username';
    if(username.length<4) throw 'userame is too short!';
    username=username.toLowerCase();
    return username;
}

function validate_password(password){
    if(typeof password!= 'string') throw 'password is not valid';
    password=password;
    if(password.trim().length==0) throw 'password must not be empty string';
    if(password.includes(' ')) throw 'password can not contain spaces';
    if(password.length<6) throw 'password is too short!';
    if(!re_for_numbers.test(password)) throw 'password does not contain any number in it';
    if(!re_for_uppercase.test(password)) throw 'password does not contain uppercase letter';
    if(!re_for_specialcharacter.test(password)) throw 'password does not contain special character';
    return password;
}

function checkName(name){
  if (typeof name !== 'string') throw 'name must be a string';
  if (name.trim().length === 0) throw 'name cannot be an empty string or string with just spaces';
  name=name.trim();   
  if(re_for_specialcharacter.test(name)) throw 'you can not include special characters in name';
  if(re_for_numbers.test(name)) throw 'you can not include numbers in name';
  if(name.split(' ').length>2 || name.split(' ').length<2) throw 'name must contain firstname and lastname only';
  name.split(' ').forEach(element =>{
        if(element.trim().length<3){
        throw 'the length of first name or last name is less than 3';
        }
    });
  return name;
}

function checkComment(comment){
  if(typeof comment!=='string') throw 'comment must be string';
  if(comment.trim().length ===0) throw 'comment cannot be an empty string or string with just spaces';
  comment=comment.trim();
  if(comment.length<2){
    throw 'comment can not be less than length of 2';
  }
  return comment;
}

module.exports = {
    checkId,
    checkTitle,
    checkIngredients,
    checkSteps,
    checkcookingSkillRequired,
    validate_password,
    validate_user,
    checkName,
    checkComment
}