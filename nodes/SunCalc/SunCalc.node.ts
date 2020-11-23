import { IExecuteFunctions } from 'n8n-core';
import {
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { set } from 'lodash';
import * as moment from 'moment-timezone';
const SunCalcAPI = require('suncalc-tz');


export class SunCalc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sun Calculator',
		name: 'sunCalc',
		icon: 'fa:sun',
		group: ['transform'],
		version: 1,
		description: 'Get time of sunrise, sunset, last light, etc',
		defaults: {
			name: 'Sun Calc',
			color: '#d5ac32',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Latitude',
				name: 'lat',
				type: 'number',
				default: 41.7759,
				description: 'Latitude of location to get sun times for. Use negative numbers for South.',
			},
			{
				displayName: 'Longitude',
				name: 'long',
				type: 'number',
				default: 72.5215,
				description: 'Longtitude of location to get sun times for. Use negative numbers for West.',
			},
			{
				displayName: 'Sun Type',
				name: 'sunType',
				type: 'options',
				default: 'sunset',
				description: 'Which sun time should this node output?',
				options: [
					{
						name: 'Sunrise',
						value: 'sunrise',
						description: 'Top edge of the sun appears on the horizon',
					},
					{
						name: 'Sunrise Ends',
						value: 'sunriseEnd',
						description: 'Bottom edge of the sun touches the horizon',
					},
					{
						name: 'Morning Golden Hour',
						value: 'goldenHourEnd',
						description: 'End of morning golden hour. Soft light, best time for photography',
					},
					{
						name: 'Solar Noon',
						value: 'solarNoon',
						description: 'Sun is in the highest position',
					},
					{
						name: 'Evening Golden Hour',
						value: 'goldenHour',
						description: 'Start of evening golden hour',
					},
					{
						name: 'Sunset Starts',
						value: 'sunsetStart',
						description: 'Bottom edge fo the sun touches the horizon',
					},
					{
						name: 'Sunset',
						value: 'sunset',
						description: 'Sun disappears below the horizon, evening civil twilight starts',
					},
					{
						name: 'Dusk',
						value: 'dusk',
						description: 'Evening nautical twilight starts',
					},
					{
						name: 'Nautical Dusk',
						value: 'nauticalDusk',
						description: 'Evening astronomical twilight starts',
					},
					{
						name: 'Night',
						value: 'night',
						description: 'Night starts, dark enough for astronomical observations',
					},
					{
						name: 'Nadir',
						value: 'nadir',
						description: 'Darkest moment of the night, sun is in the lowest position',
					},
					{
						name: 'Night Ends',
						value: 'nightEnd',
						description: 'Morning astronomical twilight starts',
					},
					{
						name: 'Dawn',
						value: 'dawn',
						description: 'Morning nautical twilight ends, morning civil twilight starts',
					},
				],
			},
			/* For now, outputs in timezone of lat/long, possible future feature is to choose a diff timezone if desired
			{
				displayName: 'Output Timezone',
				name: 'outputTimezone',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTimezones',
				},
				default: 'UTC',
				description: 'The timezone of the output time.',
			},
			*/
			{
				displayName: 'Output Time Format',
				name: 'outputTimeFormat',
				type: 'options',
				options: [
					// Time only
					{
						name: 'h:mm A (12 hr)',
						value: 'h:mm A',
						description: 'Example: 4:35 PM',
					},
					{
						name: 'h:mm (12 hr, no AM/PM)',
						value: 'h:mm',
						description: 'Example: 4:35',
					},
					{
						name: 'H:mm (24 hr)',
						value: 'H:mm',
						description: 'Example: 16:35',
					},
					{
						name: 'hh:mm A (12 hr, leading zero)',
						value: 'hh:mm A',
						description: 'Example: 04:35 PM',
					},
					{
						name: 'HH:mm (24 hr, leading zero)',
						value: 'HH:mm',
						description: 'Example: 08:35',
					},
					{
						name: 'hh:mm (12 hr, no AM/PM, leading zero)',
						value: 'hh:mm',
						description: 'Example: 04:35',
					},
					// Datetime, 12 hr
					{
						name: 'DD-MM-YYYY h:mm A (datetime DMY, 12 hr)',
						value: 'DD-MM-YYYY h:mm A',
						description: 'Example: 23-11-2030 4:35 PM',
					},
					{
						name: 'YYYY-MM-DD h:mm A (datetime YMD, 12 hr)',
						value: 'YYYY-MM-DD h:mm A',
						description: 'Example: 2030-11-23 4:35 PM',
					},
					{
						name: 'MM-DD-YYYY h:mm A (datetime MDY, 12 hr)',
						value: 'MM-DD-YYYY h:mm A',
						description: 'Example: 11-23-2030 4:35 PM',
					},
					// Datetime, 24 hr
					{
						name: 'DD-MM-YYYY H:mm (datetime DMY, 24 hr)',
						value: 'DD-MM-YYYY H:mm',
						description: 'Example: 23-11-2030 16:35',
					},
					{
						name: 'YYYY-MM-DD H:mm (datetime YMD, 24 hr)',
						value: 'YYYY-MM-DD H:mm',
						description: 'Example: 2030-11-23 16:35',
					},
					{
						name: 'MM-DD-YYYY H:mm (datetime MDY, 24 hr)',
						value: 'MM-DD-YYYY H:mm',
						description: 'Example: 11-23-2030 16:35',
					},
					// Datetime, UTC
					{
						name: 'ddd, MMM D YYYY hh:mm A (UTC)',
						value: 'ddd, MMM D YYYY hh:mm A',
						description: 'Example: Thu, Aug 2 1985 08:30 PM',
					},
					// Datetime, Unix
					{
						name: 'X (Unix timestamp in seconds)',
						value: 'X',
						description: 'Example: 1606108979 (seconds since Jan 1st, 1970)',
					},
					// Datetime, Moment.JS
					{
						name: 'YYYY-MM-DDTHH:mm:ssZ (Moment.JS default format)',
						value: 'YYYY-MM-DDTHH:mm:ssZ',
						description: 'Example: 2013-03-01T00:00:00+01:00',
					},
				],
				default: 'h:mm A',
				description: 'The format to convert the date/time to.',
			},
		]
	};


	// Timezone method borrowed from n8n/DateTime.node
	methods = {
		loadOptions: {
			// Get all the timezones to display them to user so that he can
			// select them easily
			/*
			async getTimezones(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				for (const timezone of moment.tz.names()) {
					const timezoneName = timezone;
					const timezoneId = timezone;
					returnData.push({
						name: timezoneName,
						value: timezoneId,
					});
				}
				return returnData;
			},
		       */
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		//const workflowTimezone = this.getTimezone();
		//console.log('WORKFLOW timezone:', this.getTimezone());

		// Extract sun type from input arguments
		let sunType: string = this.getNodeParameter('sunType', 0) as string;

		// Extract lat + long from input arguments
		const lat: number = this.getNodeParameter('lat', 0) as number;
		const long: number = this.getNodeParameter('long', 0) as number;

		// Get output timezone
		// const outputTimezone: string = (this.getNodeParameter('outputTimezone', 0) || workflowTimezone) as string;

		// Date to get solar times for
		//const inputDate: Date = moment(new Date()).tz(outputTimezone).toDate();

		// Solar times
		const times = SunCalcAPI.getTimes(new Date(), lat, long);

		// Get output time format
		const outputTimeFormat: string = this.getNodeParameter('outputTimeFormat', 0) as string;

		// Get user-requested time
		const requestedTime: string = times[sunType].toUTCString();

		// Convert to timezone and format
		const outputTime: string = moment(requestedTime)/*.tz(outputTimezone)*/.format(outputTimeFormat) as string;
		// Convert to JSON node execution data
		let returnData: INodeExecutionData[] = [];
		const newItem: INodeExecutionData = { json: {} };
		set(newItem, `json.${sunType}`, outputTime);
		returnData.push(newItem);

		// Prepare + return data
		return this.prepareOutputData(returnData);
	}
}
