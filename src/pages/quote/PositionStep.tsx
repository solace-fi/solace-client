/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import utils

    PositionStep function
      custom hooks
      useState hooks
      useRef variables
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCard } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { Loader } from '../../components/Loader'
import { HeroContainer } from '../../components/Layout'
import { Heading1 } from '../../components/Text'

/* import constants */
import { PolicyStates } from '../../constants/enums'

/* import hooks */
import { usePolicyGetter } from '../../hooks/useGetter'

/* import utils */
import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'
import { getUserPolicies, getPositions } from '../../utils/paclas'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, lastProtocol, balances, loading } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { account, chainId, isActive } = useWallet()
  const { getPolicies } = usePolicyGetter()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [userPolicyPositions, setUserPolicyPositions] = useState<[string, string, boolean][]>([])
  const [positionsLoaded, setPositionsLoaded] = useState<boolean>(false)

  /*************************************************************************************

  useRef variables

  *************************************************************************************/
  const appMounting = useRef(true)

  /*************************************************************************************

  Local functions

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
    if (!account) return
    if (chainId == 1 || chainId == 4) {
      setForm({
        target: {
          name: 'loading',
          value: true,
        },
      })
      const balances = await getPositions(protocol.name.toLowerCase(), chainId, account)
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
    if (!appMounting.current) {
      getBalances()
    } else {
      appMounting.current = false
    }
  }, [account, chainId])

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const policies = await getPolicies(account as string)

        // tuple data type: [product, position, isActive]
        // [['compound', 'eth', true], ['compound', 'dai', false],..,]
        const userPolicyPositionList: [string, string, boolean][] = []
        policies.forEach((policy: any) => {
          userPolicyPositionList.push([policy.productName, policy.positionName, policy.status === PolicyStates.ACTIVE])
        })
        setUserPolicyPositions(userPolicyPositionList)
        setPositionsLoaded(true)
      }

      fetchPolicies()
    } catch (err) {
      setPositionsLoaded(true)
      console.log(err)
    }
  }, [account, isActive, chainId])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      {balances.length == 0 && !loading && positionsLoaded && (
        <HeroContainer>
          <Heading1>You do not own any positions on this protocol.</Heading1>
        </HeroContainer>
      )}
      {!loading && positionsLoaded ? (
        <Fragment>
          <CardContainer>
            {balances.map((position: any) => {
              return (
                <PositionCard
                  key={position.underlying.address}
                  disabled={userHasActiveProductPosition(protocol.name, position.underlying.symbol)}
                  onClick={() => handleChange(position)}
                >
                  <PositionCardLogo>
                    <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}.svg`} />
                  </PositionCardLogo>
                  <PositionCardName>{position.underlying.name}</PositionCardName>
                  <PositionCardCount t1>
                    {truncateBalance(fixedTokenPositionBalance(position.underlying))}{' '}
                    <BoxItemUnits style={{ fontSize: '12px' }}>{position.underlying.symbol}</BoxItemUnits>
                  </PositionCardCount>
                  <PositionCardCount t2>
                    {truncateBalance(fixedTokenPositionBalance(position.token))}{' '}
                    <BoxItemUnits style={{ fontSize: '12px' }}>{position.token.symbol}</BoxItemUnits>
                  </PositionCardCount>
                  <PositionCardButton>
                    <Button>Select</Button>
                  </PositionCardButton>
                </PositionCard>
              )
            })}
          </CardContainer>
        </Fragment>
      ) : (
        <Loader />
      )}
    </Fragment>
  )
}
