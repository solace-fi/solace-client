/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import utils

    PositionStep function
      Hook variables
      useState variables
      Local helper functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useEffect, useState } from 'react'

/* import packages */
import { formatEther } from 'ethers/lib/utils'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCardComponent } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { Loader } from '../../components/Loader'

/* import utils */
import { getPositions } from '../../utils/positionGetter'
import { fixedPositionBalance } from '../../utils/formatting'
import { getAllPoliciesOfUser } from '../../utils/policyGetter'
import { PolicyStatus } from '../../constants/enums'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, lastProtocol, balances, loading } = formData

  /*************************************************************************************

  Hook variables

  *************************************************************************************/

  const { account, chainId, isActive } = useWallet()

  /*************************************************************************************

  useState variables

  *************************************************************************************/
  const [userPolicyPositions, setUserPolicyPositions] = useState<[string, string, boolean][]>([])

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

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
      const balances = await getPositions(protocol.name.toLowerCase(), chainId, account ?? '0x')
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

  const userHasActiveProductPosition = (product: string, position: string): boolean => {
    let result = false
    for (const policyProductPosition of userPolicyPositions) {
      if (product === policyProductPosition[0] && position === policyProductPosition[1] && policyProductPosition[2]) {
        result = true
        break
      }
    }
    return result
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (protocol.name !== lastProtocol.name) {
      getBalances()
    }
  }, [])

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const policies = await getAllPoliciesOfUser(account as string, Number(chainId))

        // tuple data type: [product, position, isActive]
        // [['compound', 'eth', true], ['compound', 'dai', false],..,]
        const userPolicyPositionList: [string, string, boolean][] = []
        policies.forEach((policy) => {
          userPolicyPositionList.push([policy.productName, policy.positionName, policy.status === PolicyStatus.ACTIVE])
        })
        setUserPolicyPositions(userPolicyPositionList)
      }

      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [account, isActive, chainId])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      {!loading ? (
        <CardContainer cardsPerRow={3}>
          {balances.map((position: any) => {
            return (
              <PositionCardComponent
                key={position.underlying.address}
                disabled={userHasActiveProductPosition(protocol.name, position.underlying.symbol)}
              >
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
                <PositionCardCount>Eth Value:</PositionCardCount>
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
