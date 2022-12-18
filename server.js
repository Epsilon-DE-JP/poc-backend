const express = require('express');
const multer = require('multer');
const sharp = require('sharp'); // for image compression
const app = express();

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now());
	},
});
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB file size limit
	},
	fileFilter: function (req, file, cb) {
		// Allow only JPEG and PNG files
		if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
		}
	},
});

app.use(express.json());

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
	console.log(req.file); // contains information about the uploaded file
	console.log(req.body);

	// Compress the uploaded image
	sharp(req.file.path)
		.resize({ width: 250 })
		.toFormat('jpeg')
		.jpeg({ quality: 70 })
		.toFile('./compressed/' + req.file.filename + '-compressed.jpg')
		.then(() => {
			console.log('Image compressed successfully!');
			res.send('File uploaded and compressed successfully!');
			//TODO: Call Inference API
			//TODO: Save all data to DB -- possibly use Prisma as an ORM?
		})
		.catch((err) => {
			console.error(err);
			res.send('Error occurred while compressing the image.');
		});
});

app.get('/image/:filename', (req, res) => {
	res.sendFile(__dirname + '/compressed/' + req.params.filename);
});

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
