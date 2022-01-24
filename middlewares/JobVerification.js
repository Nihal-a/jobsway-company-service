var {check} = require('express-validator')

module.exports = {
    validateCompanyRegistration : [
        check('companyDetails.companyName','Enter a Valid Company Name.').exists().isLength({min : 2}),
        check('companyDetails.industry','Enter company industry').exists().isLength({min : 2}),
        check('companyDetails.location','Enter a company location').exists().isLength({min : 2}),
        check('companyDetails.email','Enter a valid email address').exists().isEmail(),
        check('companyDetails.bio','Bio should be 20 words long').exists().isLength({min:100}),
        check('companyDetails.phone','Enter a valid mobile number').exists().isLength({min:10,max:10}),
        check('companyDetails.password').exists().isLength({min : 8}).withMessage('Password Must be 8 char long'),
        check('image' , "You Should upload your company logo").notEmpty()
    ],
    valdiateJobDetails : [
        check('jobTitle','Enter Job Title').exists(),
        check('jobCategory','Enter Job Category').exists(),
        check('minExp','Enter a valid Experience year').exists().isNumeric(),
        check('maxExp','Enter a valid Experience year').exists().isNumeric(),
        check('timeSchedule','Choose Full time or part time').exists(),
        check('qualification','Enter a qualification').exists(),
        check('education','Enter Education').exists(),
        check('jobLocation','Enter Job Location').exists(),
        check('skills','Enter Job Skills').exists(),
        check('language','Enter Job Languages').exists(),
    ]
}



