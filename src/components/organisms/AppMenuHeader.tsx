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
      <Button
        secondary
        nohover
        noborder
        p={8}
        style={{ borderRadius: '28px', boxShadow: '0px 0px 30px rgba(138, 138, 138, 0.15)', backgroundColor: '#fff' }}
        onClick={() => setShow(true)}
      >
        <Flex gap={8}>
          {account ? (
            <UserImage style={{ width: '30px', height: '30px', margin: 'auto' }}>
              <img src={makeBlockie(account)} alt={'account'} />
            </UserImage>
          ) : (
            <StyledWallet size={30} />
          )}
          <Text t4 bold techygradient autoAlignVertical>
            My Solace
          </Text>
        </Flex>
      </Button>
    </Flex>
  )
}
