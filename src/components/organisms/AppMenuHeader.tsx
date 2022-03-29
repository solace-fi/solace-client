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
      <Button nohover noborder onClick={() => setShow(true)}>
        {account ? (
          <UserImage style={{ width: '40px', height: '40px', margin: 'auto' }}>
            <img src={makeBlockie(account)} alt={'account'} />
          </UserImage>
        ) : (
          <Text light={location.pathname == '/'}>
            <StyledWallet size={30} />
          </Text>
        )}
      </Button>
    </Flex>
  )
}
