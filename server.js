const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load book data
const booksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'books.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

// API Routes
app.get('/api/books', (req, res) => {
    res.json(booksData);
});

app.get('/api/books/:id', (req, res) => {
    const book = booksData.find(b => b.id == req.params.id);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});