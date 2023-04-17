const fs = require('fs')
const { parse }= require('csv-parse')
const mongodbConnection= require('../../config/mongo').mongoConn
require('dotenv').config();

exports.getData = (req,res)=>{
    let response= {}
    const { page=1, limit=10}= req.query

    mongodbConnection()
    .then(connObj =>{
        connObj.db.collection('digital_form_prod')
        .find()
        .limit(10)
        .toArray((err,data)=>{
            if(err){
                console.log(err);
                // connObj.client.close();
                res.status(200).send(err)
            }else{
                console.log("Fetching User-Details")
                fs.writeFile("mongo.json", JSON.stringify(data), err => {
                    // Checking for errors
                    if (err) console.log("Error in writing File:", err)
                    else console.log("Done writing") // Success
                   
                    response.length= data.length
                    response.data= data
                    // connObj.client.close();
                    res.status(200).send(response)
                });
            }
        })
    })
    .catch(err => res.status(500).send(err) )    
}

exports.iife = (req,res)=>{
    (name=>{
        console.log(name)
    })('souresh')
    // console.log("Testinf IIFE")
    
    res.status(200).send('Souresh')
}

exports.readCsv= (req,res)=>{
    let results= [];
    let count= 0;

    fs.createReadStream("./Data.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))  // skip 1st line containing headers
    .on("data", function (row) {
        console.log(row);
        results.push(row)
    })
    .on("end", function () {
        console.log("finished");
        res.status(200).send(results)
    })
    .on("error", function (error) {
        console.log(error.message);
        res.status(500).send(error.toString())
    });
}

exports.insertCsv=(req,res)=>{
    const users = [
        { name: "Patricia", surname: "Smith", age: null },
        { name: "John", surname: null, age: 56 },
        { name: "Maria", surname: "Brown", age: 37 },
    ]
    
      // initializing the CSV string content with the headers
    let csvData = ["name", "surname", "age"].join(",") + "\r\n"

    users.forEach((user) => {
    // populating the CSV content
    // and converting the null fields to ""
    csvData += [user.name, user.surname, user.age].join(",") + "\r\n"
    })
    
      // returning the CSV content via the "users.csv" file
    res
    .set({
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users.csv"`,
    })
    .send(csvData)
}