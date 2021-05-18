import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import App from './pages/App'

import Web3Manager from './context/WalletManager'
import ContractsManager from './context/ContractsManager'
import NotificationsManager from './context/NotificationsManager'

ReactDOM.render(
  <React.StrictMode>
    <Web3Manager>
      <ContractsManager>
        <NotificationsManager>
          <HashRouter>
            <App />
          </HashRouter>
        </NotificationsManager>
      </ContractsManager>
    </Web3Manager>
  </React.StrictMode>,
  document.getElementById('root')
)
