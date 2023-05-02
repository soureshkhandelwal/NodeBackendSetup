const express = require('express');
const app = express();
const { uuid } = require('uuidv4');
require('dotenv').config().
const PORT = process.env.PORT || 3010;

const dbConfig = require("./src/config/db");
const helpers = require('./src/common/helper');
const authUser= require('./src/routes/authUser')
const dailyCron= require('./src/cron/schedule')
dailyCron.cronJob()

const mongodbConnection = require('./src/config/mongo').mongoConn

app.locals.dbConn = dbConfig.sqlConn;
app.locals.helpers = helpers;


/* ------------ Start of Middleware ---------------- */
const checkClient= (req,res, next)=>{
    console.log('Headers: ',req.headers)
    if(req.headers.client_id && req.headers.client_id=='demo'){
        console.log("client:", req.headers.client_id)
        next();         // Calling Route-Handler
    }else{
        console.log("ERROR!!! Please Provide Client-ID")

        // let err= "Invalid CLIENT-ID"
        // res.status(500).end(err)
        let err = new Error("Invalid CLIENT-ID");
        next(err);      // calling Error-Handler
    }
}

const createRequireFields = (req,res,next) =>{
    console.log("------------- Calling Middleware -------------");
    req.db = app.locals.dbConn;
    req.mongoDb= mongodbConnection;
    req.customMessage = app.locals.helpers

    // console.log("app.locals >> ",app.locals)  // app.locals = req.app.locals
    next();
}
app.use(express.json())
app.use(createRequireFields);
app.use(checkClient);
/* ------------ End of Middleware --------------- */


// Router
app.use('/jwt', authUser)
// Router

// Cookies
app.get('/set-cookies', (req,res)=>{
    res.setHeader('Set-Cookie', 'newUser=true');
    console.log('Headers: ',req.headers)

    res.send("Setting up cookies in browser.")
})

app.get('/', (req,res)=>{
        let response= {};
        response.success = true;
        response.message = "Data Successfully Executed....";
        req.customMessage.success(res,response)
})

app.get('/users', (req,res, next)=>{
    let page= Number(req.query.page) || 1;
    let size= Number(req.query.size) || 10;
    
    let limit= size
    let offset= Number( (page-1) * limit)
    console.log(offset)
    let response= {}

    try {
        let findTotalRecord= ` SELECT count(*) as TotalRecords from leads `;
        req.db.query(findTotalRecord, (err, totalRecordsResult)=>{
            if(err){
                console.log(err.message);
                res.send(err)
            }else{
                let noOfRecord= totalRecordsResult[0]['TotalRecords'];
                let noOfPages= Math.ceil(noOfRecord / limit)
                let query= ` SELECT 
                                l.id,
                                l.first_name,
                                l.date_entered
                            from leads l
                            order by l.date_entered desc
                            limit ${offset}, ${limit}`;

                    req.db.query(query, function(err, results, fields) {
                        if (err) {
                        console.log(err.message);
                        res.send(err)
                        }else{
                            console.log("Success.... User-List ");

                            response.totalRecords= noOfRecord;
                            response.totalPages= noOfPages;
                            response.currentPage= page
                            response.size= limit
                            response.data= results
                            response.skip= offset
                            response.recordSpan= (offset+1)+ ' - '+ (offset+limit)
                            res.send(response)
                        }
                    });
            }
        })
    } catch (error) {
        console.log("error >>> ", error)
        next(error)   // Call Error-Handler
    }
})

app.get('/search-users', (req,res, next)=>{
    let page= Number(req.query.page) || 1;
    let size= Number(req.query.size) || 10;

    if(!'searchQuery' in req.query || !req.query.searchQuery){
        console.log("ERROR!!! Please Provide Searching-Element")
        req.customMessage.validationError(res); return;
    }

    let search= req.query.searchQuery
    let limit= Number(size)
    let offset= Number((page-1)*limit)
    let response= {}

    try {
        let findTotalRecord= `  SELECT 
                                    count(*) as TotalRecords
                                from leads l
                                JOIN leads_cstm lc ON lc.id_c = l.id
                                WHERE lc.lead_number_c LIKE '%${search}%' OR lc.proposal_number_c LIKE '%${search}%'
                                order by l.date_entered desc `;

        // req.db.query(findTotalRecord, (err, totalRecordsResult)=>{
        app.locals.dbConn.query(findTotalRecord, (err, totalRecordsResult)=>{
            if(err){
                console.log(err.message);
                res.send(err)
            }else{
                let noOfRecord= totalRecordsResult[0]['TotalRecords'];
                let noOfPages= Math.ceil(noOfRecord / limit)

                let query= `SELECT 
                                l.date_entered,
                                l.id,
                                l.first_name,
                                lc.lead_number_c,
                                lc.proposal_number_c
                            from leads l
                            JOIN leads_cstm lc ON lc.id_c = l.id
                            WHERE 
                                lc.lead_number_c LIKE '%${search}%' OR
                                lc.proposal_number_c LIKE '%${search}%'
                            order by l.date_entered desc
                            limit ${offset}, ${limit}`;

                    req.db.query(query, function(err, results, fields) {
                        if (err) {
                        console.log(err.message);
                        res.send(err)
                        }else{
                            console.log("Success.... User-List ");

                            response.totalRecords= noOfRecord;
                            response.totalPages= noOfPages;
                            response.currentPage= page
                            response.size= limit
                            response.recordsFound= results.length
                            response.data= results
                            response.skip= offset
                            response.recordSpan= (offset+1)+ ' - '+ (offset+limit)
                            res.send(response)
                        }
                    });
            }
        })
    } catch (error) {
        console.log("error >>> ", error)
        next(error)   // Call Error-Handler
    }
})

app.get('/fetch-users', (req,res, next)=>{
    let response= {}
    const { page=1, limit=10}= req.query

    mongodbConnection()
    .then(connObj =>{
        connObj.db.collection('employees')
        .find()
        .limit(limit*1)
        .skip( (page-1)*limit )
        .toArray((err,data)=>{
            if(err){
                console.log(err);
                // connObj.client.close();
                res.send(err)
            }else{
                console.log("Fetching User-Details")
                response.length= data.length
                response.data= data
                // connObj.client.close();
                res.send(response)
            }
        })
    })
    .catch(err => console.log("ERROR!!! While fetching User-Details: ", err) )
})

/*
.aggregate([
            {
                $match: {
                    "name": { $in: ["Mithlesh Devi", "Himalaya"] }
                }
            }
        ])
*/

// connObj.dbConn.collection('digital_form_prod')
//         .find({ 
//             _id: {
//                 "$in": [ObjectId("609257a002559a2294dfb0c3"), ObjectId("6094c6fdce9ed226e40604a8")]
//             }
//         })
 
const ObjectId = require('mongodb').ObjectId;

app.get('/fetch-multi-users', (req,res, next)=>{
    let response= {};

    let fetchCompletedLoans= ` Select id from leads l where l.status='document_approval' limit 10`;
    req.db.query(fetchCompletedLoans, function(err, results) {
        if (err) {
        console.log(err.message);
        response.success= false;
        response.data= null;
        response.error= true;
        response.errorDescription= err.toString();
        res.send(response)
        }else{
            console.log(`Success.... Loan-Completed Loans (${results.length})`);

            response.success= true;

            let dataArr= [];
            for(let val of results){
                dataArr.push(val['id'])    
            }

            mongodbConnection()
            .then(connObj =>{
                connObj.db.collection('digital_form_prod')
                .aggregate([
                    {
                        $match: {
                            "leadId": { $in: dataArr }
                        }
                    },
                    { $project: { "leadDetails": 1 } }
                ])
                .toArray((err,leadDetails)=>{
                    if(err){
                        console.log(err);
                        response.error= true;
                        response.errorDescription_2 = err.toString()
                        res.send(response);
                    }else{
                        console.log("Fetching User-Details")
                        response.error= false;
                        response.data= leadDetails;
                        connObj.client.close();
                        res.send(response)
                    }
                })
            })
            .catch(err => {
                console.log("ERROR!!! While fetching User-Details: ", err)
                response.success= false;
                response.data= null;
                response.error= true;
                response.errorDescription= err.toString();
                res.send(response)
            })
        }
    });
})

app.get('/test', async(req,res)=>{
    let a= [10,20,   ,30]
    console.log(a)
    console.log(a[2])
    console.log(a.hasOwnProperty(2))

    let b= [...a]
    console.log(b)
    console.log(b[2])
    console.log(b.hasOwnProperty(2))

    res.send('done')
})

app.get('/temp-table', (req,res)=>{
    values= ['BR4001','BR4002','BR4003','BR4004','BR4005','BR4006','BR4007','BR4008','BR4009'];

    let q1= `CREATE temporary table temp_branch ( code varchar(50) ); `
    let q2= `INSERT INTO temp_branch(code) VALUES('BR4001'), ('BR4002'), ('BR4003'), ('BR4004'), ('BR4074'); `;
    let q3= 'select t.code, sbm.branch_code from temp_branch t left join syn_branch_master sbm on sbm.branch_code=t.code ;'

    // let joinedQuery= `${q1} ${q2} ${q3}`;
    req.db.query(q1, (err,result)=>{
        if(err) return res.status(500).send(err);
        
        req.db.query(q2, (err,result)=>{
            if(err) return res.status(500).send(err);

            req.db.query(q3, (err,result)=>{
                if(err) return res.status(500).send(err);
    
                console.log(q3)
                req.db.end()
                return res.status(200).send(result)
            })
        })
    })
})

app.get('/without-trans', (req,res)=>{
    let guid= uuid();
    console.log(guid);

    let q1= 'INSERT INTO leads (id,first_name) VALUES (?,?)';
    let q2= 'INSERT INTO leads_cstm (id_c,lead_no_) VALUES (?,?)';

    // It will Save for Leads table Even Error while inserting Lead-Cstm
    req.db.query(q1, [guid, 'Rollback-1111'], (err,result)=>{
        if(err) return res.status(500).send(err);
        console.log(result);
        req.db.query(q2, [guid, 546547], (err,result)=>{
            if(err) return res.status(500).send(err);
            console.log(result);
            req.db.end()
            return res.status(200).send(result)
        })
    })
})

app.get('/transaction', async(req,res)=>{
    const addStudent = (studentId, name, address, city) => {
        return new Promise((resolve, reject) => {
            let connection = req.db;
            return connection.beginTransaction(err => {
                if (err) {
                    connection.end();
                    return reject("Error occurred while creating the transaction");
                }
                let guid= uuid();
                console.log(guid)
                return connection.query(
                    'INSERT INTO leads (id,first_name) VALUES (?,?)', [guid, 'Rollback'], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.end();
                                console.log("Inserting to Leads table failed", err.toString())
                                return reject({msg:"Inserting to Leads table failed", err: err.toString()})
                            });
                        }
                        console.log("Success Inserted Into Leads")
                        return connection.query(
                            'INSERT INTO leads_cstm (id_c,lead_no_c) VALUES (?,?)', [guid, 546546], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.end();
                                        console.log("Inserting to Leads-Cstm table failed", err.toString())
                                        return reject({msg:"Inserting to Lead-Cstm table failed", err: err.toString()});
                                    });
                                }
                                console.log("Success Inserted Into Leads-CSTM")
                                return connection.commit((err, result) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.end();
                                            console.log("Commit Failed", err.toString())
                                            return reject({msg:"Commit failed", err: err.toString()});
                                        });
                                    }
                                    console.log(result)
                                    connection.end();
                                    return resolve('Success All Queries')
                                });
                            })

                    });

            });
        });
    } 
    
    await addStudent(100, 'John Doyle', '221B Baker Street', 'London')
    .then(data=>{
        res.send(data)
    })
    .catch(err => {
        res.send(err)
    });
})

app.get('*', (req,res,next) =>{
    //  1. Error-Handling with next()
    let err = new Error("Illegal Web URL");
    next(err);

    //  2. Error Throw
    // throw new Error("Illegal Web URL");
})

// Error handling middleware
app.use(function(err, req, res, next) {
    console.log(" ------------ ERROR HANDLING -------------")
    console.log(err)
    const errStatus = 500;
    const errMsg = err.message || 'Something went wrong';

    let response= { success: false,
                    status: errStatus,
                    message: errMsg
                }

    req.customMessage.error(res, response)  // Call Custom Message `helper.js`
});

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})
