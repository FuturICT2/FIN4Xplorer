import React from 'react';
import { Modal, IconButton } from '@material-ui/core';
import Container from './Container';
import Box from './Box';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

const Fin4Modal = props => {
	const ModalContainer = styled(Container)`
		height: 100%;
		align-items: center;
	`;

	const CloseButton = styled(IconButton)`
		position: absolute !important;
		right: 3px;
		top: 3px;
	`;

	return (
		<Modal open={props.isOpen} onClose={props.handleClose}>
			<ModalContainer>
				<Box title={props.title} width={props.width || '80%'}>
					<CloseButton onClick={props.handleClose}>
						<CloseIcon fontSize="small" />
					</CloseButton>
					{props.children}
				</Box>
			</ModalContainer>
		</Modal>
	);
};

export default Fin4Modal;
