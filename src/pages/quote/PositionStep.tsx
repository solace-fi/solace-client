/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import constants
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
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCard } from '../../components/Card'
import { PositionCardButton, PositionCardText, PositionCardLogo, PositionCardName } from '../../components/Position'
import { Loader } from '../../components/Loader'
import { HeroContainer } from '../../components/Layout'
import { Heading1, TextSpan } from '../../components/Typography'
import { ManageModal } from '../dashboard/ManageModal'

/* import constants */
import { PolicyState } from '../../constants/enums'
import { Policy, Token } from '../../constants/types'

/* import utils */
import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'
import { policyConfig } from '../../utils/config/chainConfig'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, balances, loading } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { account, chainId, library, errors } = useWallet()
  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData, latestBlock, tokenPositionDataInitialized } = useCachedData()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  /*************************************************************************************

  useRef variables

  *************************************************************************************/
  const canLoadOnChange = useRef(false)
  const canLoadOverTime = useRef(false)

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const handleChange = (position: Token) => {
    setForm({
      target: {
        name: 'position',
        value: position,
      },
    })
    navigation.next()
  }

  const getUserBalances = async () => {
    if (!account || !library || !tokenPositionDataInitialized || !chainId) return
    if (policyConfig[chainId]) {
      const balances: Token[] = await policyConfig[chainId].getBalances[protocol.name](account, library, chainId)
      setForm({
        target: {
          name: 'balances',
          value: balances,
        },
      })
    }
  }

  const userHasActiveProductPosition = (product: string, position: string): boolean => {
    for (const policy of userPolicyData.userPolicies) {
      if (product === policy.productName && position === policy.positionName && policy.status === PolicyState.ACTIVE)
        return true
    }
    return false
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = useCallback(() => {
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
  }, [])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const initialLoad = async () => {
      setForm({
        target: {
          name: 'loading',
          value: true,
        },
      })
      await getUserBalances()
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
    }
    initialLoad()
  }, [])

  useEffect(() => {
    const loadOnChange = async () => {
      if (canLoadOnChange.current) {
        setForm({
          target: {
            name: 'loading',
            value: true,
          },
        })
        await getUserBalances()
        setForm({
          target: {
            name: 'loading',
            value: false,
          },
        })
      } else {
        canLoadOnChange.current = true
      }
    }
    loadOnChange()
  }, [account, chainId])

  useEffect(() => {
    const loadOverTime = async () => {
      if (canLoadOverTime.current) {
        await getUserBalances()
      } else {
        canLoadOverTime.current = true
      }
    }
    loadOverTime()
  }, [latestBlock])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <ManageModal
        selectedPolicy={selectedPolicy}
        isOpen={showManageModal}
        latestBlock={latestBlock}
        closeModal={closeModal}
      />
      {balances.length == 0 && !loading && !userPolicyData.policiesLoading && (
        <HeroContainer>
          <Heading1>You do not own any positions on this protocol.</Heading1>
        </HeroContainer>
      )}
      {!loading && !userPolicyData.policiesLoading ? (
        <Fragment>
          <CardContainer>
            {balances.map((position: Token) => {
              return (
                <PositionCard
                  key={position.underlying.address}
                  fade={userHasActiveProductPosition(protocol.name, position.underlying.symbol)}
                  onClick={
                    errors.length > 0
                      ? undefined
                      : userHasActiveProductPosition(protocol.name, position.underlying.symbol)
                      ? () =>
                          openManageModal(
                            userPolicyData.userPolicies.filter(
                              (policy) =>
                                policy.productName == protocol.name && policy.positionName == position.underlying.symbol
                            )[0]
                          )
                      : () => handleChange(position)
                  }
                >
                  {userHasActiveProductPosition(protocol.name, position.underlying.symbol) && (
                    <PositionCardText style={{ opacity: '.8' }}>This position is already covered</PositionCardText>
                  )}
                  <PositionCardLogo
                    style={{
                      opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                    }}
                  >
                    <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`} />
                  </PositionCardLogo>
                  <PositionCardName
                    style={{
                      opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                    }}
                  >
                    {position.underlying.name}
                  </PositionCardName>
                  <PositionCardText
                    t1
                    style={{
                      opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                    }}
                  >
                    {truncateBalance(fixedTokenPositionBalance(position.underlying))}{' '}
                    <TextSpan style={{ fontSize: '12px' }}>{position.underlying.symbol}</TextSpan>
                  </PositionCardText>
                  <PositionCardText
                    t2
                    style={{
                      opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                    }}
                  >
                    {truncateBalance(fixedTokenPositionBalance(position.token))}{' '}
                    <TextSpan style={{ fontSize: '12px' }}>{position.token.symbol}</TextSpan>
                  </PositionCardText>

                  <PositionCardButton>
                    {userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? (
                      <Button>Manage</Button>
                    ) : (
                      <Button>Select</Button>
                    )}
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
