var express = require('express');
var router = express.Router();
const  userModel=require("./users");
const postModel=require("./posts");
const passport=require("passport");
const upload=require("./multer");
const localStrategy=require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
  
  res.render('login',{error: req.flash('error')});
});

router.get('/feed', function(req, res, next) {
  res.render('feed');
});
router.post('/upload',isLoggedIn, upload.single("file"),async function(req, res, next) {
  if(!req.file)
  {
    res.status(404).send("no files were given ");
  }
  console.log(req.body)
  const user= await userModel.findOne({username: req.session.passport.user});
  const post=  await postModel.create({
      image:req.file.filename,
      postText:req.body.filecaption,
      user:user._id
    })
    user.posts.push(post._id);
    await user.save();
    res.send("done");
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user=await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts")
  res.render("profile",{user});
});


router.post("/register",function(req,res)
{
  const { username, email, fullname } = req.body;
  const userdata = new userModel({ username, email, fullname });
  userModel.register(userdata,req.body.password)
  .then(function()
  {
    passport.authenticate("local")(req,res,function()
    {
      res.redirect("/profile");
    })
  })
})

router.post("/login", passport.authenticate("local",
{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true
}),
  function(req,res)
  {

  });

router.get("/logout",function(req,res)
{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
});
})

function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}




// router.get('/alluserposts',async function(req,res)
// {
//   let user=await userModel.findOne({_id:"65ae483aaf32dc8529234ac7"}).populate('posts');
//   res.send(user);

// })

// router.get('/createuser', async function(req, res, next) {
//   let createduser= await userModel.create({
//     username:"Nikita",
//     password: "cale",
//     posts: [],
//     email: "nikita@gmail.com",
//     fullname:"Nikita Bisht",
//   })
//   res.send(createduser);
// });

// router.get('/createpost', async function(req, res, next) {
//   let createdpost= await postModel.create({
//     postText:"Jai shri Raam",
//     user:"65ae483aaf32dc8529234ac7"

//   });
//   let user=await userModel.findOne({_id:"65ae483aaf32dc8529234ac7"});
//   user.posts.push(createdpost._id);
//   await user.save()

//   res.send("done");
// });

module.exports = router;
