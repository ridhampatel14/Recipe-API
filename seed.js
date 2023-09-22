const connection = require('./config/mongoConnection');
const data = require('./data');
const recipeData = data.recipes;
const userData= data.users;


const main=async()=>{
  const db = await connection.dbConnection();
  await db.dropDatabase();
  let user1=undefined;
  let recipe1=undefined;
  let recipe2=undefined;
  let recipe3=undefined;
  let comment1=undefined;
  let comment2=undefined;

  try{
    user1=await userData.createUser("test test","test123","Test@123");
  }catch(e){
    console.log(e)
  }

  try{
    user1=await userData.checkUser("test123","Test@123");
}catch(e){
    console.log(e);
  }
  

  try{
    recipe1=await recipeData.create_recipes("fried chicken",
    ["One whole chicken", "2 cups of flour", "2 eggs", "salt", "pepper", "1 cup cooking oil"],
    "novice",
    ["First take the two eggs and mix them with the flour, the salt and the pepper", "Next, dip the chicken into the mix", "take 1 cup of oil and put in frier", "Fry the chicken on medium heat for 1 hour","have fun dude! it is ready have some gains and enjoy the meal"],
    {
        _id:user1._id,
        username:user1.username
    })
  }catch(e){
    console.log(e)
  }

  try{
    comment1=await recipeData.addComment(recipe1._id,
        {
            _id:user1._id,
            username:user1.username
        },
        "goode one!!")
  }catch(e){
    console.log(e);
  }

  try{
    comment1=await recipeData.addAndRemoveLike(recipe1._id,user1._id)
  }catch(e){
    console.log(e);
  }

  try{
    comment1=await recipeData.addComment(recipe1._id,
        {
            _id:user1._id,
            username:user1.username
        },
        "bad one!!")
  }catch(e){
    console.log(e);
  }

  try{
    recipe2=await recipeData.create_recipes("chicken tandoori",
    ["One whole chicken", "2 cups of flour", "2 eggs", "salt", "pepper", "1 cup cooking oil"],
    "novice",
    ["First take the two eggs and mix them with the flour, the salt and the pepper", "Next, dip the chicken into the mix", "take 1 cup of oil and put in frier", "Fry the chicken on medium heat for 1 hour","have fun dude! it is ready have some gains and enjoy the meal"],
    {
        _id:user1._id,
        username:user1.username
    })
  }catch(e){
    console.log(e)
  }

  for (let i = 0; i < 198; i++) {
    try{
        recipe3=await recipeData.create_recipes(`chicken tandoori ${i+1}`,
        ["One whole chicken", "2 cups of flour", "2 eggs", "salt", "pepper", "1 cup cooking oil"],
        "novice",
        ["First take the two eggs and mix them with the flour, the salt and the pepper", "Next, dip the chicken into the mix", "take 1 cup of oil and put in frier", "Fry the chicken on medium heat for 1 hour","have fun dude! it is ready have some gains and enjoy the meal"],
        {
            _id:user1._id,
            username:user1.username
        })
      }catch(e){
        console.log(e)
      }
  }

  await connection.closeConnection();
  console.log('Done!');
}

main();