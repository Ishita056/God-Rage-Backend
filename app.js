const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const mime = require('mime-types');
const axios = require('axios'); // Add this line

const app = express();
const port = 5001;

// Configure CORS
app.use(cors());

// Configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer to handle file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 80 * 1024 * 1024 } // Set file size limit to 80MB
});

const apikeys = require('./godrej-429917-2ff54c6fcc0e.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}

async function uploadFileToDrive(authClient, filePath, fileName) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const mimeType = mime.lookup(fileName) || 'application/octet-stream';

    const fileMetaData = {
      name: fileName,
      parents: ['1ncOYT50fVLbL_b-i9sszxQsUBqfngbuK']
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath)
    };

    drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id, webViewLink'
    }, (error, file) => {
      if (error) {
        return reject(error);
      }
      resolve({
        id: file.data.id,
        name: fileName,
        url: file.data.webViewLink
      });
    });
  });
}



app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const authClient = await authorize();

  try {
    const file = await uploadFileToDrive(authClient, req.file.path, req.file.originalname);
    let documentMetadatas = [];
    console.log(file.name);
    documentMetadatas.push(file.name);

    console.log(`Uploading ${documentMetadatas}`);

    const apiResponse = await axios.post('https://cdb4-34-83-2-31.ngrok-free.app/metdata', {
      "fileNames": documentMetadatas
    });

    // Send the response from the API back to the client
    res.send({
      status: 200,
      fileName: file.name,
      fileUrl: file.url,
      document: apiResponse.data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Google Drive.');
  } finally {
    fs.unlinkSync(req.file.path); // Clean up uploaded file from server
  }
});


app.post('/response', async (req, res) => {
  const { fileName, query } = req.body;
  try {
    console.log(fileName);
    console.log(query);
    const response = await axios.post('https://cdb4-34-83-2-31.ngrok-free.app/response', {
      query: query,
      fileNames: fileName
    })

    if(response.status === 200) {
      console.log(response.data);
      return res.status(200).send(response.data);
    }


    else{
      res.status(500).send('Error uploading file to Google Drive.');
    }

  } catch (err) {
    console.log(err);
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
