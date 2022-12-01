const getUserByEmail = function(userEmail, usersDatabase) {
  const usersKeys = Object.keys(usersDatabase);
  for (let key of usersKeys) {
    if (userEmail === usersDatabase[key].email) {
      return usersDatabase[key];
    }
  }
  return false;
};

// Returns the URL's belonging to a given user.
const urlsForUser = function(id, urlDatabase) {
  const urlKeys = Object.keys(urlDatabase);
  let userURLs = {};
  for (let key of urlKeys) {
    if (urlDatabase[key]["userID"] === id) {
      userURLs[key] = {
        longURL: urlDatabase[key]["longURL"],
        userID: urlDatabase[key]["userID"],
      };
    }
  }
  return userURLs;
};

// This is the function to create unique short strings to be used for short urls and user IDs.
const generateRandomString = function() {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

module.exports = {getUserByEmail, urlsForUser, generateRandomString};