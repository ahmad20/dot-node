const express = require('express'); //
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user:  process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  database:  process.env.DB_NAME
});

// Koneksi ke database
db.connect((err) => {
  if (err) throw err;
  console.log('Terhubung ke database');
});

// Middleware
app.use(express.json());

// Authentication middleware
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).send('Tidak ada token yang disediakan');
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).send('Token tidak valid');
  }
};

// Route untuk registrasi user baru
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    name,
    email,
    password: hashedPassword
  };

  const sql = 'INSERT INTO users SET ?';

  db.query(sql, user, (err, result) => {
    if (err) throw err;
    res.send('User berhasil terdaftar');
    });
});

// Route untuk login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(401).send('Email atau password salah');
    }
    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Email atau password salah');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 
      process.env.SECRET_TOKEN, 
      { expiresIn: '1h' });
    res.send({ token });
  });
});
// Route untuk menampilkan semua post
app.get('/posts', auth, (req, res) => {
  const sql = 'SELECT * FROM posts';

  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Route untuk menambah post
app.post('/posts', auth, (req, res) => {
  const { title, content } = req.body;

  const post = {
    title,
    content,
    user_id: req.user.id
  };

  const sql = 'INSERT INTO posts SET ?';

  db.query(sql, post, (err, result) => {
    if (err) throw err;
    res.send('Post berhasil ditambahkan');
  });
});

// Route untuk mengupdate post
app.put('/posts/:id', auth, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;

  const sql = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';

  db.query(sql, [title, content, postId], (err, result) => {
    if (err) throw err;
    res.send('Post berhasil diupdate');
    });
});

// Route untuk menghapus post
app.delete('/posts/:id', auth, (req, res) => {
  const postId = req.params.id;

  const sql = 'DELETE FROM posts WHERE id = ?';

  db.query(sql, [postId], (err, result) => {
    if (err) throw err;
    res.send('Post berhasil dihapus');
  });
});


// Menjalankan server
app.listen(port, () => {
  console.log(`Aplikasi berjalan di http://localhost:${port}`);
});

module.export = app;

// https://documenter.getpostman.com/view/10747973/2s93eX2ZPF
// https://discord.com/invite/RqjqdEvmv2