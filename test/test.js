"use strict";

let TimeCrisis = require("../time-crisis");
let expect = require("chai").expect;

describe("Time Crisis", function () {

	it("Can convert hours to seconds", function () {
		let hours = 10;
		let converted_hours = TimeCrisis.convertHoursToSeconds(hours);

		expect(converted_hours).to.equal(36000);
	});

	it("Can convert hours to minutes", function () {
		let hours = 1.5;
		let converted_hours = TimeCrisis.convertHoursToMinutes(hours);

		expect(converted_hours).to.equal(90);
	});

	it("Can convert seconds to hours", function () {
		let seconds = 36000;
		let converted_seconds = TimeCrisis.convertSecondsToHours(seconds);

		expect(converted_seconds).to.equal(10);
	});

	it("Can convert minutes to hours", function () {
		let minutes = 30;
		let converted_minutes = TimeCrisis.convertMinutesToHours(minutes);

		expect(converted_minutes).to.equal(0.5);
	});

	it("Can determine if an hour has been rounded to the 1/4 hour", function () {
		let hours = 2.75;
		let isHoursRounded = TimeCrisis.hoursAreRounded(hours);

		expect(isHoursRounded).to.equal(true);
	});

	it("Can round to the nearest 1/4 hour", function () {
		let unroundedHours = 0.17;
		let roundedHours = TimeCrisis.roundHourToQuarterHour(unroundedHours);

		expect(roundedHours).to.equal(0.25);
	});

	it("Rounds down when minutes past last quarter hour is <= 7", function () {
		let last_quater_hour = TimeCrisis.convertMinutesToHours(15);
		let minutes_past = TimeCrisis.convertMinutesToHours(6);

		let hours = TimeCrisis.convertMinutesToHours(last_quater_hour + minutes_past);
		let rounded_hours = TimeCrisis.roundHourToQuarterHour(hours);

		expect(rounded_hours).to.equal(0);
	});

	it("Rounds up when minutes past last quarter hour is >= 8", function () {
		let last_quater_hour = TimeCrisis.convertMinutesToHours(30);
		let minutes_past = TimeCrisis.convertMinutesToHours(8);

		let total_hours = last_quater_hour + minutes_past;
		let rounded_hours = TimeCrisis.roundHourToQuarterHour(total_hours);

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
