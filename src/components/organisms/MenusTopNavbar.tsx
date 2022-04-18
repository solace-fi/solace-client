import React from 'react'
import { useLocation } from 'react-router'

import { NewTopNav } from '../atoms/Navbar'
import { Button } from '../atoms/Button'
import { StyledMenu } from '../atoms/Icon'
import { Flex } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import { useWallet } from '../../context/WalletManager'
import makeBlockie from 'ethereum-blockies-base64'
import { SolaceGradientCircle } from '../molecules/SolaceGradientCircle'
import UserGradient from '../../resources/svg/user_gradient.svg'

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
            <img src={UserGradient} />
          )}
        </Button>
      </Flex>
    </NewTopNav>
  )
}
