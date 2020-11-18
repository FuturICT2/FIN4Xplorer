import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';

function StepsBottomNav(props) {
	const { t } = useTranslation();

	return (
		<center style={{ paddingTop: '20px' }}>
			<div>
				<Button disabled={props.nav[0] === 0} onClick={props.nav[3]} className={props.nav[2].backButton}>
					{t('campaign-creator.navigation.back-button')}
				</Button>
				<Button variant="contained" color="primary" onClick={props.handleNext}>
					{props.nav[0] === props.nav[1] - 1
						? t('campaign-creator.navigation.finish-button')
						: t('campaign-creator.navigation.next-button')}
				</Button>
			</div>
		</center>
	);
}

export default StepsBottomNav;
