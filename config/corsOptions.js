const allowedOrigins = require("./allowedOrigin")

const corsOption = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            console.log("allowed origins")
            callback(null, true)
        }else{
            console.log("Not allowed origins")
            callback(new Error("Not allowed by CORS"))
        }
    },
    optionSuccessStatus: 200
}

module.exports = corsOption