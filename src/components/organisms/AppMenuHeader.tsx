import React from 'react'
import { Flex } from '../atoms/Layout'

import { UserImage } from '../atoms/User'
import { useWallet } from '../../context/WalletManager'
import makeBlockie from 'ethereum-blockies-base64'
import { StyledWallet } from '../atoms/Icon'
import { Button } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { useLocation } from 'react-router-dom'

export const AppMenuHeader: React.FC<{ setShow: (show: boolean) => void }> = ({ setShow }) => {
  const { account } = useWallet()
  const location = useLocation()

  return (
    <Flex justifyEnd itemsCenter p={10}>
      <Button light secondary nohover noborder p={8} style={{ borderRadius: '28px' }} onClick={() => setShow(true)}>
        <Flex gap={5}>
          {account ? (
            <UserImage style={{ width: '30px', height: '30px', margin: 'auto' }}>
              <img src={makeBlockie(account)} alt={'account'} />
            </UserImage>
          ) : (
            <Text light={location.pathname == '/'}>
              <StyledWallet size={30} />
            </Text>
          )}
          <Text t4 bold techygradient autoAlignVertical>
            My Solace
          </Text>
        </Flex>
      </Button>
    </Flex>
  )
}
