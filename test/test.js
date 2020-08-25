let TimeCrisis = require("../time-crisis");

describe("Time Crisis", function () {

	test("Can convert hours to seconds", function () {
		let hours = 10;
		let converted_hours = TimeCrisis.convertHoursToSeconds(hours);

		expect(converted_hours).toBe(36000);
	});

	test("Can convert hours to minutes", function () {
		let hours = 1.5;
		let converted_hours = TimeCrisis.convertHoursToMinutes(hours);

		expect(converted_hours).toBe(90);
	});

	test("Can convert seconds to hours", function () {
		let seconds = 36000;
		let converted_seconds = TimeCrisis.convertSecondsToHours(seconds);

		expect(converted_seconds).toBe(10);
	});

	test("Can convert minutes to hours", function () {
		let minutes = 30;
		let converted_minutes = TimeCrisis.convertMinutesToHours(minutes);

		expect(converted_minutes).toBe(0.5);
	});

	test("Can determine if an hour has been rounded to the 1/4 hour", function () {
		let hours = 2.75;
		let isHoursRounded = TimeCrisis.hoursAreRounded(hours);

		expect(isHoursRounded).toBe(true);
	});

	test("Can round to the nearest 1/4 hour", function () {
		let unroundedHours = 0.17;
		let roundedHours = TimeCrisis.roundHourToQuarterHour(unroundedHours);

		expect(roundedHours).toBe(0.25);
	});

	test("Rounds down when minutes past last quarter hour is <= 7", function () {
		let last_quater_hour = TimeCrisis.convertMinutesToHours(15);
		let minutes_past = TimeCrisis.convertMinutesToHours(6);

		let hours = TimeCrisis.convertMinutesToHours(last_quater_hour + minutes_past);
		let rounded_hours = TimeCrisis.roundHourToQuarterHour(hours);

		expect(rounded_hours).toBe(0);
	});

	test("Rounds up when minutes past last quarter hour is >= 8", function () {
		let last_quater_hour = TimeCrisis.convertMinutesToHours(30);
		let minutes_past = TimeCrisis.convertMinutesToHours(8);

		let total_hours = last_quater_hour + minutes_past;
		let rounded_hours = TimeCrisis.roundHourToQuarterHour(total_hours);

		expect(rounded_hours).toBe(0.75);
	});

	test("Requires that an Toggl token is passed", function () {
		let is_token_provided;

		try {
			require("../time-crisis")();
			is_token_provided = true;
		} catch (e) {
			is_token_provided = false;
		}

		expect(is_token_provided).toBe(false);
	});

});
