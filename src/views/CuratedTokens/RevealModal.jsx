import React from 'react';
import Modal from '../../components/Modal';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import ContractFormSimple from '../../components/ContractFormSimple';

function RevealModal(props) {
	const { t } = useTranslation();

	return (
		<center>
			<Modal isOpen={props.isOpen} handleClose={props.handleClose} title="Set vote and salt" width="400px">
				<ContractFormSimple
					contractName="PLCRVoting"
					contractMethod="revealVote"
					pendingTxStr="Reveal vote"
					fields={[['pollID', 'number'], ['Vote', 'number'], ['Salt', 'number']]}
					fixValues={{ pollID: props.pollID }}
					callbacks={{
						callbackUponSubmit: () => {
							props.handleClose();
						}
					}}
				/>
			</Modal>
		</center>
	);
}

export default drizzleConnect(RevealModal);
