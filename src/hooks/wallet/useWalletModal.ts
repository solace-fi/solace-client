import { useCallback, useEffect, useRef, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
export const useWalletModal = (web3Initialized: boolean) => {
  const { account } = useWeb3React()
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false)

  const accountRef = useRef(account)
  accountRef.current = account

  const web3InitializedRef = useRef(web3Initialized)
  web3InitializedRef.current = web3Initialized

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setShowWalletModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setShowWalletModal(false)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const prompt = params.get('connect-wallet')
      if (prompt) {
        history.pushState(null, '', location.href.split('?')[0])
        console.log('USEWALLETMODAL', accountRef.current, web3InitializedRef.current)
        if (!accountRef.current && web3InitializedRef.current) {
          setShowWalletModal(true)
          console.log('connect wallet', prompt)
        }
      }
    }, 1500)
  }, [setShowWalletModal, web3Initialized])

  return { showWalletModal, openModal, closeModal }
}
