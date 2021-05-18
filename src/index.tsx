import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import App from './pages/App'

import WalletManager from './context/WalletManager'
import ContractsManager from './context/ContractsManager'
import NotificationsManager from './context/NotificationsManager'

ReactDOM.render(
  <React.StrictMode>
    <WalletManager>
      <ContractsManager>
        <NotificationsManager>
          <HashRouter>
            <App />
          </HashRouter>
        </NotificationsManager>
      </ContractsManager>
    </WalletManager>
  </React.StrictMode>,
  document.getElementById('root')
)
