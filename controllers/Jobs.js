require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { validationResult } = require('express-validator')



module.exports = {
    addJob : async (req,res) => {
        const id = req.query.id
        const jobDetails = {...req.body , companyId : ObjectId(id)}
        var errors = validationResult(req)
        
        try {
            
            //Express Validator error.
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            let result  = await db.get().collection(collection.JOBS_COLLECTION).insertOne(jobDetails)

            let job = await db.get().collection(collection.JOBS_COLLECTION).findOne({_id:result.insertedId})

            res.status(200).json({job})
        } catch (error) {
            res.status(500).json({Err : "Something went wrong"})
        }
    },
    addFreeJob: async (req,res) => {
        const jobDetails = req.body

        try {

        await db.get().collection(collection.JOBS_COLLECTION).updateOne({_id: ObjectId(jobDetails.jobId)}, {
            $set : {
                status : true,
                payPlan : 'Free',
            }
        })
            
        res.status(200)
            
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    getJobById : async(req,res) => {
        const id = req.params.id

        try {

            var jobDetails =await db.get().collection(collection.JOBS_COLLECTION).findOne({_id : ObjectId(id)})

            res.status(200).json(jobDetails)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    deleteJob : async(req, res) => {
        const id = req.params.id
        try {
            var deleteJob =await db.get().collection(collection.JOBS_COLLECTION).deleteOne({_id : ObjectId(id)})

            res.status(200).json({msg : 'Job Deteleted Successfully'})

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    editJob : async(req,res) => {

    }
}