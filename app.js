const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadsDir));

app.use(express.static('public'));

app.post('/api/upload', upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedFileNames = req.files.map(file => file.filename);
    console.log('Files uploaded:', uploadedFileNames);

    res.status(200).json({
        message: 'Files uploaded successfully!',
        fileNames: uploadedFileNames,
        urls: uploadedFileNames.map(name => `/uploads/${name}`)
    });
});

app.get('/api/images', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return res.status(500).json({ message: 'Failed to retrieve images.' });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        const imageUrls = imageFiles.map(file => `/uploads/${file}`);
        res.status(200).json(imageUrls);
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open http://localhost:${port}/index.html in your browser.`);
});
