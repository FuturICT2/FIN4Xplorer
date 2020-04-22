import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '@material-ui/core';
import styled from 'styled-components';
import { findVerifierTypeAddressByName } from '../../../components/utils';

const PROPERTY_DEFAULT = {
	constraints: {}
};

function StepNoninteractiveVerifier(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	// const [other, setOther] = useState(null); // TODO utilize more sub-nodes when it becomes applicable
	const [showDropdown, setShowDropdown] = useState(false);
	const [constraintsAdded, setConstraintsAdded] = useState([]);
	const constraints = useRef({});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		constraints.current = draft.other.hasOwnProperty('constraints')
			? draft.other.constraints
			: PROPERTY_DEFAULT.constraints;

		setConstraintsAdded(
			Object.keys(constraints.current).map(name => findVerifierTypeAddressByName(props.verifierTypes, name))
		);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'other',
			node: {
				constraints: constraints.current
			}
		});
		props.handleNext();
	};

	const addConstraint = addr => {
		let constraint = props.verifierTypes[addr];
		let name = constraint.label;

		constraints.current[name] = {
			parameters: {}
		};

		if (constraint.paramsEncoded) {
			constraints.current[name].parameters = {};
			constraint.paramsEncoded.split(',').map(paramStr => {
				let paramName = paramStr.split(':')[1];
				constraints.current[name].parameters[paramName] = null;
			});
		}

		setConstraintsAdded(constraintsAdded.concat(addr));
		setShowDropdown(false);
	};

	const removeConstraint = addr => {
		setConstraintsAdded(constraintsAdded.filter(a => a !== addr));
		delete constraints.current[props.verifierTypes[addr].label];
	};

	return (
		<>
			{constraintsAdded.length > 0 && Object.keys(props.verifierTypes).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{constraintsAdded.map((constraintAddress, index) => {
						let constraint = props.verifierTypes[constraintAddress];
						let name = constraint.label;
						return (
							<div key={'constraint_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'constraintLabel_' + index}
									title={constraint.description}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove constraint"
										onClick={() => removeConstraint(constraintAddress)}
									/>
									{constraint.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title="Since this constraint has parameters to set, it will require an extra transaction when creating the token"
										/>
									)}
								</div>
								{constraint.paramsEncoded &&
									constraint.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										// e.g. uint:interval:days,uint:maxQuantity:quantity
										let type = paramStr.split(':')[0];
										let isArray = type.includes('[]');
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'constraint_' + index + '_param_' + paramIndex;
										return (
											<span key={key}>
												<TextField
													type={type === 'uint' ? 'number' : 'text'}
													label={
														<>
															<span>{paramName}</span>
															{description && <small> ({description})</small>}{' '}
														</>
													}
													inputProps={{
														style: { fontSize: isArray ? 'small' : 'medium' }
													}}
													multiline={isArray ? true : null}
													rows={isArray ? 1 : null}
													variant={isArray ? 'outlined' : 'standard'}
													defaultValue={constraints.current[name].parameters[paramName]}
													onChange={e => (constraints.current[name].parameters[paramName] = e.target.value)}
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
			{constraintsAdded.length > 0 && <Spacer />}
			{showDropdown ? (
				<Dropdown
					onChange={e => addConstraint(e.value)}
					options={Object.keys(props.verifierTypes)
						.filter(addr => props.verifierTypes[addr].isNoninteractive)
						.filter(addr => !constraints.current[props.verifierTypes[addr].label])
						.map(addr => props.verifierTypes[addr])}
					label="Add token constraint"
				/>
			) : (
				<Button onClick={() => setShowDropdown(true)} center="true" color="inherit">
					Add
				</Button>
			)}
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
	plusIcon: {
		color: 'lightgreen',
		width: '16px',
		height: '16px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(StepNoninteractiveVerifier, mapStateToProps);
