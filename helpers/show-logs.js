const chalk = require('chalk');

const showLogs = (req, res, next) => {
    let setColor = {
        GET: chalk.blue,
        POST: chalk.green,
        PATCH: chalk.magenta,
        DELETE: chalk.red,
        DEFAULT: chalk.white,
    }

    const currentDate = new Date().toISOString();
    
    let color = setColor[req.method];
    console.log(color(`[${currentDate}] ${req.method} ${req.url} ${res.statusCode}`));
    next(); 
}

module.exports = showLogs;