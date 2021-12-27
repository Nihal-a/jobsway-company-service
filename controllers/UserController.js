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
            const allAppliedUsersByHr = await db.get().collection(collection.JOBS_COLLECTION).aggregate([
                { $match : { hrId : ObjectId(hrId) } } ,
                { $unwind : "$applications" },
                { $project : { applications : 1 } }
            ]).toArray()

            res.status(200).json(allAppliedUsersByHr)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    getShortListedApplicantsByHr : async (req , res) => {
        const { hrId } = req.params

        try {
            const allShortListedApplicants = await db.get().collection(collection.JOBS_COLLECTION).aggregate([
                { $match : { hrId : ObjectId(hrId) } } ,
                { $unwind : "$applications" },
                { $project : { applications : 1 , _id : 0} },
                { $match : { "applications.status" : "SHORTLISTED" } } ,
            ]).toArray()

            res.status(200).json(allShortListedApplicants)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    }
}