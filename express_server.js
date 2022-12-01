const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

app.use(cookieParser())

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//this is the function to create unique short urls
function generateRandomString() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i=0; i<6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

//stores urls
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "custard",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "skipper",
  },
};

//for registration
const users = {
  custard: {
    id: "custard",
    email: "custard@steak.com",
    password: "ilovesteak",
  },
  skipper: {
    id: "skipper",
    email: "skipper@bread.com",
    password: "ilovebread",
  },
};

//takes in an email and return the entire user object or null if not found
const findUserByEmail = function (userEmail) {
  const usersKeys = Object.keys(users);
  for (let key of usersKeys) {
    if (userEmail === users[key].email){
      return users[key];
    }
  }
  return false
};

const urlsForUser = function(id) {
  const urlKeys = Object.keys(urlDatabase);
  let userURLs = {}
  for (let key of urlKeys) {
    if (urlDatabase[key]["userID"] === id) {
      userURLs[key] = {
        longURL: urlDatabase[key]["longURL"],
        userID: urlDatabase[key]["userID"],
      }
    }
  }
  return userURLs
}


//Handlers below
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  if (req.cookies["user_id"]){
    const templateVars = { urls: urlsForUser(req.cookies["user_id"]), user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);
  }
  else {
    res.send("Please <a href=\"/login\">login</a> or <a href=\"/register\">register</a> to view URLs page.");
  }

  
});

//save longURL to database
app.post("/urls", (req, res) => {

if (req.cookies["user_id"]) {
  const randomString = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[randomString]["longURL"] = longURL
  res.redirect(`/urls/${randomString}`);
}
else {
  res.send("You must be <a href=\"/login\">logged in</a> to shorten URLs.");
}

});

// CREATE NEW URL PAGE.
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]["longURL"], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]["longURL"];
  res.redirect("/urls")
})

//edits url
app.post("/urls/:id/edit", (req, res) => {
  const longURL = req.body.longURL
  urlDatabase[req.params.id]["longURL"] = longURL
  res.redirect("/urls")
})

app.get("/u/:id", (req, res) => {
  
  if (urlDatabase[req.params.id] === undefined) {
    res.send("No URL is associated with this id.");
  }
  else{
    const longURL = urlDatabase[req.params.id]["longURL"]
    res.redirect(longURL);
  }
});

//takes me to registration page and calls the user_registration.ejs
app.get("/register", (req, res) => {
  const templateVars = {user: "" };
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  else {
    res.render("user_registration", templateVars);
  }
});
//registration route
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || findUserByEmail(req.body.email)) {
    res.sendStatus(400)
  }
  else {
    const randomUserID = generateRandomString()
    const user_id = randomUserID
  
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", user_id) 
    res.redirect("/urls")
  }
})

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };

  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  else{
    res.render("login", templateVars);
  }
});

//login route
app.post("/login", (req, res) => {
  user = findUserByEmail(req.body.email)
  if (user){
    if(req.body.password === user.password){
      res.cookie("user_id", user.id)
      res.redirect("/urls")
    }
    else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(403)
  }
})

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login")
})

