const Book = require('../models/Book')

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    Book.findOne({title: bookObject.title, author: bookObject.author, year: bookObject.year})
    .then (book => {
        if (book) {
            return res.status(409).json({message: 'Livre déjà enregistré'})
        }
        const newbook = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })
        newbook.save()
        .then(() => res.status(201).json({message: 'Livre enregistré'}))
        .catch(error => {res.status(400).json({error})})
    })
    .catch(error => res.status(500).json({error}))
}