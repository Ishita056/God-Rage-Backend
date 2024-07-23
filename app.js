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


require('dotenv').config()
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


const data = {
      title: "GCPL-Investors-Presentation-Aug-2013[1]",
      content:  "Based on this documentation, it appears to be discussing six core priorities or areas where focus will lie moving forward.\n\nThe first priority mentioned seems related to achieving Category Leadership through Core Competencies within specific categories (not specified). The second area focuses on International Growth with no further details shared about what kind(s) international expansion plans exist at present time period Q4 FY2013 - Q1 FY2020).\n\nThirdly there's emphasis placed upon Innovation as well Renovation which could indicate efforts towards updating existing products/services while introducing new ones; though more information isn’t available here regarding these initiatives’ specifics during those same quarters from '12-'15 timeframe when we see numbers like India Net Sales % increase by around ~40%.\n\nLastly empathy Expression also gets highlighted but without any concrete examples illustrating how exactly they plan implement such strategies across their business operations over next few years ahead since last reported financial results were published back then before year started ending March'19th date mark! Would love clarification if possible please provide me some insight into your thoughts behind prioritizing certain aspects above others? Thanks again I appreciate sharing knowledge freely today – let’s keep exploring together now because our journey has only begun yet still much left unexplored out there waiting discovery... What else can help guide us better understanding current situation so far presented thusfar? Thankyou kindly oncemore!",
      fileName: "GCPL-Investors-Presentation-Aug-2013[1].pdf"
    }
    // {
    //   title: "Indian-FMCG-Industry-Presentation[1]",
    //   content: " Based on the provided context about changing demographics, I can give you a summary that covers the key points.\n\nThe report highlights how the growing middle class and young population are driving consumption in various industries. To stay ahead of this trend, companies need to adapt to new consumer behaviors and preferences.\n\nIn terms of FMCG trends and innovations in 2023, sustainability, customer experience, digitalization, data analytics, and business development are expected to play a significant role. The report also mentions intelligence, e-commerce, blockchain, and opening up new opportunities as important areas to focus on.\n\nSome specific statistics mentioned in the report include:\n\n* 16% growth in the FMCG industry\n* 65% of consumers prioritizing sustainability when making purchasing decisions\n* 10% increase in e-commerce sales\n* 3% growth in blockchain-based transactions\n\nOverall, the report emphasizes the importance of understanding changing demographics and adapting to new trends and technologies to remain competitive in the market.\n\nPlease note that some sections of the text appear to be incomplete or unclear, which may affect the accuracy of my summary.",
    //   fileName: "Indian-FMCG-Industry-Presentation[1].pptx"
    // },
    // {
    //   title: "GCPL_Annual[1]",
    //   content: "Hi there! I\'d be happy to help with summarizing this lengthy document about evaluating corporate governance structures.\n\n\nFrom what it seems like based solely off these extracts from different sections throughout the doc., here\'s my attempt at condensing its essence:\n\n\n*Main Points:\n\n\n The purpose was assessing how well-presented were both Consolidated Financial Statements as well as Standalone ones by considering factors such as disclosure quality & accuracy regarding representing actual business dealings fairly.\n\n\n\nAdditionally:\n\n\n\n- There might have been some discussion around operational results across subsidiaries globally; though specific numbers aren’t mentioned directly inside those snippets shared earlier today!\n\n\n\nIt appears they tried integrating their own unique perspective through Integrated Reporting – sharing info related mainly focusing upon creating lasting benefits among diverse stakeholder groups while exploring connections linking crucial concerns/strategies/performance metrics together!\n\nIf anything else pops out or if further clarification needed please let me assist again anytime soon? Would love helping clarify any doubts before moving forward now!",
    //   fileName: "GCPL_Annual_Report_2022_23[1].pdf"
    // },
    // {
    //   title: "pwc-ai-analysis-sizing-the-prize-report[1]",
    //   content: "Hi there! I\'d be happy to help with summarizing this report about evaluating the fairness representation of some financial documents.\n\n\nFrom what\'s presented here, it seems like someone or something needs to assess if these reports accurately show how money was made/moved within different companies/subsidiary businesses across geographical areas during one specific time period - let me call them \'fiscal years\'. They want us to look at both combined (\'consolidated\') as well as individual standalone records; examining their organization layout alongside any additional information shared through notes/descriptions called disclosures. The goal? To ensure everything makes sense based upon actual business dealings happening behind those numbers.\n\n\n\nWouldn’t mind knowing where we go from now – perhaps exploring further sections mentioned (Results, etc.) might provide better insight into specifics regarding each subsidiary location worldwide?\n\nWhat would YOU LIKE TO KNOW MORE ABOUT FROM THIS REPORT?\nPlease feel free asking another query anytime!\n(I hope my response meets expectations!",
    //   fileName: "pwc-ai-analysis-sizing-the-prize-report[1].docx"
    // }]


    app.get('/', function(req, res){
      res.json({message:"Hello from God-Rage Backend Server "})
    });

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log("hello")
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const authClient = await authorize();

  try {
    const file = await uploadFileToDrive(authClient, req.file.path, req.file.originalname);
    let documentMetadatas = [];
    console.log(file.name);
    documentMetadatas.push(file.name);

    // console.log(`Uploading ${documentMetadatas}`);

    const apiResponse = await axios.post(`${process.env.COLAB_HOST}/metdata`, {
      "fileNames": documentMetadatas
    });

    // Send the response from the API back to the client

//     const api =[
//   {
//     "summary": "Based on this documentation, it appears to be discussing six core priorities or areas where focus will lie moving forward. The first priority mentioned seems related to achieving Category Leadership through Core Competencies within specific categories (not specified). The second area focuses on International Growth with no further details shared about what kind(s) international expansion plans exist at present time period Q4 FY2013 - Q1 FY2020. Thirdly there's emphasis placed upon Innovation as well Renovation which could indicate efforts towards updating existing products/services while introducing new ones; though more information isn’t available here regarding these initiatives’ specifics during those same quarters from '12-'15 timeframe when we see numbers like India Net Sales % increase by around ~40%. Lastly empathy Expression also gets highlighted but without any concrete examples illustrating how exactly they plan implement such strategies across their business operations over next few years ahead since last reported financial results were published back then before year started ending March'19th date mark! Would love clarification if possible please provide me some insight into your thoughts behind prioritizing certain aspects above others? Thanks again I appreciate sharing knowledge freely today – let’s keep exploring together now because our journey has only begun yet still much left unexplored out there waiting discovery... What else can help guide us better understanding current situation so far presented thusfar? Thankyou kindly oncemore!"
//   }
// ]
    res.send({
      status: 200,
      fileName: file.name,
      fileUrl: file.url,
      // document: api
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
    const response = await axios.post(`${process.env.COLAB_HOST}/response`, {
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
  console.log(process.env.COLAB_HOST);
  console.log(`Server running on port ${port}`);
});
