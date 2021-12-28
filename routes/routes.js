var express = require('express');
const {registerCompany , reregisterCompany , loginCompany} = require('../controllers/Auth');
const {getCompanyDetails , getCompanyJobs , showWelcome} = require('../controllers/Company');
const { addCompanyHr, activateHrAccount , getAllHrByCompany , deleteHrByComapny, loginHr , shortListApplicant ,setTaskSetsByHr, getAllTaskByHr} = require('../controllers/CompanyHr');
const { getJobById , addJob , addFreeJob , deleteJob , editJob ,getAllJobsByHr} = require('../controllers/Jobs');
const {valdiateJobDetails , validateCompanyRegistration } = require('../middlewares/JobVerification')
const { updateJobTransaction , addJobPayment , verifyPayment , stripePayment , payPalCreatePayment , payPalExecutePayment} = require('../controllers/Payments');
const { getAppliedUsersByHr, getShortListedApplicantsByHr } = require('../controllers/UserController');

const router  = express.Router();

//Default
router.get('/', showWelcome)

//Auth
router.post('/register',validateCompanyRegistration,registerCompany)
router.post('/login', loginCompany)
router.patch('/reregister', reregisterCompany)


//Company
router.get('/company/:id', getCompanyDetails)
router.get('/company/jobs/:id' , getCompanyJobs)

//Jobs
router.post('/add-job/:hrId' ,valdiateJobDetails,addJob)
router.get('/job/:id' , getJobById)
router.delete('/delete-job/:id' , deleteJob)
router.patch('/edit-job/:id&cid' , editJob)
router.get('/jobs/:hrId' , getAllJobsByHr)


//HR Managment 
router.post('/add-company-hr/:cid' , addCompanyHr)
router.patch('/activate-hr-account/:token/:hrid' , activateHrAccount)
router.get('/get-all-hr/:cid' , getAllHrByCompany)
router.delete('/delete-hr/:cid' , deleteHrByComapny)
router.post('/login/hr' , loginHr)
router.patch('/applicants/shortlist/:hrId' , shortListApplicant)
router.get('/applicants/shortlisted/:hrId' , getShortListedApplicantsByHr)

//Hr Tasks
router.post('/task-sets/:hrId' , setTaskSetsByHr)
router.get('/task/all/:hrId',  getAllTaskByHr)

//Users
router.get('/jobs/applied-users/:hrId' , getAppliedUsersByHr)


// Payment

        //Free Plan
        router.post('/add-free-plan/:hrId', addFreeJob) 

        // Razorpay
        router.post('/update-job-transaction/:hrId',updateJobTransaction)
        router.post('/razorpay/addjobpayment/:hrId', addJobPayment)
        router.post('/verify-payment', verifyPayment)

        //Paypal
        router.post('/paypal/create-payment' , payPalCreatePayment)
        router.post('/paypal/execute-payment' , payPalExecutePayment)
        
        //Stripe
        router.post('/stripe/create-payment-intent' , stripePayment)
        



module.exports = router;