import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import colors from '../config/colors-config';

const Fin4Box = props => {
	// removed the styled-components approach as it caused issues of TextField contents being emptied upon re-render
	// got the hint from https://github.com/mui-org/material-ui/issues/783#issuecomment-359547611
	return (
		<>
			<Paper
				style={{
					width: props.width || '400px',
					boxSizing: 'border-box',
					position: 'relative',
					padding: '1em',
					margin: '20px'
				}}>
				<Typography
					variant="h5"
					component="h3"
					style={{
						textAlign: 'center',
						background: colors.main,
						color: colors.light,
						margin: '-16px -16px 20px',
						padding: '10px',
						borderRadius: '4px 4px 0 0'
					}}>
					{props.title}
				</Typography>
				{props.children}
			</Paper>
			<div id="collapsing-margin-obstacle" style={{ padding: '1px' }}></div>
		</>
	);
};

export default Fin4Box;
