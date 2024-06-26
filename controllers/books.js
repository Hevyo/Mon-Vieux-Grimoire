const Book = require('../models/Book')
const fs = require('fs')

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    Book.findOne({title: bookObject.title, author: bookObject.author, year: bookObject.year})
    .then (book => {
        if (book) {
                    fs.unlink(`images/${req.file.filename}`, (error) => {
                        if(error) throw error
                    })
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

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books)
        }
    ).catch(
        (error) => {
            res.status(404).json({error : error})
        }
    )
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then((book) => {res.status(200).json(book)})
    .catch((error) => {res.status(404).json({error : error})})
}

exports.getBestBooks = (req, res, next) => {
    Book.find()
    .sort({averageRating: -1})
    .limit(3)
    .then((BestRatedBooks) => res.status(200).json(BestRatedBooks))
    .catch((error) => res.status(500).json({error}))
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body}

    delete bookObject._userId

    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message : 'Non autorisé'})
        } else {
            if (req.file) {
                const filename = book.imageUrl.split('/images/')[1]
                    fs.unlink(`images/${filename}`, (error) => {
                        if(error) throw error
                    })
            }
            Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Livre modifié'}))
            .catch((error) => res.status(401).json({error}))
        }
    })
    .catch((error) => {
        res.status(400).json({error})
    })
}

exports.rateABook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then((book) => {
        book.ratings.push({
            userId: req.auth.userId,
            grade: req.body.rating
        })

        let totalRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0)
        book.averageRating = totalRating / book.ratings.length

        book.save()

        .then(book => res.status(200).json(book))
        .catch((error) => {res.status(400).json({error})})
    })
    .catch((error) => {
        res.status(500).json({error})
    })
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non autorisé'})
        } else {
            const filename = book.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => {res.status(200).json({message: 'Livre supprimé'})})
                .catch(error => {res.status(401).json({error})})
            })
        }
    })
    .catch(error => {
        res.status(500).json({error})
    })
}