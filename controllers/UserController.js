require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const {createHmac} = require('crypto')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


module.exports = {
    getAppliedUsersByHr : async (req , res) => {
        const { hrId } = req.params

        try {
            // let allAppliedUsersByHr = await db.get().collection(collection.)
        } catch (error) {
            
        }
    }
}