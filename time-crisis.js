"use strict";

let TimeCrisis = {};
let moment = require("moment");
let fs = require("fs");
let TogglClient = require("toggl-api");
let toggl_token;
const EOL = require("os").EOL;

/**
 * @exports
 */
module.exports = function (token) {
	if (!token) {
		throw new Error("time-crisis: No Toggl Token Provided");
	}

	toggl_token = token;
	return TimeCrisis;
};

TimeCrisis.convertHoursToSeconds = function (hours) {
	return hours * 3600;
};

TimeCrisis.convertHoursToMinutes = function (hours) {
	return hours * 60;
};

TimeCrisis.convertMinutesToHours = function (minutes) {
	return minutes / 60;
};

TimeCrisis.convertSecondsToHours = function (seconds) {
	return seconds / 3600;
};

TimeCrisis.hoursAreRounded = function (hours) {
	if ((hours % 0.25) === 0) {
		return true;
	}

	return false;
};

TimeCrisis.roundHourToQuarterHour = function (hours) {
	let decimal = hours % 1;
	let multiplier = Math.round((decimal * 100) / 25);
	let rounded_decimal = multiplier * 25;

	if (rounded_decimal >= 100) {
		return Math.floor(hours + 1);
	}

	return Math.floor(hours) + (rounded_decimal / 100);
};

/**
 * Gets time entries within a date range.
 * Default behavior is to get entries for the current week.
 * @param {Moment} fromDate - the opening date range
 * @param {Moment} toDate - the closing date range
 * @returns {Promise}
 */
TimeCrisis.getTimeEntries = function (fromDate = moment().day(0).format(), toDate = moment().format()) {
	let toggl = new TogglClient({apiToken: toggl_token});

	return new Promise(function (resolve, reject) {
		toggl.getTimeEntries(fromDate, toDate, function (error, entries) {
			if (error) {
				reject(error);
			} else {
				resolve(entries);
			}
		});
	});
};

/**
 *
 * @param projectId
 * @returns {Promise}
 */
TimeCrisis.getProjectData = function (projectId) {
	let toggl = new TogglClient({apiToken: toggl_token});

	return new Promise(function (resolve, reject) {
		toggl.getProjectData(projectId, function (error, projectData) {
			if (error) {
				reject(error);
			} else {
				resolve(projectData);
			}
		});
	});
};

/**
 *
 * @param clientId
 * @returns {Promise}
 */
TimeCrisis.getClientData = function (clientId) {
	let toggl = new TogglClient({apiToken: toggl_token});

	return new Promise(function (resolve, reject) {
		toggl.getClientData(clientId, function (error, clientData) {
			if (error) {
				reject(error);
			} else {
				resolve(clientData);
			}
		});
	});
};

/**
 *
 * @param {Number} entryId
 * @param {Object} entryData
 * @returns {Promise}
 */
TimeCrisis.updateTimeEntry = function (entryId, entryData) {
	let toggl = new TogglClient({apiToken: toggl_token});

	return new Promise(function (resolve, reject) {
		toggl.updateTimeEntry(entryId, entryData, function (error) {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
};

/**
 * Outputs the rounded time entries to a file in CSV format
 * @param {Map} entries
 * @param {String} filename
 */
TimeCrisis.outputToCsv = function (entries, filename) {
	let stringToWrite = "";

	entries.forEach(function (entry) {
		stringToWrite += `${entry.clientName},${entry.description},${entry.daysOfWeek.join(",")}${EOL}`;
	});

	fs.writeFileSync(filename, stringToWrite);
};