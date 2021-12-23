require('dotenv').config()
const db = require('../config/connection')
var request = require('request');
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const {createHmac} = require('crypto')
const { validationResult } = require('express-validator')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { convert } = require("current-currency")


const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
})


module.exports = {
    addJobPayment : async (req,res) => {

        const amount = req.body.amount
        const currency = "INR"

        const options = {
            amount: amount * 100,  // amount in the smallest currency unit
            currency,
            receipt: shortid.generate()
        }
        try {

            const result = await razorpay.orders.create(options)    

            res.status(200).json({
                id:result.id,
                currency:result.currency,
                amount:result.amount
            })      
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    verifyPayment : async (req,res) => {
        const payDetails = req.body
        try {
            var hmac = createHmac('sha256',process.env.RZP_KEY_SECRET)

            hmac.update(payDetails.order.data.id + '|' + payDetails.response.razorpay_payment_id)

            var hmac = hmac.digest('hex')

            if(hmac !== payDetails.response.razorpay_signature) return res.status(400).json({Err : 'Payment not Valid'})

            await db.get().collection(collection.JOBS_COLLECTION).updateOne({_id: ObjectId(payDetails.transactionDetails.jobId)}, {
                $set : {
                    status : true,
                    payPlan : payDetails.transactionDetails.planName,
                }
            })

            await db.get().collection(collection.TRANSACTIONS_COLLECTION).insertOne(payDetails.transactionDetails)
            
            res.status(200)

        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    updateJobTransaction : async(req,res) => {
        const payDetails = req.body
        const {hrId} = req.params
        try {

            var accessCheck =await db.get().collection(collection.JOBS_COLLECTION).findOne({_id : ObjectId(payDetails.jobId)})

            if(hrId !== accessCheck.hrId.toString()) return res.status(400).json({msg : "Invalid Access to Delete the Job"})

            await db.get().collection(collection.JOBS_COLLECTION).updateOne({_id: ObjectId(payDetails.jobId)}, {
                $set : {
                    status : true,
                    payPlan : payDetails.planName,
                }
            })

            await db.get().collection(collection.TRANSACTIONS_COLLECTION).insertOne(payDetails)

            res.status(200)
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    stripePayment : async (req,res) => {
        payDetails = req.body
        
        try {

            var amount;

            if(payDetails.planName == 'Basic') {
                amount = 399
            }
            if(payDetails.planName == 'Premium') {
                amount = 899
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount : amount * 100,
                currency : "INR",
                automatic_payment_methods: {
                    enabled: true,
                },
            })

            res.status(200).json({ clientSecret: paymentIntent.client_secret,})
            
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },    
    payPalCreatePayment : async (req , res) => {

        const { inrAmount } = req.body
        const { amount } = convert("INR", inrAmount , "USD")

        try {
            request.post(
                PAYPAL_API + "/v1/payments/payment",
                {
                  auth: {
                    user: process.env.CLIENT,
                    pass: process.env.SECRET,
                  },
                  body: {
                    intent: "Add Job",
                    payer: {
                      payment_method: "paypal",
                    },
                    transactions: [
                      {
                        amount: {
                          total: amount,
                          currency: "USD",
                        },
                      },
                    ],
                    redirect_urls: {
                      return_url: "https://example.com",
                      cancel_url: "https://example.com",
                    },
                  },
                  json: true,
                },
                function (err, response) {
                  if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                  }
                  // 3. Return the payment ID to the client
                  res.status(200).json({
                    id: response.body.id,
                  });
                }
              );
        } catch (error) {
            console.log(error);
            res.status(500).json({Err : error})
        }
    },
    payPalExecutePayment : async (req , res) => {

        var {paymentID , payerID , inrAmount} = req.body
        const { amount } = convert("INR", inrAmount , "USD")

        try {

            request.post(
                PAYPAL_API + "/v1/payments/payment/" + paymentID + "/execute",
                {
                  auth: {
                    user: process.env.CLIENT,
                    pass: process.env.SECRET,
                  },
                  body: {
                    payer_id: payerID,
                    transactions: [
                      {
                        amount: {
                          total: amount,
                          currency: "USD",
                        },
                      },
                    ],
                  },
                  json: true,
                },
                function (err, response) {
                  if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                  }
                  // 4. Return a success response to the client
                  res.json({
                    status: "success",
                  });
                }
              );
            
        } catch (error) {
            
        }
    }
}