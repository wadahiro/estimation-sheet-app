import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import configureStore from './store/configureStore';
import App from './components/App';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

const store = configureStore();

const muiTheme = getMuiTheme({
    fontFamily: 'Helvetica,Arial,sans-serif',
    tableRow: {
        height: 30
    },
    tableHeaderColumn: {
        height: 30
    }
});

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
            <App />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
);
