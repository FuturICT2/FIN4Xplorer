import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import styled from 'styled-components';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';

function StepSearchVerifier(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [verifierProperty, setVerifierProperty] = useState({
		name: '',
		verifierType: '',
		userType: '',
		dataType: ''
	});

	const [search, setSearch] = useState({
		searchInitiate:false,
		searchResult: null
	});



	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		setDraftId(draft.id);
	});

	// TODO: the submit function is not complete yet, you need to add selected verifier to "node"
	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'searchVerifier',
			node: {

			}
		});
		props.handleNext();
	};


	const typesHandler = type => {
		setVerifierProperty({
			...verifierProperty,
			verifierType: type
		});
		console.log(verifierProperty);
	};

	const usersHandler = user => {
		setVerifierProperty({
			...verifierProperty,
			userType: user
		});
		console.log(verifierProperty);
	};

	const dataTypesHandler = dataType => {
		setVerifierProperty({
			...verifierProperty,
			dataType: dataType
		});
		console.log(verifierProperty);
	};

	//This is the search verifier function
	const searchVerifiers =  ()=> {
		console.log(verifierProperty);

		//TODO Implement search functionality and get verifiers and add to search state

		// TODO synchronously call following part
		// ADD search results to search state
		setSearch({
			...search,
			searchInitiate:true
		});
		//TODO organize the search result and render the result to screen
		organizeSearchResult();


	};


	let searchResultDisplay = <p>Select parameters to Search verifiers !</p>;

	const organizeSearchResult = () => {
		if (search.searchResult !== null){
			// TODO organize search results !!
			searchResultDisplay = <p> Organize search results</p>
		}
	};

	return (

		<>

			<Dropdown
				key={'drop_'+1}
				//onChange={}
				//options={}
				label="Name/ID"
			/>

			<Dropdown
				key={'drop_'+2}
				onChange={e => typesHandler(e.value)}
				options={[
					//TODO: Now the value is hard-coded, in the future, the value should be passed from back-end
					{label:'Interactive', value:'inter'},
					{label:'Non-Interactive', value:'non'},
					{label:'Inter & Non-Inter', value:'both'}]}
				label="Types"
			/>

			<Dropdown
				key={'drop_'+3}
				onChange={e => usersHandler(e.value)}
				options={[
					{label:'No Users', value:'no'},
					{label:'Self Users', value:'self'},
					{label:'Voting users', value:'voting'}]}
				label="Users"
			/>

			<Dropdown
				key={'drop_'+4}
				onChange={e => dataTypesHandler(e.value)}
				options={[
					{label:'Auto Generated', value:'auto'},
					{label:'User Created', value:'user'}]}
				label="Data Types"
			/>

			<Button onClick={() => searchVerifiers(true)} center="true" color="inherit">
				Search
			</Button>

			{searchResultDisplay}

			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

export default drizzleConnect(StepSearchVerifier);
