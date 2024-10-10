const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // Add bcrypt for hashing passwords
dotenv.config();

const app = express();
const port = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Create the connection to the database

const connection = mysql.createConnection({
    host: 'katana-ngumbao',
    user: 'katanangumbao',
    password: 'katanangu@20',
    database: 'expense_tracker'
  });

// Connect to the database

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to db successfully');
  
    // Create table after connection is established
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;
        
    connection.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error in creating table', err);
          return;
        }
        console.log('Table created successfully', results);
      });
    });

// Define GET routes
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: __dirname });
});

app.get('/register', (req, res) => {
    res.sendFile('register.html', { root: __dirname });
});

// Define POST routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO User (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'Registration successful' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error hashing password', error });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM User WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }
        const user = results[0];
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ message: 'Login successful' });
            } else {
                res.status(400).json({ message: 'Invalid password' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error comparing passwords', error });
        }
    });
});

app.post('/api/index', (req, res) => {
    // Add your index logic here
    res.json({ message: 'Index POST successful' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
