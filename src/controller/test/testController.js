const fs = require('fs')
const puppeteer = require('puppeteer')
const path = require('path');
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

module.exports.checkAnagram = (a, b)=> {
    return new Promise(async resolve => {
        // if (a.length == b.length) {
            let x = a.split('').sort()
            let y = b.split('').sort()
            console.log(x)
            console.log(y)
            if (x.join('') == y.join('')) {
                return resolve("Equal && Anagram");
            } else {
                // Find Out Steps to make them Anagram
                let aobj = await countChars(a)
                let bobj = await countChars(b)
                console.log(aobj)
                console.log(bobj)

                let count = 0;
                for (let char in aobj) {
                    if ((char in bobj) == false) {
                        count += aobj[char]
                    } else {
                        // console.log(aobj[char] + ' - ', bobj[char] + ' : ' + Math.abs(aobj[char] - bobj[char]))
                        count += Math.abs(aobj[char] - bobj[char])
                    }
                }
                for (let char in bobj) {
                    if ((char in aobj) == false) {
                        count += bobj[char]
                    }
                }
                console.log("Total Required Setps:", count)
                return resolve(`Not Anagram: ${count} Steps`)
            }
        // }
    })
}

function countChars(str) {
    let charCount = {};
    for (let i = 0; i < str.length; i++) {
        let char = str.charAt(i);
        charCount[char] = (charCount[char] || 0) + 1;
    }
    return charCount;
}

exports.generatePDF= async(req,res)=>{
    var students = [
        {
            id: 1,
            name: "Sam",
            age: 21
        },
        {
            id: 2,
            name: "Jhon",
            age: 20
        },
        {
            id: 3,
            name: "Jim",
            age: 24
        }
    ]

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log(req.protocol, req.get('host'))
    await page.goto('localhost:3010/testing/generate-pdf');
    await page.setViewport({width: 1080, height: 1024});    // Set screen size

    await browser.close();
    res.render("report", { name: 'Monroe' } )
}