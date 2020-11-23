import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
//import * as SunCalcAPI from 'suncalc';
// var SunCalcAPI = require('suncalc');
const SunCalcAPI = require('suncalc');


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
				default: 50,
				description: 'The (general) latitude of the location get the sun times for.',
			},
			{
				displayName: 'Longitude',
				name: 'long',
				type: 'number',
				default: 50,
				description: 'The (general) longtitude of the location get the sun times for.',
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
			}
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		console.log('EXECUTE: ', this);

		// Extract sun type from input arguments
		let sunType: string = this.getNodeParameter('sunType', 0) as string;
		console.log('SUN TYPE: ', sunType);

		// Extract lat + long from input arguments
		let lat: number = this.getNodeParameter('lat', 0) as number;
		let long: number = this.getNodeParameter('long', 0) as number;
		console.log('LAT:', lat, 'LONG:', long);

		let times = SunCalcAPI.getTimes(new Date(), lat, long, -0.1);
		console.log('TIMES:', times);

		// Convert to JSON node execution data
		/* let returnData: INodeExecutionData = {
			json: JSON.parse(JSON.stringify(sunType)),
		};*/

		// Prepare + return data
		return this.prepareOutputData([] as INodeExecutionData[]); // returnData);
	}
}
