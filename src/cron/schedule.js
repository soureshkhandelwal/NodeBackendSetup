const cron = require("node-cron");
var moment = require('moment');

// CRON-JOB
const cronPatterns = {
    "every-second": "* * * * * *",
    "every-minute": "* * * * *",
    "every-odd-minute": "*/3 * * * *",
    "every-even-minute": "*/2 * * * *",
    "every-fifteen-minutes": "*/15 * * * *",
    "every-ten-minutes": "*/10 * * * *",
    "every-half-hour": "*/30 * * * *",
    "every-hour": "0 * * * *",
    "every-odd-hour": "0 */3 * * *",
    "every-even-hour": "0 */2 * * *",
    "every-day-12:00AM": "0 18 18 * *",
    "mid-night": "1 0 * * *",
    "early-morning-05:30AM": "0 30 5 * * *",
    "every-three-hour": "0 */3 * * *",
    "every-eight-hour": "0 */8 * * *"

};

function cronJob(){
    var task = cron.schedule(cronPatterns['every-ten-minutes'], () =>  {
        console.log('CRON is Running Now..............', moment().format('YYYY-MM-DD HH:mm:ss') );
        console.log("Leads-Details Updated")
      }, {
        scheduled: true
      });
    
    task.start();
}

module.exports.cronJob = cronJob;