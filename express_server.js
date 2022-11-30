const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i=0; i<6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // console.log(req.cookies)
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//save longURL to database
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const randomString = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[randomString] = longURL
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

//edits url
app.post("/urls/:id/edit", (req, res) => {
  // console.log(req.body);
  const longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL
  res.redirect("/urls")
})

//login route
app.post("/login", (req, res) => {
  // console.log(req.body.username)
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username)
  res.redirect("/urls")
})