const mongoose = require('mongoose');
const Schema = mongoose.Schema

const sensorDataSchema = new Schema({
    character: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('SensorData', sensorDataSchema)