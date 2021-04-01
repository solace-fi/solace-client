import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './pages/App'

import getLibrary from './utils/getLibrary'
import { Web3ReactProvider } from '@web3-react/core'

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <HashRouter>
        <App />
      </HashRouter>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
