const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "user12", password: "pwd12" },
  { username: "user13", password: "pwd13" },
  // You can add more users here if needed
];

const isValid = (username)=>{ //returns boolean
//code to check is the username is valid
return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
// code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required"});
  }

// Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate a JWT token
    let accessToken = jwt.sign(
      { data: username },
      'access',        // Secret key
      { expiresIn: 60 * 60 }  // Token expiration (1 hour)
    );

    // Save the token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in.", accessToken: accessToken});
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password."});
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // review passed as query param
  const username = req.session.username;
  
  
   // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if the ISBN exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
   if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });

});
// Delete a book review by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has any reviews
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


