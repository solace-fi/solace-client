import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import App from './pages/App'

import WalletManager from './context/WalletManager'
import ContractsManager from './context/ContractsManager'
import NotificationsManager from './context/NotificationsManager'
import ProviderManager from './context/ProviderManager'
import UserDataManager from './context/UserDataManager'

/*

This is the entry point of the web application, where everything is rendered at the root of the document.

There are two things we need: switching pages and global access to data across the app.

To switch pages, we use HashRouter, a wrapper around the user interface and changes page via routing. See <App /> for more details.

To have global access to data, there are several wrappers around the HashRouter and the App that keeps track of the data. 
Each with their respective category. Currently, these wrappers are created using React Context. To understand the flow of 
global data and its feed to the user interface, you may want to start from the top one first.

On a side note, I call these wrappers 'Managers' because although they technically should be called 'Providers', that term is 
already reserved in our system for something else.

*/

ReactDOM.render(
  <React.StrictMode>
    <ProviderManager>
      <WalletManager>
        <ContractsManager>
          <UserDataManager>
            <NotificationsManager>
              <HashRouter>
                <App />
              </HashRouter>
            </NotificationsManager>
          </UserDataManager>
        </ContractsManager>
      </WalletManager>
    </ProviderManager>
  </React.StrictMode>,
  document.getElementById('root')
)
