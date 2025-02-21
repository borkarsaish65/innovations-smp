let kafkaClient = require('./kafka')();
require('dotenv').config();
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to read Excel file
async function readExcel(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);

      // Get the first sheet name
      const sheetName = workbook.SheetNames[0];

      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      resolve(jsonData);
    } catch (err) {
      reject(err);
    }
  });
}

// Function to read CSV file
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const csvData = fs.readFileSync(filePath, 'utf8');
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index].trim();
        });
        return obj;
      });
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

// Dependencies
const kafkaCommunicationsOnOff =
  !process.env.KAFKA_COMMUNICATIONS_ON_OFF ||
  process.env.KAFKA_COMMUNICATIONS_ON_OFF != "OFF"
    ? "ON"
    : "OFF";
const emailSubmissionTopic = process.env.SUBMISSION_TOPIC
  ? process.env.SUBMISSION_TOPIC
  : "dev.notification";

// User Credentials
let cred = [
  {
    name: "praveen",
    email: "praveen@gmail.com",
    password: "password",
  },
  {
    name: "Saish",
    email: "saish@gmail.com",
    password: "password",
  },
  {
    name: "Mallan",
    email: "mallan@gmail.com",
    password: "password",
  },
];

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

// Email content
const generateEmailContent = ( projectDetails) => {

  let projectRows = projectDetails
    .map(
      (project) =>
        `<tr style="text-align: center;">
          <td style="padding: 10px;">${project["Template Name"]}</td>
          <td style="padding: 10px;">${project["Status"]}</td>
        </tr>`
    )
    .join("");

  return `
      <h3 style="color: #333; margin-top: 20px;">Mentoring Details</h3>
      <table border="1" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
        <thead style="background-color: #f4f4f4;">
          <tr>
            <th style="padding: 10px;">Template Name</th>
            <th style="padding: 10px;">Template Status</th>
          </tr>
        </thead>
        <tbody>
          ${projectRows}
        </tbody>
      </table>
      <p style="margin-top: 20px;">Thank you!</p>
      <p>Best regards,<br><strong>Automated Notification System</strong></p>
    </div>
  `;
};

let mailOptions;

// Request body for the email
const sendEmail = async (newUsers, projectDetails) => {
  let emailContent = await generateEmailContent(newUsers, projectDetails);
  return (mailOptions = {
    to: process.env.EMAIL_TO_ADDRESS,
    cc: process.env.EMAIL_TO_CC_ADDRESS,
    subject: "Monthly Update: New User Credentials Inserted",
    body: emailContent,
  });
};

// Send email
const sendMail = async () => {
  console.log("Starting email script...");
  const projectFilePath = "MentoringDetails.csv"; // Path to your CSV file

  const projectData = await readCSV(projectFilePath); // Await the project data

  console.log(projectData, "this is the project data");

  const requestBody = {
    type: "email",
    email: await sendEmail(projectData),
  };

  let newData = await pushEmailDataToKafka(requestBody);
  console.log(newData, "this is after pushing successfully");
};

// Start execution and exit when done
(async () => {
  await sendMail();
  process.exit(0); // Gracefully exit the script
})();
