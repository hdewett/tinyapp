const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {getUserByEmail, urlsForUser, generateRandomString} = require("./helpers");

app.use(cookieSession({
  name: "session",
  keys: ["ballsmoiSkipper"],
}));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {};

const users = {};

// GET and POST routes below:
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// This route is just for fun
app.get("/hello", (req, res) => {
  res.send("<html><body>You've found a secret page! <b><a href=\"/urls\">click here</a></b> to redirect to the home page.</body></html>\n");
});

// Home
app.get("/urls", (req, res) => {

  if (req.session["user_id"]) {
    const templateVars = {
      urls: urlsForUser(req.session["user_id"], urlDatabase),
      user: users[req.session["user_id"]],
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please <a href=\"/login\">login</a> or <a href=\"/register\">register</a> to view URLs page.");
  }

  
});

//save longURL and userID to urlDatabase
app.post("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const randomString = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[randomString] = {"longURL": longURL};
    urlDatabase[randomString]["userID"] = req.session["user_id"];
    res.redirect(`/urls/${randomString}`);
  } else {
    res.send("You must be <a href=\"/login\">logged in</a> to shorten URLs.");
  }
});

// Create new URL page route.
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  if (req.session["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Edit URL page route.
app.get("/urls/:id", (req, res) => {

  let userURLs = urlsForUser(req.session["user_id"], urlDatabase);

  if (req.session["user_id"]) {
    if (!userURLs[req.params.id]) {
      res.send("You can only edit your own URLs.");
    } else {
      const templateVars = { id: req.params.id, longURL: userURLs[req.params.id]["longURL"], user: users[req.session["user_id"]] };
      res.render("urls_show", templateVars);
    }
  } else {
    res.send("Please <a href=\"/login\">login</a> or <a href=\"/register\">register</a> to view your URL pages.");
  }
});

// URL edit POST.
app.post("/urls/:id/edit", (req, res) => {
  let userURLs = urlsForUser(req.session["user_id"], urlDatabase);
  if (userURLs[req.params.id]) {
    const longURL = req.body.longURL;
    urlDatabase[req.params.id]["longURL"] = longURL;
    res.redirect("/urls");
  } else {
    res.send("This URL does not belong to you.");
  }
});

// delete url route.
app.post("/urls/:id/delete", (req, res) => {
  let userURLs = urlsForUser(req.session["user_id"], urlDatabase);
  if (userURLs[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("This URL does not belong to you.");
  }
});

// Redirects to the longURL website.
app.get("/u/:id", (req, res) => {
  
  if (urlDatabase[req.params.id] === undefined) {
    res.send("No URL is associated with this id.");
  } else {
    const longURL = urlDatabase[req.params.id]["longURL"];
    res.redirect(longURL);
  }
});

// Takes the user to registration page and calls the user_registration.ejs.
app.get("/register", (req, res) => {
  const templateVars = {user: "" };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("user_registration", templateVars);
  }
});

// Registration POST route.
app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "" || getUserByEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const randomUserID = generateRandomString();
    const user_id = randomUserID;
  
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

// Login page route.
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };

  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Login POST route.
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

// Logout POST route.
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

