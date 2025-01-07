
let kafkaClient = require('./kafka')()
require('dotenv').config()
const XLSX = require('xlsx');

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

// Dependencies
const kafkaCommunicationsOnOff =
  !process.env.KAFKA_COMMUNICATIONS_ON_OFF ||
  process.env.KAFKA_COMMUNICATIONS_ON_OFF != "OFF"
    ? "ON"
    : "OFF";
const emailSubmissionTopic = process.env.SUBMISSION_TOPIC
  ? process.env.SUBMISSION_TOPIC
  : "dev.notification";

//user Credentials
let cred = [
  {
    name:"praveen",
    email: "praveen@gmail.com",
    password: "password",
  },
  {
    name:"Saish",
    email: "saish@gmail.com",
    password: "password",
  },
  {
    name:"Mallan",
    email: "mallan@gmail.com",
    password: "password",
  },
];


// Pushing to the kafka event
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


//Push message to Kafka Producers

const pushMessageToKafka = function (payload) {
	return new Promise((resolve, reject) => {
		if (kafkaCommunicationsOnOff != 'ON') {
			throw reject('Kafka configuration is not done')
		}

		kafkaClient.kafkaProducer.send(payload, (err, data) => {
			if (err) {
				return reject('Kafka push to topic ' + payload[0].topic + ' failed.')
			} else {
				return resolve(data)
			}
		})
	})
		.then((result) => {
			return {
				status: "success",
				message:
					'Kafka push to topic ' +
					payload[0].topic +
					' successful with number - ' +
					result[payload[0].topic][0],
			}
		})
		.catch((err) => {
			return {
				status: 'failed',
				message: err,
			}
		})
}


// Email content
    const generateEmailContent = (newUsers) => {
      let rows = newUsers
        .map(
          (user) =>
            `<tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.password}</td>
            </tr>`
        )
        .join('');
    
      return `
        <p>Dear Team,</p>
        <p>This is an automated notification to inform you that the scheduled cron job has been successfully executed for this month, and new user credentials have been added to the system.</p>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p> SolutionName: </p>
        <p>SolutionLink: <a href="https://solutionlink.com">SolutionLink</a></p>
        <p>Thank you!</p>
        <p>Best regards,<br>Automated Notification System</p>
      `;
    };
    let mailOptions
// Request body for the email
const sendEmail = async (newUsers) => {
   let emailContent = await generateEmailContent(newUsers);
   return mailOptions = {
    to: "praveendass@shikshalokam.org",
    cc: process.env.EMAIL_ADDRESS, 
    subject: 'Monthly Update: New User Credentials Inserted',
    body: emailContent,
  }}

  // send email
  const sendMail=async()=>{
    console.log('Starting email script...')
    const filePath = "UserService.xlsx"; // Path to your Excel file
    const data = await readExcel(filePath); // Await the data
    console.log(data, "this is the data");
    const requestBody = {
      type: "email",
      email: await sendEmail(data),
    };
    let newData = await pushEmailDataToKafka(requestBody);
    console.log(newData, "this is after pushing successfully");
  }

sendMail()