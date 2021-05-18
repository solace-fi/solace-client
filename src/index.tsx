import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'

import App from './pages/App'

import Web3Manager from './context/Web3Manager'
import ContractsManager from './context/ContractsManager'
import ToastsManager from './context/ToastsManager'

ReactDOM.render(
  <React.StrictMode>
    <Web3Manager>
      <ContractsManager>
        <ToastsManager>
          <HashRouter>
            <App />
          </HashRouter>
        </ToastsManager>
      </ContractsManager>
    </Web3Manager>
  </React.StrictMode>,
  document.getElementById('root')
)
