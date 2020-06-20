// adopted from stackoverflow.com/a/55036265/2474159

import React from 'react';
import TextField from '@material-ui/core/TextField';

const InputComponent = ({ inputRef, ...other }) => <div {...other} />;

const OutlinedDiv = ({ children, label }) => {
	return (
		<TextField
			variant="outlined"
			label={label}
			multiline
			InputLabelProps={{ shrink: true }}
			InputProps={{
				inputComponent: InputComponent
			}}
			inputProps={{ children: children }}
			style={inputFieldStyle}
		/>
	);
};

const inputFieldStyle = {
	width: '100%',
	// marginBottom: '15px', // outcommmented it because it looks better in PreviousClaims, maybe make it a props to have this or not
	marginTop: '15px'
};

export default OutlinedDiv;
