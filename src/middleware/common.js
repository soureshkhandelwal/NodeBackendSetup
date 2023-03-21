const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
require('dotenv').config();

// Check Exist User
const userExistence= (req,res,next)=>{
    const {email,password} = req.body
    let response= {}
    console.log(email,password)
    if(email && password){
        req.mongoDb()
        .then(connObj =>{
            connObj.db.collection('auth_users')
            .find({username:email})
            .toArray((err,data)=>{
                if(err){
                    console.log(err);
                    // connObj.client.close();
                    res.send(err)
                }else{
                    // console.log("Fetching User-Details", data)
                    if(data.length>0){
                        console.log('User Found')
                        response.success= true
                        response.isUserExist= true;
                        return req.customMessage.success(res,response)
                    }else{
                        console.log("User not found")
                        next();
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
}

// Hashing Password
const genHash= (req,res,next)=>{
    const {email, password}= req.body

    if(email && password){
        bcrypt.hash(password, 10, function(err, hash) {
            if(err){
                let err = new Error();
                next(err);      // calling Error-Handler
            }else{
                // store hash in the database
                console.log("hashinh: ",hash)
                req.body.password= hash
                next();
            }
        })
    }else{
        return req.customMessage.validationError(res)
    }
}

const auth= (req,res,next) =>{
    let token=  req.headers?.['authorization'] || '';
    let pvtKey;
    console.log("pvtKey: ",process.env.REFRESH_TOKEN_PRIVATE_KEY, process.env.ACCESS_TOKEN_PRIVATE_KEY)
    if( 'type' in req.query && req.query.type==='refreshToken'){
        console.log('refresh token',req.query)
        pvtKey= process.env.REFRESH_TOKEN_PRIVATE_KEY
    }else{
        console.log('Access token',req.query)
        pvtKey= process.env.ACCESS_TOKEN_PRIVATE_KEY
    }

    if(token && token != undefined){
        token= token.split(' ')[1];
        console.log("token: ", token);
        jwt.verify(token, pvtKey, (err,user)=>{
            if(err){
                console.log(err);
                if(err.name=='TokenExpiredError'){
                    res.send({message: 'Token Expired'})
                }else{
                    res.send({message: 'User is not authorized'})
                }
                // res.redirect('localhost:3010/jwt/login')
            }else{
                console.log('elseeeeeeeeeeeeeee')
                // console.log(user)
                req.refreshToken= user
                next()
            }
        })
    } else{
        res.status(403).send({ success: false, message:"Invalid Token"})
    }
}

module.exports= {
    userExistence,
    genHash,
    auth
}