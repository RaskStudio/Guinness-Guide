const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'reviews.json');

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use(express.json());
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Gem filen med timestamp for at undgå navne-konflikter + original endelse
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Hent alle anmeldelser
app.get('/api/reviews', (req, res) => {
    // Tjek om filen findes, hvis ikke, opret en tom
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]');
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Kunne ikke læse data' });
        }
        res.json(JSON.parse(data));
    });
});

// API: Gem en ny anmeldelse (Med billede upload)
app.post('/api/reviews', upload.single('image'), (req, res) => {
    // req.body indeholder tekst-felterne
    // req.file indeholder info om det uploadede billede
    
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let reviews = [];
        if (!err && data) {
            reviews = JSON.parse(data);
        }

        const newReview = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            name: req.body.name,
            ratingGuinness: req.body.ratingGuinness,
            ratingPour: req.body.ratingPour,
            ratingService: req.body.ratingService,
            smoking: req.body.smoking === 'true',
            price: req.body.price,
            comment: req.body.comment,
            imagePath: req.file ? '/uploads/' + req.file.filename : null
        };
        
        reviews.push(newReview);

        fs.writeFile(DATA_FILE, JSON.stringify(reviews, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Kunne ikke gemme data' });
            }
            res.json({ message: 'Anmeldelse gemt!', review: newReview });
        });
    });
});

// API: Opdater en anmeldelse
app.put('/api/reviews/:id', upload.single('image'), (req, res) => {
    const id = parseInt(req.params.id);
    
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Kunne ikke læse data' });
        
        let reviews = JSON.parse(data);
        const index = reviews.findIndex(r => r.id === id);
        
        if (index === -1) return res.status(404).json({ error: 'Anmeldelse ikke fundet' });

        // Behold gammelt billede hvis der ikke er uploadet et nyt
        const oldReview = reviews[index];
        const newImagePath = req.file ? '/uploads/' + req.file.filename : oldReview.imagePath;

        const updatedReview = {
            ...oldReview,
            name: req.body.name,
            ratingGuinness: req.body.ratingGuinness,
            ratingPour: req.body.ratingPour,
            ratingService: req.body.ratingService,
            smoking: req.body.smoking === 'true',
            price: req.body.price,
            comment: req.body.comment,
            imagePath: newImagePath
        };

        reviews[index] = updatedReview;

        fs.writeFile(DATA_FILE, JSON.stringify(reviews, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Kunne ikke gemme data' });
            res.json({ message: 'Opdateret!', review: updatedReview });
        });
    });
});

// API: Slet en anmeldelse
app.delete('/api/reviews/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Kunne ikke læse data' });

        let reviews = JSON.parse(data);
        const filteredReviews = reviews.filter(r => r.id !== id);

        fs.writeFile(DATA_FILE, JSON.stringify(filteredReviews, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Kunne ikke gemme data' });
            res.json({ message: 'Slettet!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});