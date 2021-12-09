require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const {createHmac} = require('crypto')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


module.exports = {
    showWelcome : async (req,res) => {
        res.send('Hey , Welcome to JobsWay Company Service.')
    },
    getCompanyDetails :async (req,res) => {
        const id = req.params.id
        try {
            var company = await db.get().collection(collection.COMPANY_COLLECTION).findOne({_id : ObjectId(id)})

            res.status(200).json({company})
        } catch (error) {
            res.status(500).json({error})
        }
    },
    getCompanyJobs : async(req,res) => {
        const id = req.params.id
        try {
            const companyJobs = await db.get().collection(collection.JOBS_COLLECTION).find({
                $and : [
                    { companyId : ObjectId(id) },
                    { status : true }
                ]
            }).toArray()

            res.status(200).json(companyJobs)

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    }
}