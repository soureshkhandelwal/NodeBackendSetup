var mysql = require('mysql2');


// create the MySQL-connection to database
let config= {
    "host": "13.127.221.17",
    "user": "namdev",
    "password": "TCFLN9,@vjZ/ZR94",
    "database": "namdev_los",
    "port": "3306"
}

const connection = mysql.createConnection(config);

connection.connect(err => {
    if(err) {
        console.log("Could Not Connect to MySQL Database")
        return console.error('error: ' + err);
    }else{
        console.log('Connected to the MySQL server:', config.user);
    }
})

exports.sqlConn = connection;