const express = require('express')
const mongoose = require('mongoose')

const userRoutes = require('./routes/users')
const booksRoutes = require('./routes/books')
const path = require('path')

mongoose.connect('mongodb+srv://evytchr:CFQi5j69fiIHPcuO@mon-vieux-grimoire.eue7p7x.mongodb.net/?retryWrites=true&w=majority&appName=Mon-Vieux-Grimoire')
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(() => console.log('Connexion à MongoDB échouée'))

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json())

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/books', booksRoutes)
app.use('/api/auth', userRoutes)

module.exports = app