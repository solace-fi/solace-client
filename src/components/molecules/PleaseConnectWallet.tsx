import React from 'react'
import { Content, Flex, HeroContainer } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { WalletList } from './WalletList'

export const PleaseConnectWallet = () => {
  return (
    <Content>
      <Flex col gap={30}>
        <Text bold t1 textAlignCenter>
          Please connect your wallet to view this page
        </Text>
        <WalletList />
      </Flex>
    </Content>
  )
}
