// The original class was from here: https://github.com/trufflesuite/drizzle-react-components/blob/develop/src/ContractForm.js
// Much changed since then. The following PropTypes were added:
// 		contractName: used to get the contract
// 		staticArgs: additional arguments, which are always submitted regardless of the input arguments
//		hideArgs: arguments that are being set computationally, based on the user's input in other fields
// 		buttonLabel: to customize the submit-button at the end of the form
// 		multiSelectOptions: to supply options for a multiselect dropdown list instead of an input field
// 		helperModalTriggers: used in TokenCreation to pass the click on
// TODO Some of the added functionality is very specific and should be restructured to be more generic

import { drizzleConnect } from 'drizzle-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';
import Modal from './Modal';
import Dropdown from './Dropdown';
import Button from './Button';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import DateFnsUtils from '@date-io/moment';
import moment from 'moment';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { findTokenBySymbol, contractCall } from './Contractor.jsx';

const translateType = type => {
	switch (true) {
		case /^uint/.test(type):
			return 'number';
		case /^string/.test(type) || /^bytes/.test(type):
			return 'text';
		case /^bool/.test(type):
			return 'checkbox';
		default:
			return 'text';
	}
};

class ContractForm extends Component {
	constructor(props, context) {
		super(props);

		this.context = context;
		this.newValue = null;
		this.contractName = this.props.contractName;
		this.inputs = [];

		var initialState = {
			isModalOpen: false,
			newValue: null,
			tokenAddress: null,
			requiredProofTypes: []
		};

		const abi = require('../build/contracts/' + this.contractName).abi;

		for (var i = 0; i < abi.length; i++) {
			if (abi[i].name === this.props.method) {
				this.inputs = abi[i].inputs;
				for (var j = 0; j < this.inputs.length; j++) {
					let input = this.inputs[j];
					let value = '';
					if (input.name === 'date') {
						// set default date to today for date inputs
						value = moment().valueOf();
					}
					if (input.type.includes('[]')) {
						// initialize array types as empty arrays
						value = [];
					}
					initialState[input.name] = value;
				}
				break;
			}
		}

		this.state = initialState;
	}

	handleSubmit = event => {
		if (this.props.toggleModal) {
			this.props.toggleModal();
		}
		event.preventDefault();

		var paramValuesIndicesArr = [];

		const convertedInputs = this.inputs.map(input => {
			if (this.props.staticArgs && this.props.staticArgs[input.name]) {
				return this.props.staticArgs[input.name];
			}

			if (this.props.hideArgs && this.props.hideArgs[input.name] && this.props.multiSelectOptions) {
				if (input.name === 'paramValues') {
					// expected to happen before paramValuesIndices
					var allParamValuesArr = [];
					for (var i = 0; i < this.state.requiredProofTypes.length; i++) {
						var proofTypeObj = this.getProofTypeObj(this.state.requiredProofTypes[i]);
						var paramValuesObj = proofTypeObj.paramValues;
						var count = 0;
						var startIndex = allParamValuesArr.length;
						for (var key in paramValuesObj) {
							if (paramValuesObj.hasOwnProperty(key)) {
								allParamValuesArr.push(paramValuesObj[key]);
								count++;
							}
						}
						var endIndex = startIndex + count - 1;
						// 99 as indicator for no params for this ProofType
						paramValuesIndicesArr.push(count === 0 ? 99 : startIndex);
						paramValuesIndicesArr.push(count === 0 ? 99 : endIndex);
					}
					return allParamValuesArr;
				}

				if (input.name === 'paramValuesIndices') {
					return paramValuesIndicesArr;
				}

				return '';
			}

			if (input.type === 'bytes32') {
				return window.web3.utils.toHex(this.state[input.name]);
			}

			return this.state[input.name];
		});

		// hackish... better to refactor ContractForm properly
		if (this.props.method === 'createNewToken') {
			let name = convertedInputs[0];
			let symbol = convertedInputs[1];

			// TODO check for letters only too?
			if (name.trim().length === 0) {
				alert("Name can't be empty");
				return;
			}

			if (symbol.length < 3 || symbol.length > 5) {
				alert('Symbol must have between 3 and 5 characters');
				return;
			}

			if (findTokenBySymbol(this.props, symbol) !== null) {
				alert('Symbol is already in use');
				return;
			}
		}

		let self = this; // needed? TODO
		contractCall(
			this.context,
			this.props,
			this.props.store.getState().fin4Store.defaultAccount,
			this.contractName,
			this.props.method,
			[...convertedInputs],
			this.props.method, // TODO pass a displayStr too
			receipt => {
				self.postSubmitCallback(true, receipt);
			}
		);
	};

	postSubmitCallback(success, result) {
		if (this.props.postSubmitCallback) {
			this.props.postSubmitCallback(success, result);
		}
	}

	handleSingleSelectInputChange = event => {
		this.setState({ tokenAddress: event.value });
	};

	handleInputChange = event => {
		// removing the last tag in the multiselect field fires a null-event
		if (event === null && this.props.multiSelectOptions) {
			this.setState({ requiredProofTypes: [] });
			return;
		}

		let value;

		if (!event.target && this.props.multiSelectOptions) {
			// indicator for react-select
			var values = [];
			for (var i = 0; i < event.length; i++) {
				values.push(event[i].value);
			}

			var newValue;
			if (this.state.requiredProofTypes.length === 0) {
				// first tag was added
				newValue = values[0];
			} else if (values.length < this.state.requiredProofTypes.length) {
				// a tag was removed
				newValue = null;
			} else {
				newValue = values[values.length - 1];
			}

			this.setState({
				requiredProofTypes: values,
				newValue: newValue
			});

			if (newValue != null && this.getProofTypeObj(newValue).paramsEncoded.length > 0) {
				this.openModal();
			}
			return;
		}

		if (event.target.type === 'checkbox') {
			value = event.target.checked;
		} else if (event.target.type === 'date') {
			value = moment(event.target.value).valueOf();
		} else {
			value = event.target.value;
		}

		this.setState({ [event.target.name]: value });
	};

	getProofTypeObj(address) {
		for (var i = 0; this.props.multiSelectOptions && i < this.props.multiSelectOptions.length; i++) {
			if (this.props.multiSelectOptions[i].value === address) {
				return this.props.multiSelectOptions[i];
			}
		}
		return '';
	}

	openModal = () => {
		this.setState({ isModalOpen: true });
	};

	closeModal = () => {
		this.setState({
			isModalOpen: false,
			newValue: null
		});
	};

	handleParamChange = (proofTypeObj, event) => {
		let name = event.target.name;
		if (name === 'latitude / longitude') {
			var multiplier = 10000000;
			let lat = Number(event.target.value.split(',')[0].trim());
			let lon = Number(event.target.value.split(',')[1].trim());
			lat = Math.round(lat * multiplier);
			lon = Math.round(lon * multiplier);
			proofTypeObj.paramValues['latitude'] = lat;
			proofTypeObj.paramValues['longitude'] = lon;
			return;
		}
		proofTypeObj.paramValues[name] = Number(event.target.value);
	};

	render() {
		return (
			<>
				<Modal
					isOpen={this.state.isModalOpen}
					handleClose={this.closeModal}
					title={'Set Parameters for ' + this.getProofTypeObj(this.state.newValue).label}
					width="400px">
					{this.state.newValue &&
						this.getProofTypeObj(this.state.newValue)
							.paramsEncoded.split(',')
							.filter(part => part.length > 0)
							.map(part => {
								const [paramType, paramName, unit] = part.split(':');
								return (
									<TextField
										key={paramName}
										name={paramName}
										type={translateType(paramType)}
										label={paramName + ' (' + unit + ')'}
										onChange={e => this.handleParamChange(this.getProofTypeObj(this.state.newValue), e)}
										style={inputFieldStyle}
									/>
								);
							})}
					<Button onClick={this.closeModal} center="true">
						Apply
					</Button>
				</Modal>
				<form onSubmit={this.handleSubmit} autoComplete="off">
					{this.inputs.map(({ name, type }, index) => {
						if (
							(this.props.staticArgs && this.props.staticArgs[name]) ||
							(this.props.hideArgs && this.props.hideArgs[name])
						) {
							return '';
						}

						const inputType = translateType(type);
						let inputLabel = this.props.labels ? this.props.labels[index] : name;
						// enrich inputLabel with modal trigger if available
						try {
							inputLabel = this.props.helperModalTriggers[index] ? (
								<HelperModalTrigger onClick={this.props.helperModalTriggers[index]}>{inputLabel}</HelperModalTrigger>
							) : (
								inputLabel
							);
						} catch {}

						if (name === 'requiredProofTypes' && this.props.multiSelectOptions) {
							return (
								<Dropdown
									key={name}
									multipleChoice
									onChange={this.handleInputChange}
									options={this.props.multiSelectOptions}
									label={inputLabel}
								/>
							);
						}

						if (name === 'date') {
							const dateFormat = 'YYYY-MM-DD HH:mm';
							return (
								<MuiPickersUtilsProvider key={name} utils={DateFnsUtils}>
									<DateTimePicker
										ampm={false}
										disableFuture
										showTodayButton
										key={name}
										label={inputLabel}
										format={dateFormat}
										value={moment(this.state[name]).format(dateFormat)}
										onChange={moment =>
											this.handleInputChange({
												target: {
													name: name,
													value: moment,
													type: 'date'
												}
											})
										}
										style={inputFieldStyle}
									/>
								</MuiPickersUtilsProvider>
							);
						}

						return (
							<TextField // renders the number field automatically by detecting the inputType
								key={name}
								name={name}
								multiline={inputLabel === 'comment'}
								type={inputType}
								label={inputLabel}
								onChange={this.handleInputChange}
								style={inputFieldStyle}
							/>
						);
					})}
					<Button icon={AddIcon} onClick={this.handleSubmit} center="true">
						{this.props.buttonLabel ? this.props.buttonLabel : 'Submit'}
					</Button>
				</form>
			</>
		);
	}
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

const HelperModalTrigger = props => {
	return (
		<span {...props} style={{ cursor: 'pointer' }}>
			{props.children} (Learn More <InfoIcon style={{ verticalAlign: 'middle' }} />)
		</span>
	);
};

ContractForm.contextTypes = {
	drizzle: PropTypes.object
};

ContractForm.propTypes = {
	contractName: PropTypes.string,
	method: PropTypes.string.isRequired,
	sendArgs: PropTypes.object,
	labels: PropTypes.arrayOf(PropTypes.string),
	helperModalTriggers: PropTypes.arrayOf(PropTypes.func),
	postSubmitCallback: PropTypes.func
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(ContractForm, mapStateToProps);
