import React from 'react';
import Box from '../../components/Box';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

function ListCollections(props) {
	const { t } = useTranslation();

	return (
		<Box title={t('collections.list-existing.box-title')}>
			<Table
				headers={[t('collections.list-existing.name-column'), t('collections.list-existing.actions-column')]}
				colWidths={[85, 15]}>
				{Object.keys(props.collections).map((identifier, index) => {
					let collection = props.collections[identifier];
					return (
						<TableRow
							key={'collection_' + index}
							data={{
								name: (
									<Tooltip
										title={t('collections.list-existing.name-tooltip', {
											shortName: identifier,
											description: collection.description,
											tokensCount: collection.tokens.length
										})}
										arrow>
										<span>{collection.name}</span>
									</Tooltip>
								),
								actions: (
									<small style={{ color: 'blue', textDecoration: 'underline' }}>
										<Link to={'/collection/' + identifier}>{t('collections.list-existing.view-button')}</Link>
										{(collection.userIsCreator || collection.userIsAdmin) && (
											<>
												<br />
												<Link to={'/collection/edit/' + identifier}>{t('collections.list-existing.edit-button')}</Link>
											</>
										)}
									</small>
								)
							}}
						/>
					);
				})}
			</Table>
		</Box>
	);
}

ListCollections.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		collections: state.fin4Store.collections
	};
};

export default drizzleConnect(ListCollections, mapStateToProps);
