import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getRandomStringOfLength } from '../../../components/utils';

function StepSourcerers(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [sourcererPairs, setSourcererPairs] = useState([]); // name and pairs[]
	const [mode, setMode] = useState('collapsed'); // addFromDropdown

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setSourcererPairs(draft.sourcererPairs);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'sourcererPairs',
			node: sourcererPairs
		});
		props.handleNext();
	};

	let updateParamValOnPair = (pair, paramName, val) => {
		pair.parameters[paramName] = val;
		return pair;
	};

	const updateSourcererPairs = (id, paramName, val) => {
		setSourcererPairs(
			sourcererPairs.map(pair => {
				return pair.id === id ? updateParamValOnPair(pair, paramName, val) : pair;
			})
		);
	};

	const removeSourcerer = id => {
		setSourcererPairs(sourcererPairs.filter(pair => pair.id !== id));
	};

	const getSourcererById = id => {
		return sourcererPairs.filter(pair => pair.id === id)[0];
	};

	return (
		<>
			{sourcererPairs.length > 0 && Object.keys(props.allUnderlyings).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{sourcererPairs.map((pair, index) => {
						let name = pair.sourcererName;
						if (!props.allUnderlyings[name]) {
							return;
						}
						let underlyingObj = props.allUnderlyings[name];
						return (
							<div key={'sourcerer_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'sourcererLabel_' + index}
									title={underlyingObj.contractAddress}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{underlyingObj.name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove sourcerer"
										onClick={() => removeSourcerer(pair.id)}
									/>
								</div>
								{underlyingObj.paramsEncoded &&
									underlyingObj.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										let type = paramStr.split(':')[0];
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'underlying_' + index + '_param_' + paramIndex;
										return (
											<span key={key}>
												<TextField
													type={type === 'uint' ? 'number' : 'text'}
													label={
														<>
															<span>{paramName}</span>
															{description && <span style={{ fontSize: 'x-small' }}> ({description})</span>}{' '}
														</>
													}
													defaultValue={getSourcererById(pair.id).parameters[paramName]}
													onChange={e => updateSourcererPairs(pair.id, paramName, e.target.value)}
													style={styles.normalField}
												/>
											</span>
										);
									})}
							</div>
						);
					})}
				</div>
			)}
			{sourcererPairs.length > 0 && <Spacer />}
			<>
				{mode === 'collapsed' && (
					<Button onClick={() => setMode('addFromDropdown')} center="true" color="inherit">
						Add Sourcerer
					</Button>
				)}
				{mode === 'addFromDropdown' && (
					<Dropdown
						onChange={e => {
							let name = e.value;
							let parameters = {};
							let underlyingObj = props.allUnderlyings[name];
							if (underlyingObj.paramsEncoded) {
								underlyingObj.paramsEncoded.split(',').map(paramStr => {
									let paramName = paramStr.split(':')[1];
									parameters[paramName] = null;
								});
							}
							setSourcererPairs([
								...sourcererPairs,
								{
									id: getRandomStringOfLength(3),
									sourcererName: name,
									parameters: parameters
								}
							]);
							setMode('collapsed');
						}}
						options={Object.keys(props.allUnderlyings).map(name => {
							return {
								value: name,
								label: name
							};
						})}
						label="Choose sourcerer"
					/>
				)}
			</>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const Spacer = styled.div`
	height: 30px;
`;

const styles = {
	removeIcon: {
		color: 'lightsalmon',
		width: '14px',
		height: '14px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepSourcerers, mapStateToProps);
