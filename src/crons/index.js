// Libraries
var moment = require("moment");
var cron = require("node-cron");
const { Op } = require("sequelize");
const parser = require("cron-parser");
const log = require("single-line-log").stdout;

// Custom Libraries

// Models
const CronJob = require("../app/SqlModels/CronJob");

// Constants
const app_constants = require("../app/Constants/app.constants");

// Controller
const cronController = require("../app/Controllers/cron.controller");

/**
 * =================
 * Asterisk. E.g. *
 * Ranges. E.g. 1-3,5
 * Steps. E.g. *'/2
 * =================
 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11 (Jan-Dec)
 * Day of Week: 0-6 (Sun-Sat)
 *
 *   *         *       *         *            *       *
 * Seconds  Minutes  Hours  (Days of Month)  Months  Weekday
 */

// ========================= Declarations ================== //
const cronMiddleware = function (job, currentTime, callback) {
	return new Promise(async (resolve, reject) => {
		try {
			let callbackResult = null;
			if (job.once) {
				callbackResult = await callback();
				job.status = "completed";
				await job.save();
				return resolve(callbackResult);
			}

			job.status = "running";
			await job.save();

			await callback();

			let nextScheduled = parser
				.parseExpression(job.interval, {
					currentDate: job.nextScheduled ? job.nextScheduled : currentTime,
				})
				.next()
				.toString();

			// console.log('nextSchedule', nextScheduled)
			if (nextScheduled < currentTime) {
				nextScheduled = parser
					.parseExpression(job.interval, {
						currentDate: currentTime,
					})
					.next()
					.toString();
			}

			job.nextScheduled = nextScheduled;
			job.lastExecuted = currentTime;
			job.status = "pending";
			await job.save();
			// console.log(nextScheduled.next().toString())

			resolve();
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

// ========================= UserBased/DataBased Jobs ================== //
/**
 * cron will be run in every second and check if database task is need to be run
 */
// cron.schedule('*/5 * * * * *', async () => {
//     try {
//         // console.time('cronMethodExecutionTime')
//         let currentTime = moment().format(app_constants.TIMESTAMP_FORMAT);

//         // console.log('========================================== start here ===================================')
//         log(`cron-running-${currentTime} `);

//         // var getJobsQ = `SELECT *, DATE_FORMAT(\`next_schedule_time\`, '%Y-%m-%d %H:%i:%S') AS \`next_schedule_format\` FROM cron_jobs WHERE status = 'new' AND delete_status = 0 having next_schedule_format <=?;`;
//         let jobList = await CronJob.findAll({
//             where: {
//                 status: 'pending',
//                 deleteStatus: false,
//                 nextScheduled: {
//                     [Op.or]: {
//                         [Op.eq]: null,
//                         [Op.lte]: currentTime,
//                     },
//                 }
//             }
//         })

//         if (!jobList || !jobList.length) {
//             console.log('no job found')
//             return
//         }
//         console.log('')
//         let jobMethods = []

//         jobList.map((job) => {

//             if (typeof cronController[job.command] === 'function') {
//                 // break;
//                 jobMethods.push(new Promise((resolve, reject) => cronMiddleware(job, currentTime, cronController[job.command]).then(resolve).catch(reject)))
//             }
//         })
//         // console.log(jobMethods)

//         let cronResults = await Promise.all(jobMethods)
//         // console.log('cronResults:', cronResults)
//         // console.timeEnd('cronMethodExecutionTime')
//     } catch (error) {
//         console.log(error)
//     }
// });

// ========================= SystemBased Jobs ================== //

/**
 * cron will be registered as system time
 */

cron.schedule("0 * * * * *", async () => {
	try {
		Promise.all([
			cronController.restaurantAutoStatus(),
			// cronController.restaurantAutoCancelOrders(),
			// cronController.restaurantAutoCancelOrdersIfNotAccepted(),
			cronController.restaurantSuspendedStatus(),
			cronController.restaurantAutoCompleteBookingsIfAccepted(),
			cronController.sendEmailAndNotificationIfBookingNotAccepted(),
			
			// cronController.restaurantAutoCancelBookingsIfNotAccepted()
		]);
	} catch (error) {
		console.log(error);
	}
});

// cron.schedule("0 0 0 * * *", async () => {
cron.schedule("0 0 0 * * *", async () => {
	try {
		Promise.all([
			cronController.mediaDocumentExpiry()
		])
	} catch (error) {
		console.log(error)
	}
})

