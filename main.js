#!/usr/bin/env node
"use strict";

let time_crisis;
let debug = require("debug")("time-crisis");
let moment = require("moment");
let commander = require("commander");
const VERSION = require("./package.json").version;
const DESCRIPTION = require("./package.json").description;

commander
	.version(VERSION)
	.description(DESCRIPTION)
	.usage("-t <token> [options]")
	.option("-t, --token <token>", "Toggl API token")
	.option("-o, --output <filename>", "output to a csv file")
	.option("-u, --update", "save rounded entries to Toggl")
	.parse(process.argv);

if (commander.token) {
	time_crisis = require("./time-crisis")(commander.token);
	time_crisis.getTimeEntries()
		.then(processTimeEntries)
		.catch(function (error) {
			console.error(error);
		});
} else {
	commander.help();
}

function processTimeEntries(entries) {
	debug("Got time entries");

	let timesheet_entries = new Map();
	let timesheet_promises = [];

	debug("Begin parsing time entries");
	for (let entryIndex = 0, numOfEntries = entries.length; entryIndex < numOfEntries; entryIndex++) {
		let entry = entries[entryIndex];

		// a negative duration means an entry is in progress; do not touch these
		if (Math.sign(entry.duration) !== -1) {
			let entry_in_hours = time_crisis.convertSecondsToHours(entry.duration);

			let clientDataPromise = new Promise(function (resolve, reject) {
				setTimeout(function () {
					/**
					 *    client data has to be extracted in a funny daisy chain way:
					 *    [entry id] -> [project id] -> [client data]
					 */
					time_crisis.getProjectData(entry.pid).then(function (projectData) {
						setTimeout(function () {
							time_crisis.getClientData(projectData.cid).then(function (clientData) {
								resolve(clientData);
							});
						}, 1000 * entryIndex);
					}).catch(function (error) {
						reject(error);
					});
				}, 1000 * entryIndex);
			});

			timesheet_promises.push(clientDataPromise);

			clientDataPromise.then(function (clientData) {
				debug(`Processing entry: ${entry.description}`);

				// create timesheet entry if one does not exist yet
				if (!timesheet_entries.has(entry.description)) {
					timesheet_entries.set(entry.description, {
						clientName: clientData.name,
						description: entry.description,
						daysOfWeek: Array(7)
					});
				}

				let saved_entry = timesheet_entries.get(entry.description);
				saved_entry.daysOfWeek[moment(entry.start).day()] = time_crisis.roundHourToQuarterHour(entry_in_hours);

				timesheet_entries.set(entry.description, saved_entry);

				if (commander.update) {
					/**
					 * do not bother trying to save something that's already rounded
					 * (we'll get rate limited if we keep on trying)
					 */
					if (!time_crisis.hoursAreRounded(entry_in_hours)) {
						debug(`Updating entry: ${entry.description}`);
						setTimeout(function () {
							time_crisis.updateTimeEntry(entry.id, {
								// Toggl loves seconds
								duration: time_crisis.convertHoursToSeconds(
									time_crisis.roundHourToQuarterHour(entry_in_hours)
								)
							});
						}, 1000 * entryIndex);
					}
				}
			}).catch(function (error) {
				console.error(error);
			});
		} else {
			console.info(`Warning: "${entry.description}" is currently running and was not be accounted for.`);
		}
	}

	if (commander.output) {
		Promise.all(timesheet_promises).then(function () {
			debug("Exporting to CSV");
			time_crisis.outputToCsv(timesheet_entries, commander.output);
		});
	}
}