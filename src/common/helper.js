module.exports.validationError = (res, error = 'Data provided is not valid') => {
    res.statusCode = 422;
    res.end(JSON.stringify(error, null, 3));
};

module.exports.dataNotFound = (res, error="No Data Found") => {
    res.statusCode = 404;
    res.end(JSON.stringify(error, null, 3));
};

module.exports.error = (res, error = 'An unknown error occurred') => {
    res.statusCode = 500;
    res.send(error, null, 3);
    // res.end(JSON.stringify(error, null, 3));
};

module.exports.success = (res, data = null) => {
    res.statusCode = 200;
    res.send(data, null, 3);
};