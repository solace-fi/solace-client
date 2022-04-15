import React from 'react'
import { useLocation } from 'react-router'

import { NewTopNav } from '../atoms/Navbar'
import { Button } from '../atoms/Button'
import { StyledMenu, StyledWallet } from '../atoms/Icon'
import { Flex } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import { useWallet } from '../../context/WalletManager'
import makeBlockie from 'ethereum-blockies-base64'
import { Text } from '../atoms/Typography'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'

export const MenusTopNavBar: React.FC<{
  setShowLeft: (show: boolean) => void
  setShowRight: (show: boolean) => void
}> = ({ setShowLeft, setShowRight }) => {
  const location = useLocation()
  const { account } = useWallet()

  return (
    <NewTopNav style={{ backgroundColor: location.pathname == '/' ? 'transparent' : undefined }}>
      <Flex between>
        <Button light={location.pathname == '/'} nohover noborder onClick={() => setShowLeft(true)}>
          <StyledMenu size={40} />
        </Button>
        <Button nohover noborder onClick={() => setShowRight(true)}>
          {account ? (
            <SolaceGradientCircle>
              <UserImage style={{ width: '24px', height: '24px', margin: 'auto' }}>
                <img src={makeBlockie(account)} alt={'account'} />
              </UserImage>
            </SolaceGradientCircle>
          ) : (
            <Text light={location.pathname == '/'}>
              <StyledWallet size={30} />
            </Text>
          )}
        </Button>
      </Flex>
    </NewTopNav>
  )
}
