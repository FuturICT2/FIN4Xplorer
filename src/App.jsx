import React, { Component } from 'react';
import { Route, Router } from 'react-router-dom';
import history from './components/history';
import { DrizzleProvider } from 'drizzle-react';
import styled from 'styled-components';
import drizzleConfig from './config/drizzle-config';
import menuItems from './config/menu-config';
import TopBar from './components/TopBar';
import NavigationBar from './components/NavigationBar';
import { createMuiTheme } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import colors from './config/colors-config';
import store from './middleware';
import { ToastContainer } from 'react-toastify';
import LoadInitialData from './LoadInitialData';
import 'react-toastify/dist/ReactToastify.css';
import Warning from '../src/components/Warning';

class App extends Component {
	render() {
		return (
			<Router history={history}>
				<ThemeProvider theme={globalTheme}>
					<Container>
						<DrizzleProvider store={store} options={drizzleConfig}>
							<>
								<TopBar />
								<Warning />

								<LoadInitialData />
								{menuItems.map((route, i) => (
									<Route exact key={i} render={props => <route.component {...props} />} path={route.path} />
								))}
							</>
						</DrizzleProvider>
						<Spacer />
					</Container>
					<ToastContainer />
					<NavigationBar />
				</ThemeProvider>
			</Router>
		);
	}
}

const globalTheme = createMuiTheme({
	palette: {
		primary: {
			light: colors.light,
			main: colors.main,
			dark: colors.main,
			contrastText: colors.light
		},
		secondary: {
			main: colors.dark,
			light: colors.light,
			dark: colors.dark,
			contrastText: colors.light
		}
	}
});

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-height: 100%;
`;

const Spacer = styled.div`
	height: 300px;
`;

export default App;
