import React, { Fragment, useCallback, useEffect } from 'react'
import { Box, BoxItem, BoxRow, BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { CardContainer, PositionCardComponent } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { useWallet } from '../../context/WalletManager'
import { getPositions } from '../../utils/positionGetter'
import { Loader } from '../../components/Loader'
import { formatEther } from 'ethers/lib/utils'
import { fixedPositionBalance } from '../../utils/formatting'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, lastProtocol, balances, loading } = formData
  const { account, chainId } = useWallet()

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
    if (chainId == 1 || chainId == 4) {
      setForm({
        target: {
          name: 'loading',
          value: true,
        },
      })
      const balances = await getPositions(protocol.toLowerCase(), chainId, account ?? '0x')
      setForm({
        target: {
          name: 'balances',
          value: balances,
        },
      })
      setForm({
        target: {
          name: 'lastProtocol',
          value: protocol,
        },
      })
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
    }
  }, [protocol, chainId, account])

  useEffect(() => {
    if (protocol !== lastProtocol) {
      getBalances()
    }
  }, [])

  return (
    <Fragment>
      <BoxRow>
        <Box>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={`https://assets.solace.fi/${protocol.toLowerCase()}.svg`} />
              </ProtocolImage>
              <ProtocolTitle>{protocol}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>2.60%</BoxItem>
          <BoxItem>4003 ETH</BoxItem>
          <BoxItem>
            <Button onClick={() => navigation.go(0)}>Change</Button>
          </BoxItem>
        </Box>
        <Box transparent outlined>
          <BoxItem>{loading ? 'Loading Your Positions...' : 'Select Position Below'}</BoxItem>
        </Box>
      </BoxRow>
      {!loading ? (
        <CardContainer cardsPerRow={5}>
          {balances.map((position: any) => {
            return (
              <PositionCardComponent key={position.underlying.address}>
                <PositionCardLogo>
                  <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}.svg`} />
                </PositionCardLogo>
                <PositionCardName>{position.underlying.name}</PositionCardName>
                <PositionCardCount>
                  {fixedPositionBalance(position.underlying)}{' '}
                  <BoxItemUnits style={{ fontSize: '12px' }}>{position.underlying.symbol}</BoxItemUnits>
                </PositionCardCount>
                <PositionCardCount>
                  {fixedPositionBalance(position.token)}{' '}
                  <BoxItemUnits style={{ fontSize: '12px' }}>{position.token.symbol}</BoxItemUnits>
                </PositionCardCount>
                <PositionCardCount>
                  {formatEther(position.eth.balance)} <BoxItemUnits style={{ fontSize: '12px' }}>ETH</BoxItemUnits>
                </PositionCardCount>
                <PositionCardButton>
                  <Button onClick={() => handleChange(position)}>Select</Button>
                </PositionCardButton>
              </PositionCardComponent>
            )
          })}
        </CardContainer>
      ) : (
        <Loader />
      )}
    </Fragment>
  )
}
