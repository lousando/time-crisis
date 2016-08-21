"use strict";

let time_crisis = new require("../time-crisis")(process.env.TOGGL_TOKEN);
let expect = require("chai").expect;

describe("Time Crisis", function () {

	it("Can convert hours to seconds", function () {
		let hours = 10;
		let converted_hours = time_crisis.convertHoursToSeconds(hours);

		expect(converted_hours).to.equal(36000);
	});

	it("Can convert hours to minutes", function () {
		let hours = 1.5;
		let converted_hours = time_crisis.convertHoursToMinutes(hours);

		expect(converted_hours).to.equal(90);
	});

	it("Can convert seconds to hours", function () {
		let seconds = 36000;
		let converted_seconds = time_crisis.convertSecondsToHours(seconds);

		expect(converted_seconds).to.equal(10);
	});

	it("Can convert minutes to hours", function () {
		let minutes = 30;
		let converted_minutes = time_crisis.convertMinutesToHours(minutes);

		expect(converted_minutes).to.equal(0.5);
	});

	it("Can determine if an hour has been rounded to the 1/4 hour", function () {
		let hours = 2.75;
		let isHoursRounded = time_crisis.hoursAreRounded(hours);

		expect(isHoursRounded).to.equal(true);
	});

	it("Can round to the nearest 1/4 hour", function () {
		let unroundedHours = 0.17;
		let roundedHours = time_crisis.roundHourToQuarterHour(unroundedHours);

		expect(roundedHours).to.equal(0.25);
	});

	it("Rounds down when minutes past last quarter hour is <= 7", function () {
		let last_quater_hour = time_crisis.convertMinutesToHours(15);
		let minutes_past = time_crisis.convertMinutesToHours(6);

		let hours = time_crisis.convertMinutesToHours(last_quater_hour + minutes_past);
		let rounded_hours = time_crisis.roundHourToQuarterHour(hours);

		expect(rounded_hours).to.equal(0);
	});

	it("Rounds up when minutes past last quarter hour is >= 8", function () {
		let last_quater_hour = time_crisis.convertMinutesToHours(30);
		let minutes_past = time_crisis.convertMinutesToHours(8);

		let total_hours = last_quater_hour + minutes_past;
		let rounded_hours = time_crisis.roundHourToQuarterHour(total_hours);

		expect(rounded_hours).to.equal(0.75);
	});

	it("Requires that an Toggl token is passed", function () {
		let is_token_provided;

		try {
			require("../time-crisis")();
			is_token_provided = true;
		} catch (e) {
			is_token_provided = false;
		}

		expect(is_token_provided).to.equal(false);
	});

});