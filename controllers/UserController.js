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
                { $project : { jobTitle : 1 ,  applications : 1 } },
                { $unwind : "$applications" },
                { $match : { "applications.status" :  "PENDING"}}
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
                { $match : { "applications.status" : "SHORTLISTED" } } ,
                { $project : { applications : 1} },

            ]).toArray()

            res.status(200).json(allShortListedApplicants)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    getUserTaskCompleted : async (req ,res) => {
        const { hrId }  = req.params
        try {
            let hrTasksCompletedUsers = await db.get().collection(collection.USER_TASK_COLLECTION).find( { $and : [ {hrId : ObjectId(hrId) } , {status : "COMPLETED"}] } )

            res.status(200).json(hrTasksCompletedUsers)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    doSearch : async (req,res) => {
        const { keyword } = req.params

        try {
            let searchResult = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match : {
                        $and : [
                            {
                                $or : [
                                    {
                                        name : { $regex: `${keyword}`, $options: 'i' }
                                    } ,
                                    {
                                        designation : {  $regex: `${keyword}`, $options: 'i'  }
                                    } ,
                                    {
                                        location : {  $regex: `${keyword}`, $options: 'i' }
                                    }
                                ]
                            },
                            {
                                ban : false
                            },
                            {
                                premium : true
                            }
                        ]
                    }
                }
            ]).toArray()

            res.status(200).json(searchResult)
            
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }

    }
}