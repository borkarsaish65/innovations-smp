/**
 * name : kafka.js
 * author : Aman Karki
 * created-date : 08-Sep-2020
 * Description : Kafka Configurations related information.
 */

//dependencies
const kafka = require('kafka-node')
const SUBMISSION_TOPIC = process.env.SUBMISSION_TOPIC
require('dotenv').config()


/**
 * Kafka configurations.
 * @function
 * @name connect
 */

const connect = function () {
	const Producer = kafka.Producer
	KeyedMessage = kafka.KeyedMessage

	const client = new kafka.KafkaClient({
		kafkaHost: process.env.KAFKA_URL,
	})

	client.on('error', function (error) {
		console.log('kafka connection error!',error)
	})

	const producer = new Producer(client)

	producer.on('ready', function () {
		console.log('Connected to Kafka')
	})

	producer.on('error', function (err) {
		console.log('kafka producer creation error!',err)
	})

	// _sendToKafkaConsumers(process.env.SUBMISSION_TOPIC, process.env.KAFKA_URL)



	return {
		kafkaProducer: producer,
		kafkaClient: client,
	}
}


module.exports = connect
