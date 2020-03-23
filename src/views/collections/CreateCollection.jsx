import React, { useState } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import ContractFormSimple from '../../components/ContractFormSimple';

function CreateCollection() {
	const { t } = useTranslation();

	return (
		<Box title="Create token collection">
			<ContractFormSimple
				contractName="Fin4Collections"
				contractMethod="createCollection"
				pendingTxStr="Create collection"
				fields={[
					['Collection-Name', 'text'],
					['Short-name (e.g. "ethz" for "ETH Zürich")', 'text'],
					['Description', 'text']
				]}
			/>
			<center style={{ color: 'gray', fontFamily: 'arial' }}>Reload the page to see newly created collections.</center>
		</Box>
	);
}

export default drizzleConnect(CreateCollection);
