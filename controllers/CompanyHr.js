require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sendEmail = require('../utils/nodeMailer')


module.exports = {
    addCompanyHr : async (req , res) => {
        const { name , email } = req.body
        const companyId = req.params.cid

        try {
            const hrExist = await db.get().collection(collection.HR_COLLECTION).findOne({email})

            if(hrExist) return res.status(401).json({msg : 'HR with this Email already exists'})

            const password =await bcrypt.hash(process.env.HR_MODEL_PASSWORD , 10)
            
            let {insertedId} = await db.get().collection(collection.HR_COLLECTION).insertOne({email , name , companyId : ObjectId(companyId) , password })

            const hr = await db.get().collection(collection.HR_COLLECTION).findOne({_id : insertedId})

            const secret =  process.env.JWT_SECRET + hr.password

            const payload = { email : hr.email, id : hr._id, }

            const token = jwt.sign(payload , secret , { expiresIn : '1m' })

            const signLink = `http://localhost:3002/hr-signup-page/${token}/${hr._id}`

            sendEmail(hr.email , "Create Your Hr Account with JobsWay" , {name : hr.name , link : signLink} ,"../Public/Mail/mailTemplate.handlebars")

            console.log(signLink);

            res.status(200).json({hr , signLink})

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
}