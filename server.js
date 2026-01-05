const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Server statiske filer fra 'public' mappen
app.use(express.static(path.join(__dirname, 'public')));

// Rute til forsiden (selvom express.static tager sig af index.html automatisk, er det godt at være eksplicit)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});