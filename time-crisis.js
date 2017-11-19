let moment = require("moment");
let fs = require("fs");
let TogglClient = require("toggl-api");
const EOL = require("os").EOL;

class TimeCrisis {

	/**
	 *
	 * @param token
	 * @constructor
	 */
	constructor(token) {
		if (!token) {
			throw new Error("time-crisis: No Toggl Token Provided");
		}

		this.toggl_token = token;
	}

	static convertHoursToSeconds(hours) {
		return hours * 3600;
	}

	static convertHoursToMinutes(hours) {
		return hours * 60;
	}

	static convertMinutesToHours(minutes) {
		return minutes / 60;
	}

	static convertSecondsToHours(seconds) {
		return seconds / 3600;
	}

	static hoursAreRounded(hours) {
		return (hours % 0.25) === 0;
	}

	static roundHourToQuarterHour(hours) {
		let decimal = hours % 1;
		let multiplier = Math.round((decimal * 100) / 25);
		let rounded_decimal = multiplier * 25;

		if (rounded_decimal >= 100) {
			return Math.floor(hours + 1);
		}

		return Math.floor(hours) + (rounded_decimal / 100);
	}

	/**
	 * Outputs the rounded time entries to a file in CSV format
	 * @param {Map} entries
	 * @param {String} filename
	 */
	static outputToCsv(entries, filename) {
		let stringToWrite = `Client,Description,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday${EOL}`;

		entries.forEach(function (entry) {
			stringToWrite += `${entry.clientName},${entry.description},${entry.daysOfWeek.join(",")}${EOL}`;
		});

		fs.writeFileSync(filename, stringToWrite);
	}

	/**
	 * Gets time entries within a date range.
	 * Default behavior is to get entries for the current week.
	 * @param {Moment} fromDate - the opening date range
	 * @param {Moment} toDate - the closing date range
	 * @returns {Promise}
	 */
	getTimeEntries(fromDate = moment().day(0).format(), toDate = moment().format()) {
		let toggl = new TogglClient({apiToken: this.toggl_token});

		return new Promise(function (resolve, reject) {
			toggl.getTimeEntries(fromDate, toDate, function (error, entries) {
				if (error) {
					reject(error);
				} else {
					resolve(entries);
				}
			});
		});
	}

	/**
	 *
	 * @param projectId
	 * @returns {Promise}
	 */
	getProjectData(projectId) {
		let toggl = new TogglClient({apiToken: this.toggl_token});

		return new Promise(function (resolve, reject) {
			toggl.getProjectData(projectId, function (error, projectData) {
				if (error) {
					reject(error);
				} else {
					resolve(projectData);
				}
			});
		});
	}

	/**
	 *
	 * @param clientId
	 * @returns {Promise}
	 */
	getClientData(clientId) {
		let toggl = new TogglClient({apiToken: this.toggl_token});

		return new Promise(function (resolve, reject) {
			toggl.getClientData(clientId, function (error, clientData) {
				if (error) {
					reject(error);
				} else {
					resolve(clientData);
				}
			});
		});
	}

	/**
	 *
	 * @param {Number} entryId
	 * @param {Object} entryData
	 * @returns {Promise}
	 */
	updateTimeEntry(entryId, entryData) {
		let toggl = new TogglClient({apiToken: this.toggl_token});

		return new Promise(function (resolve, reject) {
			toggl.updateTimeEntry(entryId, entryData, function (error) {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

}

/**
 * @exports
 */
module.exports = TimeCrisis;
