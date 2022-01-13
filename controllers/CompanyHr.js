require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sendEmail = require('../utils/nodeMailer')
const { v4: uuidv4 } = require('uuid');

module.exports = {
    addCompanyHr : async (req , res) => {
        const { name , email } = req.body
        const companyId = req.params.cid

        try {

            const hrExist = await db.get().collection(collection.HR_COLLECTION).findOne({email})

            if(hrExist) return res.status(401).json({msg : 'HR with this Email already exists'})

            const password =await bcrypt.hash(process.env.HR_MODEL_PASSWORD , 10)
            
            let {insertedId} = await db.get().collection(collection.HR_COLLECTION).insertOne({email , name , companyId : ObjectId(companyId) , password , status : 'pending'})

            const hr = await db.get().collection(collection.HR_COLLECTION).findOne({_id : insertedId})

            const secret =  process.env.JWT_SECRET + hr.password

            const payload = { email : hr.email, id : hr._id, }

            const token = jwt.sign(payload , secret , { expiresIn : '15m' })

            const signLink = `${process.env.HOSTURL}/hr-signup-page/${token}/${hr._id}`

            sendEmail(hr.email , "Create Your Hr Account with JobsWay" , {name : hr.name , link : signLink} ,"../Public/Mail/mailTemplate.handlebars")

            delete hr.password

            res.status(200).json({hr , signLink})

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    activateHrAccount : async (req,res) => {
        const {token , hrid} = req.params
        const {password , confirmPassword} = req.body
        try {

            const hrExist = await db.get().collection(collection.HR_COLLECTION).findOne({_id : ObjectId(hrid)})

            if(!hrExist) return res.status(401).json({msg : 'Hr not found OR Invalid Id'})

            const secret = process.env.JWT_SECRET + hrExist.password

            try {
                const { id } = jwt.verify(token , secret) 

                if(confirmPassword !== password) return res.status(401).json({msg : "Password and confirm password does not match."})

                const hashedPassword = await bcrypt.hash(password , 10)

                await db.get().collection(collection.HR_COLLECTION).updateOne({_id : ObjectId(id)} , {
                    $set : {
                        password : hashedPassword ,
                        status : "active",
                    }
                })

            const hrDetails = await db.get().collection(collection.HR_COLLECTION).findOne({_id : ObjectId(hrid)})

            res.status(200).json(hrDetails)
            
            } catch (error) {
                console.log(error.message);
                res.status(401).json(error.message)
            }
            
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    getAllHrByCompany : async (req, res) => {

        const { cid } = req.params

        try {

            const AllHrDetails = await db.get().collection(collection.HR_COLLECTION).find({companyId : ObjectId(cid)}).toArray() 

            res.status(200).json(AllHrDetails)

            
        } catch (error) {
            console.log(error.message);
            res.status(500).json(error.message)
        }
    },
    deleteHrByComapny : async (req ,res) => {

        const {hrId} = req.body

        try {
            await db.get().collection(collection.HR_COLLECTION).deleteOne({_id : ObjectId(hrId)})

            res.status(200).json({msg : "Hr Deleted Successfully."})
        } catch (error) {
            console.log(error.message);
            res.status(401).json(error.message)
        }
    },
    loginHr : async (req , res) => {

        const { email , password  } = req.body

        try {
            const hrDetails = await db.get().collection(collection.HR_COLLECTION).findOne({email})

            if(!hrDetails) return res.status(400).json({error : 'Hr with this email not found'})

            const isPasswordCorrect = await bcrypt.compare(password,hrDetails.password)

            if(!isPasswordCorrect) return res.status(400).json({error : 'Incorrect Password'})

            const token = jwt.sign({email:hrDetails.email,id:hrDetails._id.str},'secret',{expiresIn:"1h"})

            res.status(200).json({hrDetails,token})
        } catch (error) {
            console.log(error.message);
            res.status(500).json(error.message)
        }
    },
    shortListApplicant : async (req ,res) => {
        const {hrId} = req.params
        const { jobId , userId } = req.body

        try {
            var accessCheck =await db.get().collection(collection.JOBS_COLLECTION).findOne({_id : ObjectId(jobId)})

            if(hrId !== accessCheck.hrId.toString()) return res.status(400).json({msg : "Invalid Access to Delete the Job"})

            await db.get().collection(collection.JOBS_COLLECTION).updateOne(
                {
                    _id : ObjectId(jobId) ,
                    applications : { $elemMatch : {userId : userId} }
                },
                { $set : { "applications.$.status" : "SHORTLISTED" }}
            )

            res.status(200).json({msg : 'Applicant Shortlisted Successfully'})
        } catch (error) {
            console.log(error.message);
            res.status(500).json(error.message)
        }
    },
    rejectApplicant : async (req ,res) => {
            const {hrId} = req.params
            const { jobId , userId } = req.body
        try {
            var accessCheck =await db.get().collection(collection.JOBS_COLLECTION).findOne({_id : ObjectId(jobId)})

            if(hrId !== accessCheck.hrId.toString()) return res.status(400).json({msg : "Invalid Access to Delete the Job"})
            
            await db.get().collection(collection.JOBS_COLLECTION).updateOne(
                {
                    _id : ObjectId(jobId) ,
                    applications : { $elemMatch : {userId : userId} }
                },
                { $set : { "applications.$.status" : "REJECTED" }}
            )

            res.status(200).json({msg : 'Applicant Rejected Successfully'})

        } catch (error) {
            console.log(error.message);
            res.status(500).json(error.message)
        }
    },
    setTaskSetsByHr : async (req , res) => {

        const {hrId} = req.params
        const { set1 , set2 , set3 } = req.body

        try {
            const TaskSetExists = await db.get().collection(collection.TASK_SET_COLLECTION).findOne({hrId : ObjectId(hrId)})

            if(!TaskSetExists){
                await db.get().collection(collection.TASK_SET_COLLECTION).insertOne({
                    hrId : ObjectId(hrId) ,
                })
            }  
                if(set1){
                    const Qset1 = {...set1 , uuid : uuidv4()}
                    await db.get().collection(collection.TASK_SET_COLLECTION).updateOne({ hrId : ObjectId(hrId) } , {
                        $set : {
                            Qset1 : Qset1
                        } 
                    })
                } 

                if(set2) {
                    const Qset2 = {...set2 , uuid : uuidv4()}
                    await db.get().collection(collection.TASK_SET_COLLECTION).updateOne({ hrId : ObjectId(hrId) } , {
                        $set : {
                            Qset2 : Qset2
                        }
                    })
                }

                if(set3) {
                    const Qset3 = {...set3 , uuid : uuidv4()}
                    await db.get().collection(collection.TASK_SET_COLLECTION).updateOne({ hrId : ObjectId(hrId) } , {
                        $set : {
                            Qset3 : Qset3
                        }
                    })
                }

            res.status(200).json({msg : 'Task Set Added'})

        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    getAllTaskByHr : async (req ,res) => {
        const {hrId} = req.params

        try {
            const allTaskSet = await db.get().collection(collection.TASK_SET_COLLECTION).findOne({hrId : ObjectId(hrId)})

            res.status(200).json(allTaskSet)
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    assignTaskToUser : async (req ,res) => {
        const { hrId } = req.params
        const { time , taskQuestions  , userId , companyId , jobId , submitType } = req.body //companyName,id,Location //URL or File

        try {
            var accessCheck =await db.get().collection(collection.JOBS_COLLECTION).findOne({_id : ObjectId(jobId)})

            if(hrId !== accessCheck.hrId.toString()) return res.status(400).json({msg : "Invalid Access to Delete the Job"})


            await db.get().collection(collection.USER_TASK_COLLECTION).insertOne(
               {
                   userId : ObjectId(userId),
                   jobId : ObjectId(jobId),
                   status : "PENDING" ,
                   companyId : ObjectId(companyId) ,
                   taskQuestions ,
                   time ,
                   submitType
               }
            )

            await db.get().collection(collection.JOBS_COLLECTION).updateOne(
                {
                    _id : ObjectId(jobId) ,
                    applications : { $elemMatch : {userId : userId} }
                },
                { $set : { "applications.$.status" : "TASK ASSIGNED" }}
            )

            res.status(200).json({msg : "Success"})

        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    }
}