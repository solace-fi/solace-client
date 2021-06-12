import React, { Fragment, useCallback, useEffect } from 'react'
import { Box, BoxItem, BoxRow, BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { CardContainer, PositionCardComponent } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { POSITIONS_LIST } from '../../constants/positions'
import { getBalances as getMainnetBalances } from '../../compoundPositionGetter/mainnet/getBalances'
import { getBalances as getRinkebyBalances } from '../../compoundPositionGetter/rinkeby/getBalances'
import { useWallet } from '../../context/WalletManager'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, balances } = formData
  const { account, library, chainId } = useWallet()

  const handleChange = (position: any) => {
    setForm({
      target: {
        name: 'position',
        value: position,
      },
    })
    navigation.next()
  }

  const getBalances = useCallback(async () => {
    if (chainId == 1) {
      const balances = await getMainnetBalances(account ?? '0x', library)
      console.log('balances:', balances)
      setForm({
        target: {
          name: 'balances',
          value: balances,
        },
      })
    }
    if (chainId == 4) {
      const balances = await getRinkebyBalances(account ?? '0x', library)
      console.log('balances:', balances)
      setForm({
        target: {
          name: 'balances',
          value: balances,
        },
      })
    }
  }, [protocol, chainId, account])

  useEffect(() => {
    getBalances()
  }, [])

  return (
    <Fragment>
      <BoxRow>
        <Box>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={protocol.img} />
              </ProtocolImage>
              <ProtocolTitle>{protocol.name}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>2.60%</BoxItem>
          <BoxItem>43 ETH</BoxItem>
          <BoxItem>
            <Button onClick={() => navigation.go(0)}>Change</Button>
          </BoxItem>
        </Box>
        <Box transparent outlined>
          <BoxItem>Select Position Below</BoxItem>
        </Box>
      </BoxRow>
      <CardContainer cardsPerRow={5}>
        {balances.map((position: any) => {
          return (
            <PositionCardComponent key={position.underlying.address}>
              <PositionCardLogo>
                <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}.svg`} />
              </PositionCardLogo>
              <PositionCardName>{position.underlying.name}</PositionCardName>
              <PositionCardCount>
                {position.underlying.balance}{' '}
                <BoxItemUnits style={{ fontSize: '12px' }}>{position.underlying.symbol}</BoxItemUnits>
              </PositionCardCount>
              <PositionCardCount>
                {position.token.balance}{' '}
                <BoxItemUnits style={{ fontSize: '12px' }}>{position.token.symbol}</BoxItemUnits>
              </PositionCardCount>
              <PositionCardCount>
                {position.eth.balance} <BoxItemUnits style={{ fontSize: '12px' }}>ETH</BoxItemUnits>
              </PositionCardCount>
              <PositionCardButton>
                <Button onClick={() => handleChange(position)}>Select</Button>
              </PositionCardButton>
            </PositionCardComponent>
          )
        })}
      </CardContainer>
    </Fragment>
  )
}
