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
import React, { Fragment, useEffect, useRef, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'

/* import components */
import { BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCard } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { Loader } from '../../components/Loader'
import { HeroContainer } from '../../components/Layout'
import { Heading1 } from '../../components/Text'
import { ManageModal } from '../dashboard/ManageModal'

/* import constants */
import { PolicyState } from '../../constants/enums'
import { Policy, Token } from '../../constants/types'

/* import hooks */
import { usePolicyGetter } from '../../hooks/useGetter'
import { useGetLatestBlockNumber } from '../../hooks/useGetLatestBlockNumber'

/* import utils */
import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'
import { policyConfig } from '../../config/chainConfig'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, balances, loading } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { account, chainId, isActive, version, dataVersion, library } = useWallet()
  const { getPolicies } = usePolicyGetter()
  const { setSelectedProtocolByName } = useContracts()
  const latestBlock = useGetLatestBlockNumber()
  const { errors } = useToasts()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [positionsLoaded, setPositionsLoaded] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [policies, setPolicies] = useState<Policy[]>([])

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

  const getBalances = async () => {
    if (!account || !chainId) return
    if (policyConfig[chainId]) {
      const balances: Token[] = await policyConfig[chainId].getBalances(account, library)
      setForm({
        target: {
          name: 'balances',
          value: balances,
        },
      })
    }
  }

  const userHasActiveProductPosition = (product: string, position: string): boolean => {
    const userPolicyPositions: [string, string, boolean][] = []
    policies.forEach((policy: Policy) => {
      userPolicyPositions.push([policy.productName, policy.positionName, policy.status === PolicyState.ACTIVE])
    })
    for (const policyProductPosition of userPolicyPositions) {
      if (product === policyProductPosition[0] && position === policyProductPosition[1] && policyProductPosition[2]) {
        return true
      }
    }
    return false
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = () => {
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
  }

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
      await getBalances()
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
        await getBalances()
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
        await getBalances()
      } else {
        canLoadOverTime.current = true
      }
    }
    loadOverTime()
  }, [dataVersion])

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const policies = await getPolicies(account as string)
        setPolicies(policies)
        setPositionsLoaded(true)
      }

      fetchPolicies()
    } catch (err) {
      setPositionsLoaded(true)
      console.log(err)
    }
  }, [account, isActive, chainId, version])

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
      {balances.length == 0 && !loading && positionsLoaded && (
        <HeroContainer>
          <Heading1>You do not own any positions on this protocol.</Heading1>
        </HeroContainer>
      )}
      {!loading && positionsLoaded ? (
        <Fragment>
          <CardContainer>
            {balances.map((position: Token) => {
              return (
                <PositionCard
                  key={position.underlying.address}
                  isHighlight={userHasActiveProductPosition(protocol.name, position.underlying.symbol)}
                  onClick={
                    errors.length > 0
                      ? undefined
                      : userHasActiveProductPosition(protocol.name, position.underlying.symbol)
                      ? () =>
                          openManageModal(
                            policies.filter(
                              (policy) =>
                                policy.productName == protocol.name && policy.positionName == position.underlying.symbol
                            )[0]
                          )
                      : () => handleChange(position)
                  }
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
