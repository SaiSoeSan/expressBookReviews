const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password are required" });
  }

  let userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Success: register the new user
  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let keys = Object.keys(books);
  let matchingBooks = [];

  keys.forEach((key) => {
    if (books[key].author === author) {
        matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const keys = Object.keys(books);
    const matchingBooks = [];
  
    keys.forEach((key) => {
      if (books[key].title === title) {
        matchingBooks.push(books[key]);
      }
    });
  
    if (matchingBooks.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});
/* ------------------------------------------------------------------
   Tasks 10-13: Promises / async-await with Axios
   These use /async/... routes that call the original routes above.
------------------------------------------------------------------- */
 
const baseUrl = (req) => `${req.protocol}://${req.get('host')}`;
 
const handleError = (res, error, fallbackMessage) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({ message: fallbackMessage });
};
 
// Task 10: get all books (async-await)
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl(req)}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return handleError(res, error, "Error fetching book list");
  }
});
 
// Task 11: get book by ISBN (Promise callbacks)
public_users.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`${baseUrl(req)}/isbn/${encodeURIComponent(req.params.isbn)}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => handleError(res, error, "Error fetching book by ISBN"));
});
 
// Task 12: get books by author (async-await)
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(
      `${baseUrl(req)}/author/${encodeURIComponent(req.params.author)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return handleError(res, error, "Error fetching books by author");
  }
});
 
// Task 13: get books by title (async-await)
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(
      `${baseUrl(req)}/title/${encodeURIComponent(req.params.title)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return handleError(res, error, "Error fetching books by title");
  }
});

module.exports.general = public_users;
