import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import App from './pages/App'

import WalletManager from './context/WalletManager'
import ContractsManager from './context/ContractsManager'
import NotificationsManager from './context/NotificationsManager'
import ProviderManager from './context/ProviderManager'
import UserDataManager from './context/UserDataManager'

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
