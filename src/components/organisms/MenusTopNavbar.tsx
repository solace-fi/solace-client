import React from 'react'
import { useLocation } from 'react-router'

import { TopNav } from '../atoms/Navbar'
import { Button } from '../atoms/Button'
import { StyledMenu, StyledWallet } from '../atoms/Icon'
import { Flex } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import { useWallet } from '../../context/WalletManager'
import makeBlockie from 'ethereum-blockies-base64'

export const MenusTopNavBar: React.FC<{
  setShowLeft: (show: boolean) => void
  setShowRight: (show: boolean) => void
}> = ({ setShowLeft, setShowRight }) => {
  const location = useLocation()
  const { account } = useWallet()

  return (
    <TopNav style={{ backgroundColor: location.pathname == '/' ? 'transparent' : undefined }}>
      <Flex between>
        <Button nohover noborder onClick={() => setShowLeft(true)}>
          <StyledMenu size={40} />
        </Button>
        <Button nohover noborder onClick={() => setShowRight(true)}>
          <UserImage style={{ width: '40px', height: '40px', margin: 'auto' }}>
            {account ? <img src={makeBlockie(account)} alt={'account'} /> : <StyledWallet size={30} />}
          </UserImage>
        </Button>
      </Flex>
    </TopNav>
  )
}
