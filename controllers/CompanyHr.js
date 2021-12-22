require('dotenv').config()
const db = require('../config/connection')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')



module.exports = {
    addCompanyHr : async (req , res) => {
        const { name , email } = req.body
        const companyId = req.params.cid

        try {
            const hrExist = await db.get().collection(collection.HR_COLLECTION).findOne({email})

            if(hrExist) return res.status(401).json({msg : 'HR with this Email already exists'})
            
            let {insertedId} = await db.get().collection(collection.HR_COLLECTION).insertOne({email , name , companyId : ObjectId(companyId)})

            const hr = await db.get().collection(collection.HR_COLLECTION).findOne({_id : insertedId})

            // const signLink = `http://localhost:3002/hr-signup-page/${hr._id}`

            res.status(200).json({hr , signLink})

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
}