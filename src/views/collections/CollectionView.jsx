import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Box from '../../components/Box';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SortableTokenList from '../../components/SortableTokenList';

function CollectionView(props, drizzle) {
	const { t } = useTranslation();

	const [collection, setCollection] = useState(null);

	useEffect(() => {
		let collectionIdentifier = props.match.params.collectionIdentifier;
		if (collectionIdentifier && !collection) {
			let col = props.collections[collectionIdentifier];
			if (col) {
				setCollection(col);
			}
		}
	});

	return (
		<Container>
			<Box title={t('collections.view.box-title')}>
				{collection && (
					<span style={{ fontFamily: 'arial' }}>
						<center>
							<b style={{ fontSize: 'large' }}>{collection.name}</b>
						</center>
						<br />
						<br />
						<span style={{ color: 'gray' }}>{t('collections.view.description')}:</span> {collection.description}
						<br />
						<br />
						<span style={{ color: 'gray' }}>{t('collections.view.tokens-count')}:</span> {collection.tokens.length}
						{(collection.userIsCreator || collection.userIsAdmin) && (
							<center>
								<br />
								<Link to={'/collection/edit/' + collection.identifier}>{t('collections.view.edit-button')}</Link>
								<br />
							</center>
						)}
					</span>
				)}
			</Box>
			{collection && (
				<Box title={t('collections.view.tokens-list-box-title')}>
					<SortableTokenList
						tokens={collection.tokens.map(tokenAddr => props.fin4Tokens[tokenAddr])}
						showFilterAndSortOptions={false}
					/>
				</Box>
			)}
		</Container>
	);
}

CollectionView.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens,
		collections: state.fin4Store.collections
	};
};

export default drizzleConnect(CollectionView, mapStateToProps);
