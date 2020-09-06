import React, { useState } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import ContractFormSimple from '../../components/ContractFormSimple';

function CreateCollection() {
	const { t } = useTranslation();

	return (
		<Box title={t('collections.create-new.box-title')}>
			<ContractFormSimple
				contractName="Fin4Collections"
				contractMethod="createCollection"
				pendingTxStr="Create collection"
				fields={[
					[t('collections.create-new.fields.name'), 'text'],
					[t('collections.create-new.fields.short-name'), 'text'],
					[t('collections.create-new.fields.description'), 'text']
				]}
			/>
			<center style={{ color: 'gray', fontFamily: 'arial' }}>{t('collections.create-new.reload-hint')}</center>
		</Box>
	);
}

export default drizzleConnect(CreateCollection);
