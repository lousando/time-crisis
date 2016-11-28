#!/usr/bin/env node
"use strict";

let a_time_crisis;
let debug = require("debug")("time-crisis");
let moment = require("moment");
let TimeCrisis = require("./time-crisis");
let commander = require("commander");
let progress = require("progress");
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
	a_time_crisis = new TimeCrisis(commander.token);
	a_time_crisis.getTimeEntries()
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
	const NUM_OF_ENTRIES = entries.length;
	let bar = new progress("[:bar] :percent", {total: NUM_OF_ENTRIES});

	debug("Begin parsing time entries");
	for (let entry_index = 0; entry_index < NUM_OF_ENTRIES; entry_index++) {
		let entry = entries[entry_index];

		// a negative duration means an entry is in progress; do not touch these
		if (Math.sign(entry.duration) !== -1) {
			let entry_in_hours = TimeCrisis.convertSecondsToHours(entry.duration);

			let clientDataPromise = new Promise(function (resolve, reject) {
				setTimeout(function () {
					/**
					 *    client data has to be extracted in a funny daisy chain way:
					 *    [entry id] -> [project id] -> [client data]
					 */
					a_time_crisis.getProjectData(entry.pid).then(function (projectData) {
						setTimeout(function () {
							a_time_crisis.getClientData(projectData.cid).then(function (clientData) {
								resolve(clientData);
							});
						}, 1000 * entry_index);
					}).catch(function (error) {
						reject(error);
					});
				}, 1000 * entry_index);
			});

			timesheet_promises.push(clientDataPromise);

			clientDataPromise.then(function (clientData) {
				debug(`Processing entry: ${entry.description}`);

				// create timesheet entry if one does not exist yet
				if (!timesheet_entries.has(entry.description)) {
					timesheet_entries.set(entry.description, {
						clientName: clientData.name,
						description: entry.description,
						daysOfWeek: new Array(7)
					});
				}

				let saved_entry = timesheet_entries.get(entry.description);
				saved_entry.daysOfWeek[moment(entry.start).day()] = TimeCrisis.roundHourToQuarterHour(entry_in_hours);

				timesheet_entries.set(entry.description, saved_entry);

				if (commander.update) {
					/**
					 * do not bother trying to save something that's already rounded
					 * (we'll get rate limited if we keep on trying)
					 */
					if (!TimeCrisis.hoursAreRounded(entry_in_hours)) {
						debug(`Updating entry: ${entry.description}`);
						setTimeout(function () {
							a_time_crisis.updateTimeEntry(entry.id, {
								// Toggl loves seconds
								duration: TimeCrisis.convertHoursToSeconds(
									TimeCrisis.roundHourToQuarterHour(entry_in_hours)
								)
							});
						}, 1000 * entry_index);
					}
				}

				bar.tick();
			}).catch(function (error) {
				console.error(error);
			});
		} else {
			console.info(`Warning: "${entry.description}" is currently running and was not be accounted for.`);
			bar.tick();
		}
	}

	if (commander.output) {
		Promise.all(timesheet_promises).then(function () {
			debug("Exporting to CSV");
			TimeCrisis.outputToCsv(timesheet_entries, commander.output);
		});
	}
}
