const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Initialiser Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Din nøglefil

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Firestore database instans

const app = express();
const PORT = process.env.PORT || 8080;

// Konfigurer Multer til fil-uploads (stadig lokalt)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Hent alle anmeldelser fra Firestore
app.get('/api/reviews', async (req, res) => {
    try {
        const reviewsRef = db.collection('reviews');
        const snapshot = await reviewsRef.orderBy('date', 'desc').get(); // Sorter efter dato
        
        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        res.json(reviews);
    } catch (error) {
        console.error('Fejl ved hentning af anmeldelser fra Firestore:', error);
        res.status(500).json({ error: 'Kunne ikke hente anmeldelser' });
    }
});

// API: Gem en ny anmeldelse til Firestore
app.post('/api/reviews', upload.single('image'), async (req, res) => {
    try {
        const newReviewData = {
            date: new Date().toISOString().split('T')[0],
            name: req.body.name,
            ratingGuinness: parseInt(req.body.ratingGuinness),
            ratingPour: parseInt(req.body.ratingPour),
            ratingService: parseInt(req.body.ratingService),
            smoking: req.body.smoking === 'true',
            price: parseInt(req.body.price),
            comment: req.body.comment,
            imagePath: req.file ? '/uploads/' + req.file.filename : null
        };
        
        const docRef = await db.collection('reviews').add(newReviewData);
        res.json({ message: 'Anmeldelse gemt!', review: { id: docRef.id, ...newReviewData } });
    } catch (error) {
        console.error('Fejl ved gemning af anmeldelse til Firestore:', error);
        res.status(500).json({ error: 'Kunne ikke gemme anmeldelse' });
    }
});

// API: Opdater en anmeldelse i Firestore
app.put('/api/reviews/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id; // Firebase ID er en string
        const reviewRef = db.collection('reviews').doc(id);
        const doc = await reviewRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Anmeldelse ikke fundet' });
        }

        const oldReviewData = doc.data();
        const newImagePath = req.file ? '/uploads/' + req.file.filename : oldReviewData.imagePath;

        const updatedReviewData = {
            name: req.body.name,
            ratingGuinness: parseInt(req.body.ratingGuinness),
            ratingPour: parseInt(req.body.ratingPour),
            ratingService: parseInt(req.body.ratingService),
            smoking: req.body.smoking === 'true',
            price: parseInt(req.body.price),
            comment: req.body.comment,
            imagePath: newImagePath
        };
        
        await reviewRef.update(updatedReviewData);
        res.json({ message: 'Anmeldelse opdateret!', review: { id: id, ...updatedReviewData } });
    } catch (error) {
        console.error('Fejl ved opdatering af anmeldelse i Firestore:', error);
        res.status(500).json({ error: 'Kunne ikke opdatere anmeldelse' });
    }
});

// API: Slet en anmeldelse fra Firestore
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.collection('reviews').doc(id).delete();
        res.json({ message: 'Anmeldelse slettet!' });
    } catch (error) {
        console.error('Fejl ved sletning af anmeldelse fra Firestore:', error);
        res.status(500).json({ error: 'Kunne ikke slette anmeldelse' });
    }
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});