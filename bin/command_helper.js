// Libraries
var moment = require("moment-strftime");
var util = require("util");
const exec = util.promisify(require("child_process").exec);
var randomize = require("randomatic");

// Custom Libraries
const { sql } = require("../config/database");

// Constants
const app_constants = require("../config/constants");
 
const sim_helpers = require("../helper/sim_helpers");

module.exports = {

    getSdealersByDealerId: async (dealer_id) => {

		var query = `SELECT dealer_id FROM dealers WHERE connected_dealer = ?`;
		let res = await sql.query(query, [dealer_id]);
		let dealerList = [];
		if (res.length) {
			dealerList = res.map(item => item.dealer_id);
			return dealerList;
		} else {
			return [];
		}
	},

    updateSimStatus: function (sim_id, status, res = null, isNew = false, data = null, sid = null, history_data = null) {
		// console.log(history_data);
		if (sid) {
			let updateObject = { status: status }
			let unique_name = ''
			if (isNew) {
				let date_now = moment().format('YYYY/MM/DD_HH:mm:ss')
				unique_name = `LM${data.dealer_pin} _${date_now} _${data.dealer_name} `
				if (data.device_id) {
					unique_name = unique_name + `_${data.device_id} `
				}
				let data_plan = 'LM 2GB DATA'
				if (data.data_limit) {
					data_plan = sim_helpers.getSimRatePlan(data.data_limit)
				}
				updateObject = { status: status, uniqueName: unique_name, ratePlan: data_plan }
			}
			if (status == 'reset') {
				updateObject = { resetStatus: 'resetting' }
			}
			console.log(updateObject);
			app_constants.twilioClient.wireless.sims(sid).update(updateObject).then(rsp => {
				// console.log(rsp);
				if (rsp) {

					if (status === 'active') {
						sql.query(`UPDATE sim_ids SET activated = 1, sim_status = 'active', unique_name = '${isNew ? unique_name : rsp.uniqueName}'  WHERE sim_id = '${sim_id}'`)
						if (res) {
							res.send({
								status: true,
								msg: "Sim activated successfully."
							})
						}
					}
					else if (status === 'suspended') {
						sql.query(`UPDATE sim_ids SET activated = 0, sim_status = 'suspended', unique_name = '${isNew ? unique_name : rsp.uniqueName}', suspend_date = '${moment().format('YYYY/MM/DD')}' WHERE sim_id = '${sim_id}'`)
						if (res) {
							res.send({
								status: true,
								msg: "Sim suspended successfully."
							})
						}
					}
					else if (status === 'deactivated') {
						sql.query(`UPDATE sim_ids SET activated = 0, sim_status = 'deactivated', unique_name = '${isNew ? unique_name : rsp.uniqueName}' WHERE sim_id = '${sim_id}'`)
						if (res) {
							res.send({
								status: true,
								msg: "Sim suspended successfully."
							})
						}
					}
					else if (status === 'reset') {
						if (res) {
							res.send({
								status: true,
								msg: "Sim network connectivity reset successfully."
							})
						}
					}
					if (history_data) {
						saveSimAccHistory(history_data)
					}
				} else {
					console.log(rsp);
					if (res) {
						sql.query(`UPDATE sim_ids SET sid = '${rsp[0].sid}', unique_name = '${isNew ? unique_name : rsp[0].uniqueName}' WHERE sim_id = '${sim_id}'`)
						res.send({
							status: false,
							msg: `ERROR: Internal Server error.`
						})
						return;
					}
				}
			}).catch(err => {
				console.log("ERROR", err);
				if (res) {
					res.send({
						status: false,
						msg: `ERROR: ${err.message}.`
					})
					return;
				}
			})
		} else {
			app_constants.twilioClient.wireless.sims.list({ iccid: sim_id }).then(response => {
				if (response && response.length) {
					let unique_name = ''
					let updateObject = { status: status }
					if (isNew) {
						let date_now = moment().format('YYYY/MM/DD_HH:mm:ss')
						unique_name = `LM${data.dealer_pin} _${date_now} _${data.dealer_name} `
						if (data.device_id) {
							unique_name = unique_name + `_${data.device_id} `
						}
						let data_plan = 'LM 2GB DATA'
						if (data.data_limit) {
							data_plan = sim_helpers.getSimRatePlan(data.data_limit)
						}
						updateObject = { status: status, uniqueName: unique_name, ratePlan: data_plan }
					}
					if (status == 'reset') {
						updateObject = { resetStatus: 'resetting' }
					}
					console.log(updateObject);
					app_constants.twilioClient.wireless.sims(response[0].sid).update(updateObject).then(rsp => {
						// console.log(rsp);
						if (rsp) {
							if (status === 'active') {
								sql.query(`UPDATE sim_ids SET activated = 1, sim_status = 'active', sid = '${response[0].sid}', unique_name = '${isNew ? unique_name : response[0].uniqueName} ' WHERE sim_id = '${sim_id} '`)
								if (res) {
									res.send({
										status: true,
										msg: "Sim activated successfully."
									})
									return;
								}
							}
							else if (status === 'suspended') {
								sql.query(`UPDATE sim_ids SET activated = 0, sim_status = 'suspended', sid = '${response[0].sid}', unique_name = '${isNew ? unique_name : response[0].uniqueName}', suspend_date = '${moment().format('YYYY/MM/DD')}' WHERE sim_id = '${sim_id}'`)
								if (res) {
									res.send({
										status: true,
										msg: "Sim suspended successfully."
									})
									return;
								}
							}
							else if (status === 'deactivated') {
								sql.query(`UPDATE sim_ids SET activated = 0, sim_status = 'deactivated', unique_name = '${isNew ? unique_name : rsp.uniqueName}' WHERE sim_id = '${sim_id}'`)
								if (res) {
									res.send({
										status: true,
										msg: "Sim suspended successfully."
									})
								}
							}
							else if (status === 'reset') {
								if (res) {
									sql.query(`UPDATE sim_ids SET sid = '${response[0].sid}', unique_name = '${isNew ? unique_name : response[0].uniqueName}' WHERE sim_id = '${sim_id}'`)
									res.send({
										status: true,
										msg: "Sim network connectivity reset successfully."
									})
									return;
								}
							}
							if (history_data) {
								saveSimAccHistory(history_data)
							}
						} else {
							console.log(rsp);
							if (res) {
								res.send({
									status: false,
									msg: `ERROR: Internal Server error.`
								})
								return;
							}
						}
					}).catch(err => {
						console.log("ERROR", err);
						if (res) {
							res.send({
								status: false,
								msg: `ERROR: ${err.message}.`
							})
							return;
						}
					})
				} else {
					if (res) {
						res.send({
							status: false,
							msg: `ERROR: Sim not found on twillio server.`
						})
						return;
					}
				}
			}).catch(err => {
				console.log("GET SIM ERROR", err);
				if (res) {
					res.send({
						status: false,
						msg: `ERROR: Sim not found on twilio server.`
					})
					return;
				}
			})
		}
	},
    
    replaceAt: function (string, index, replace) {
		index--;
		return (
			string.substring(0, index) + replace + string.substring(index + 1)
		);
	},

    generateStandaloneSimId: async function () {
		let standalone_sim_id = `LM${randomize("0", 1, { exclude: "0" })}${randomize('0', 5)}`;
		let query = "SELECT standalone_sim_id FROM standalone_sim_acc WHERE standalone_sim_id=?";
		let result = await sql.query(query, [standalone_sim_id]);
		if (result.length > 1) {
			return await this.generateStandaloneSimId();
		} else {
			return standalone_sim_id;
		}
	},
    
    generatePackageId: async function () {
		let packageId = `PK${randomize("0", 1, { exclude: "0" })}${randomize('0', 3)}`;
		let query = `SELECT package_id FROM packages WHERE package_id=?`;
		let result = await sql.query(query, [packageId]);
		if (result.length > 1) {
			return await this.generatePackageId();
		} else {
			return packageId;
		}
	},

    getInvoiceId: async function () {
		let invoiceId = ""
		var max = "000000"
		let lastInvoice = "SELECT id FROM invoices ORDER BY id DESC LIMIT 1"
		let result = await sql.query(lastInvoice)
		if (result && result.length) {
			invoiceId = (result[0].id + 1).toString()
			invoiceId = max.substring(0, max.length - invoiceId.length) + invoiceId
		} else {
			invoiceId = "000001"
		}
		return 'PI' + invoiceId;
	},

    getAPKLabel: async function (filePath) {
		return await this.getAPKLabelScript(filePath);
	},
    
    getAPKLabelScript: async function (filePath) {
		try {
			let label = `aapt dump badging ${filePath} | grep "application" | sed -e "s/.*label=\'//" -e "s/\' .*//"`;
			const { stdout, stderr, error } = await exec(label);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}

			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(/\r?\n/);
				// console.log("stdout linux: ", array);
				let label = array[0].split(":");

				return label[1] ? label[1].replace(/\'/g, "") : false;
			}
			return false;
		} catch (error) {
			return await this.getWindowAPKLabelScript(filePath);
		}
	},
    
    // linux scripts
	getAPKPackageNameScript: async function (filePath) {
		try {
			let packageName = `aapt list -a ${filePath} | awk -v FS='\"' '/package=/{print $2}'`;
			const { stdout, stderr, error } = await exec(packageName);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				return stdout;
			}
			return false;
		} catch (error) {
			return await this.getWindowAPKPackageNameScript(filePath);
		}
	},

    getWindowAPKLabelScript: async function (filePath) {
		try {
			let cmd = `aapt dump badging ${filePath} | findstr /C:"application:"`;
			const { stdout, stderr, error } = await exec(cmd);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(" ");
				let label = array[1].split("=");

				return label[1] ? label[1].replace(/\'/g, "") : false;
			}
			return false;
		} catch (error) {
			return false;
		}
	},
    
    // windows
	getWindowAPKPackageNameScript: async filePath => {
		try {
			let cmd = `aapt dump badging ${filePath} | findstr /C:"package: name"`;
			const { stdout, stderr, error } = await exec(cmd);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(" ");
				let packageName = array[1].split("=");
				return packageName[1]
					? packageName[1].replace(/\'/g, "")
					: false;
			}
			return false;
		} catch (error) {
			return false;
		}
	},
}

async function saveSimAccHistory(history_data) {
	console.log(history_data);
	let standalone_id = history_data.standalone_acc_id ? history_data.standalone_acc_id : null
	let user_acc_id = history_data.user_acc_id ? history_data.user_acc_id : null
	let sim_table_id = history_data.sim_t_id
	let query = "INSERT INTO sim_acc_action_history (action_type, standalone_acc_id, user_acc_id, sim_table_id, sim_id, action_data, action_by) VALUES (?,?,?,?,?,?,?)"
	let values = [history_data.action, standalone_id, user_acc_id, sim_table_id, history_data.sim_id, JSON.stringify(history_data.actionData), history_data.action_by]
	await sql.query(query, values)
}
