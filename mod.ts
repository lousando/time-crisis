#!/usr/bin/env -S deno run --compat --unstable --allow-env --allow-read --allow-net

let a_time_crisis;
let debug = require("debug")("time-crisis");
let moment = require("moment");
let TimeCrisis = require("./time-crisis");
let yargs = require("yargs");
let progress = require("progress");
const VERSION = require("./package.json").version;

let args = yargs
    // version
    .version(VERSION)
    // usage
    .usage("-t <token> [options]")
    // token
    .alias("t", "token")
    .describe("t", "Toggl API token")
    // output
    .alias("o", "output")
    .describe("o", "output to a csv file")
    // update
    .alias("u", "update")
    .boolean("u")
    .describe("u", "save rounded entries to Toggl")
    .argv;

if (args.token) {
    a_time_crisis = new TimeCrisis(args.token);
    a_time_crisis
        .getTimeEntries()
        .then(_processTimeEntries)
        .catch(function (error) {
            console.error(error);
        });
} else {
    yargs.showHelp("log");
}

async function _processTimeEntries(entries) {
    debug(`Got ${entries.length} time entries`);

    let timesheet_entries = new Map();
    let bar = new progress("[:bar] :percent", {total: entries.length});

    debug("Begin parsing time entries");

    let timesheet_promises = entries.map(async function (entry) {
        // a negative duration means an entry is in progress; do not touch these
        if (Math.sign(entry.duration) !== -1) {
            let entry_in_hours = TimeCrisis.convertSecondsToHours(entry.duration);
            /**
             *    client data has to be extracted in a funny daisy chain way:
             *    [entry id] -> [project id] -> [client data]
             */
            let projectData;
            let clientData;

            try {
                projectData = await a_time_crisis.getProjectData(entry.pid);
                clientData = await a_time_crisis.getClientData(projectData.cid);
            } catch (e) {
                // a project was not assigned to this entry; default name to empty
                projectData = {name: ""};
                clientData = {name: ""};
            }

            debug(`Processing entry: ${entry.description}`);

            // create timesheet entry if one does not exist yet
            if (!timesheet_entries.has(entry.description)) {
                timesheet_entries.set(entry.description, {
                    clientName: clientData.name,
                    description: entry.description,
                    daysOfWeek: new Array(7).fill(0)
                });
            }

            let saved_entry = timesheet_entries.get(entry.description);
            saved_entry.daysOfWeek[
                moment(entry.start).day()
                ] += TimeCrisis.roundHourToQuarterHour(entry_in_hours);

            timesheet_entries.set(entry.description, saved_entry);

            if (args.update) {
                /**
                 * do not bother trying to save something that's already rounded
                 * (we'll get rate limited if we keep on trying)
                 */
                if (!TimeCrisis.hoursAreRounded(entry_in_hours)) {
                    debug(`Updating entry: ${entry.description}`);
                    await a_time_crisis.updateTimeEntry(entry.id, {
                        // Toggl loves seconds
                        duration: TimeCrisis.convertHoursToSeconds(
                            TimeCrisis.roundHourToQuarterHour(entry_in_hours)
                        )
                    });
                }
            }
        } else {
            console.info(
                `Warning: "${entry.description}" is currently running and was not be accounted for.`
            );
        }

        bar.tick();
    });

    if (args.output) {
        await Promise.all(timesheet_promises);
        debug("Exporting to CSV");
        TimeCrisis.outputToCsv(timesheet_entries, args.output);
    } else {
        debug("Not exporting");
        await Promise.all(timesheet_promises);
    }
}
