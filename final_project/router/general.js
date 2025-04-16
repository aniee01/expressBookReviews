const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Register the new user
  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop

public_users.get('/', async (req, res) => {
  try {
    const fetchBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("Books not found");
        }
      });
    };

    const bookList = await fetchBooks();
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
});

/*
public_users.get('/',function (req, res) {
const books = require("./booksdb.js");
  return res.status(300).send(JSON.stringify(books, null, 4));
});
*/

// Get book details based on ISBN

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

/*public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Get ISBN from request URL
  const book = books[isbn];     // Look up the book by ISBN

  if (book) {
    return res.status(200).json(book); // Send book details if found
  } else {
    return res.status(404).json({ message: "Book not found for the provided ISBN" });
  }
  });*/
  

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const apiUrl = "https://anisaqasim-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/";

  axios.get(apiUrl)
    .then(response => {
      const books = response.data;
      const matchingBooks = [];

      for (let isbn in books) {
        if (books[isbn].author.toLowerCase().includes(author)) {
          matchingBooks.push({ isbn, ...books[isbn] });
        }
      }

      if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
      } else {
        res.status(404).json({ message: "No books found for the given author" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book details: " + error.message });
    });
});

/*public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase(); // Case-insensitive search
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase().includes(author)) { 
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found for the given author" });
  }
});
*/



// Get all books based on title

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const apiUrl = "https://anisaqasim-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/";

  axios.get(apiUrl)
    .then(response => {
      const books = response.data;
      const matchingBooks = [];

      for (let isbn in books) {
        if (books[isbn].title.toLowerCase().includes(title)) {
          matchingBooks.push({ isbn, ...books[isbn] });
        }
      }

      if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
      } else {
        res.status(404).json({ message: "No books found for the given title" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book details: " + error.message });
    });
});

/*public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase(); // get title from URL and normalize
  const matchingBooks = [];

  // Iterate through all books
  for (let isbn in books) {
    if (books[isbn].title.toLowerCase().includes(title)) { // Check if title includes the search term
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks); // Found books by title
  } else {
    res.status(404).json({ message: "No books found for the given title" }); // No match
  }
});
*/


// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book exists
  if (books[isbn]) {
    // Return the reviews of the book
    return res.status(200).json(books[isbn].reviews);
  } else {
    // If book not found
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;


