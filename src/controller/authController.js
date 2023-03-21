const mongodbConnection = require('../config/mongo').mongoConn
var uuid = require('uuid-v4');
var jwt = require('jsonwebtoken');
require('dotenv').config();

exports.defaultPage = (req,res)=>{
    console.log("Redirecting to Signup Page")
    res.redirect(200, '/signup')
}

exports.get_signup = (req,res)=>{
    res.status(200).end("Sign-Up Page")
}

exports.post_signup = (req,res)=>{
    console.log(req.body)
    const {email, password}= req.body

    mongodbConnection()
    .then(connObj =>{
        connObj.db.collection('auth_users')
        .insertOne( { _id: uuid(), username: email, password: password } )
    })
    .catch(err => console.log("ERROR!!! While fetching User-Details: ", err) )

    res.status(200).end("Sign-Up Data")
}

exports.get_login = (req,res)=>{
    res.status(200).end("Login Page")
}

exports.post_login = (req,res)=>{
    const {email,password} = req.body
    console.log(email,password)
    
    let response= {}
    if(email && password){
        req.mongoDb()
        .then(connObj =>{
            connObj.db.collection('auth_users')
            .find({username:email})
            .toArray(async(err,data)=>{
                if(err){
                    console.log(err);
                    // connObj.client.close();
                    res.send(err)
                }else{
                    console.log("Fetching User-Details", data)

                    if(data.length>0){
                        console.log('User Found', data[0]);
                        response.success= true
                        response.userFound= true;

                        // Create JWT
                        const accessToken= await jwt.sign( data[0], process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: '60s' })
                        const refreshToken= await jwt.sign( data[0], process.env.REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: '30d' })

                        response.success= true;
                        response.token= accessToken;
                        response.refresh= refreshToken
                        return req.customMessage.success(res,response)
                
                    }else{
                        console.log("User not found");
                        response.success= true;
                        response.data= null;
                        return req.customMessage.success(res,response)
                    }
                }
            })
        })
        .catch(err=>{
            req.customMessage.error(res);
        })
    }else{
        return req.customMessage.validationError(res) 
    }
    // res.status(200).end("Login Data")
}

exports.home= (req,res) =>{
    res.send("Home Page");
}

exports.refreshToken= (req,res)=>{
    res.send({type:'Refreshing Token', token:req.refreshToken})
}