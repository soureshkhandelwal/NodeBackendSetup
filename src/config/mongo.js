const MongoClient = require('mongodb').MongoClient;

// const url= "mongodb+srv://souresh:singodiya@cluster0.eehfp.mongodb.net/test";
// const dbName= 'BlogCrud';

const url= "mongodb://namdev:dsEzLLhf99NTY4p5@13.127.221.17:27017/?authMechanism=DEFAULT&authSource=admin"
const dbName= 'namdev_los'

function mongoConnection(){
    return new Promise((resolve, reject)=> {
        try {
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
                if (err) {
                    console.log(err);
                    reject(err)
                }else{
                    console.log("Connecting to Mongo")
                    
                    // var dbConn= mongoClient.db(dbName);//use for create database   

                    let connection = {
                        db: client.db(dbName),
                        client: client
                    }
                    resolve(connection)
                }
            });
        } catch (error) {
            console.log("1. ERROR!!! Catch Block")
            reject(error)   
        }
    })
}

module.exports.mongoConn = mongoConnection;