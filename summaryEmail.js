const fs = require('fs');
let kafkaClient = require('./kafka')();
const successJSON = fs.readFileSync('success.json', 'utf8'); // Read the file
const successJsonData = JSON.parse(successJSON); // Parse JSON
require('dotenv').config();
const axios = require('axios');
const { Readable } = require('stream');

const config2JSON = fs.readFileSync('config2.json', 'utf8'); // Read the file
const config2JsonData = JSON.parse(config2JSON); // Parse JSON

// Dependencies
const kafkaCommunicationsOnOff =
  !process.env.KAFKA_COMMUNICATIONS_ON_OFF ||
  process.env.KAFKA_COMMUNICATIONS_ON_OFF != "OFF"
    ? "ON"
    : "OFF";
const emailSubmissionTopic = process.env.SUBMISSION_TOPIC
  ? process.env.SUBMISSION_TOPIC
  : "dev.notification";

const path = require('path');
const csv = require('csv-parser');

const csvFiles = ['surveyDetails.csv', 'projectDetails.csv','MentoringDetails.csv']; // Array of CSV file names

// Function to read and log CSV file content
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            reject(`File not found: ${filePath}`)
            return;
        }
        console.log(`Reading CSV: ${filePath}`);
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log(row);
                resolve(row)
            })
            .on('end', () => {
                console.log(`Finished reading ${filePath}`);
            })
            .on('error', (err) => {
                reject(err)
                console.error(`Error reading ${filePath}:`, err);
            });



    })
};


/*
// Iterate through the CSV files array and read each file
csvFiles.forEach(file => {
    const filePath = path.resolve(__dirname, file);
    readCSV(filePath);
    console.log('-----------------------------------');
});
*/



async function runCode(){

for(let i=0;i<csvFiles.length;i++){
    const filePath = path.resolve(__dirname, csvFiles[i]);
    await readCSV(filePath);
    console.log('-----------------------------------',i);
}


for(let key in successJsonData){
    console.log(key,successJsonData[key]);
}

let html = generateHtmlContent(successJsonData);

let newData = await pushEmailDataToKafka({
    type: "email",
    email: await sendEmail(html)
  });
console.log(newData, "this is after pushing successfully");
}


runCode().then((data)=>{
    console.log('All files read successfully');
})



// Function to generate HTML table from JSON
const generateHtmlContent = (data) => {
    let html = `<h2>Process Status</h2>`;
    html += `<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
                <tr>
                    <th>Process</th>
                    <th>Status</th>
                </tr>`;

    for (const key in data) {
        html += `<tr>
                    <td>${key}</td>
                    <td>${data[key]}</td>
                </tr>`;
    }

    html += `</table>`;
    return html;
};


const sendEmail = async (html) => {

    let results = await fetchEmailSheetData();
  
    console.log(results,'<---results**');

    let emailAddressArr = results.map((res) => res.email);
  
    let firstEmail = emailAddressArr.shift();
  
    let emailContent = html;
    return (mailOptions = {
      to: firstEmail,
      cc: emailAddressArr.join(','),
      subject: "Cron Script Status",
      body: emailContent,
    });
  };


  async function fetchEmailSheetData() {
    return new Promise(async (resolve,reject)=>{
  
      const sheetUrl = process.env.GOOGLE_DRIVE_FOLDER_URL_FOR_EMAIL_SENDING;
  
  
        try {
            const response = await axios.get(sheetUrl);
            const stream = Readable.from(response.data);
        
            const results = [];
            stream.pipe(csv())
              .on('data', (row) => results.push(row))
              .on('end', () => {
               // console.log(results,'<---');
                resolve(results);
              });
          } catch (error) {
            reject(error);
          }
  
    })
  }
  

  // Pushing to the Kafka event
const pushEmailDataToKafka = function (message) {
    return new Promise(async (resolve, reject) => {
      try {
        let kafkaPushStatus = await pushMessageToKafka([
          {
            topic: emailSubmissionTopic,
            messages: JSON.stringify(message),
          },
        ]);
  
        console.log(kafkaPushStatus, "this is the kafka push status");
  
        return resolve(kafkaPushStatus);
      } catch (error) {
        return reject(error);
      }
    });
  };


  // Push message to Kafka Producers
const pushMessageToKafka = function (payload) {
    return new Promise((resolve, reject) => {
      if (kafkaCommunicationsOnOff != "ON") {
        throw reject("Kafka configuration is not done");
      }
  
      kafkaClient.kafkaProducer.send(payload, (err, data) => {
        if (err) {
          return reject(
            "Kafka push to topic " + payload[0].topic + " failed."
          );
        } else {
          return resolve(data);
        }
      });
    })
      .then((result) => {
        return {
          status: "success",
          message:
            "Kafka push to topic " +
            payload[0].topic +
            " successful with number - " +
            result[payload[0].topic][0],
        };
      })
      .catch((err) => {
        return {
          status: "failed",
          message: err,
        };
      });
  };