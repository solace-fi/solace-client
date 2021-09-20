/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import config
    import components
    import constants
    import hooks
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

/* import packages */
import styled from 'styled-components'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { CardContainer, PositionCard } from '../../components/atoms/Card'
import {
  PositionCardButton,
  PositionCardText,
  DeFiAssetImage,
  PositionCardName,
} from '../../components/atoms/DeFiAsset'
import { Loader } from '../../components/atoms/Loader'
import { Content, Scrollable, HeroContainer } from '../../components/atoms/Layout'
import { Heading1, TextSpan } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'

/* import constants */
import { PolicyState } from '../../constants/enums'
import { Policy, Token } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixedTokenPositionBalance, truncateBalance } from '../../utils/formatting'
import { HyperLink } from '../../components/atoms/Link'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, loading, positions } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors } = useGeneral()
  const { account, library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData, latestBlock, tokenPositionData } = useCachedData()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [selectableBalances, setSelectableBalances] = useState<Token[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Token[]>(positions)
  const [fetchedBalances, setFetchedBalances] = useState<Token[]>([])
  const [productLink, setProductLink] = useState<string | undefined>(undefined)

  /*************************************************************************************

  useRef variables

  *************************************************************************************/
  const canLoadOverTime = useRef(false)

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const handleChange = () => {
    setForm({
      target: {
        name: 'positions',
        value: selectedPositions,
      },
    })
    navigation.next()
  }

  const handleSelect = (position: Token) => {
    const found = selectedPositions.some(
      (selectedPosition) => selectedPosition.underlying.address == position.underlying.address
    )
    if (!found) {
      setSelectedPositions((selectedPositions) => [position, ...selectedPositions])
    } else {
      setSelectedPositions(
        selectedPositions.filter(
          (selectedPosition) => selectedPosition.underlying.address != position.underlying.address
        )
      )
    }
  }

  const toggleSelectAll = () => {
    // deselect all
    if (selectedPositions.length == selectableBalances.length) {
      setSelectedPositions([])
    } else {
      // select all
      const tokensToAdd: Token[] = []
      selectableBalances.forEach((balance: Token) => {
        const found = selectedPositions.find(
          (selectedPosition) => selectedPosition.underlying.address == balance.underlying.address
        )
        if (!found) {
          tokensToAdd.push(balance)
        }
      })
      setSelectedPositions((selectedPositions) => [...tokensToAdd, ...selectedPositions])
    }
  }

  const getUserBalances = async () => {
    if (!account || !library || !tokenPositionData.dataInitialized || !chainId) return
    const cache = tokenPositionData.storedTokenAndPositionData.find((dataset) => dataset.name == activeNetwork.name)
    if (findNetworkByChainId(chainId) && cache) {
      try {
        const supportedProduct = activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name)
        if (!supportedProduct) return
        const savedTokens = cache.tokens[supportedProduct.name].savedTokens
        const balances: Token[] = await supportedProduct.getBalances(
          account,
          library,
          cache,
          activeNetwork,
          savedTokens
        )
        setFetchedBalances(balances)
        setForm({
          target: {
            name: 'loading',
            value: false,
          },
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  const userHasActiveProductPosition = (product: string, position: string): boolean => {
    for (const policy of userPolicyData.userPolicies) {
      if (
        product === policy.productName &&
        policy.positionNames.includes(position) &&
        policy.status === PolicyState.ACTIVE
      )
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
    const getProductLink = () => {
      const supportedProduct = activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name)
      if (!supportedProduct) return
      if (supportedProduct.productLink) setProductLink(supportedProduct.productLink)
    }
    getProductLink()
  }, [])

  useEffect(() => {
    const loadOnBoot = async () => {
      setForm({
        target: {
          name: 'loading',
          value: true,
        },
      })
      await getUserBalances()
      canLoadOverTime.current = true
    }
    loadOnBoot()
  }, [])

  useEffect(() => {
    const loadOverTime = async () => {
      if (canLoadOverTime.current) {
        await getUserBalances()
      }
    }
    loadOverTime()
  }, [latestBlock, tokenPositionData.dataInitialized])

  useEffect(() => {
    setSelectableBalances(
      fetchedBalances.filter(
        (balance: Token) => !userHasActiveProductPosition(protocol.name, balance.underlying.symbol)
      )
    )
  }, [fetchedBalances, protocol.name])

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
      {fetchedBalances.length == 0 && !loading && !userPolicyData.policiesLoading && (
        <HeroContainer>
          <Heading1 textAlignCenter>You do not own any positions on this protocol.</Heading1>
          {productLink && (
            <HyperLink href={productLink} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
              <Button secondary>Click here to start positions on {protocol.name}</Button>
            </HyperLink>
          )}
        </HeroContainer>
      )}
      {!loading && !userPolicyData.policiesLoading ? (
        <Content>
          {selectableBalances.length > 0 && (
            <ButtonWrapper style={{ marginTop: '0' }} isColumn={width <= MAX_MOBILE_SCREEN_WIDTH}>
              <Button widthP={100} secondary onClick={() => toggleSelectAll()}>
                {selectedPositions.length == selectableBalances.length
                  ? `Deselect All (${selectableBalances.length} available)`
                  : `Select All (${selectableBalances.length} available)`}
              </Button>
              <Button disabled={selectedPositions.length == 0} widthP={100} onClick={handleChange}>
                Proceed to next page
              </Button>
            </ButtonWrapper>
          )}
          {fetchedBalances.length > 0 && (
            <Scrollable maxMobileHeight={65}>
              <CardContainer>
                {fetchedBalances.map((position: Token) => {
                  return (
                    <PositionCard
                      key={position.underlying.address}
                      blue={selectedPositions.some(
                        (selectedPosition) => selectedPosition.underlying.address == position.underlying.address
                      )}
                      glow={selectedPositions.some(
                        (selectedPosition) => selectedPosition.underlying.address == position.underlying.address
                      )}
                      fade={userHasActiveProductPosition(protocol.name, position.underlying.symbol)}
                      onClick={
                        errors.length > 0
                          ? undefined
                          : userHasActiveProductPosition(protocol.name, position.underlying.symbol)
                          ? () =>
                              openManageModal(
                                userPolicyData.userPolicies.filter(
                                  (policy) =>
                                    policy.productName == protocol.name &&
                                    policy.positionNames.includes(position.underlying.symbol)
                                )[0]
                              )
                          : () => handleSelect(position)
                      }
                    >
                      {userHasActiveProductPosition(protocol.name, position.underlying.symbol) && (
                        <PositionCardText style={{ opacity: '.8' }}>This position is already covered</PositionCardText>
                      )}
                      <DeFiAssetImage
                        borderless
                        style={{
                          opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                        }}
                      >
                        <img
                          src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}`}
                          alt={position.underlying.name}
                        />
                      </DeFiAssetImage>
                      <PositionCardName
                        high_em
                        style={{
                          opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                        }}
                      >
                        {position.underlying.name}
                      </PositionCardName>
                      <PositionCardText
                        t1
                        high_em
                        style={{
                          opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                        }}
                      >
                        {truncateBalance(fixedTokenPositionBalance(position.underlying))}{' '}
                        <TextSpan style={{ fontSize: '12px' }}>{position.underlying.symbol}</TextSpan>
                      </PositionCardText>
                      <PositionCardText
                        t3
                        style={{
                          opacity: userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? '.5' : '1',
                        }}
                      >
                        {truncateBalance(fixedTokenPositionBalance(position.token))}{' '}
                        <TextSpan style={{ fontSize: '12px' }}>{position.token.symbol}</TextSpan>
                      </PositionCardText>
                      <PositionCardButton>
                        {userHasActiveProductPosition(protocol.name, position.underlying.symbol) ? (
                          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>Manage</Button>
                        ) : (
                          <Button widthP={width > MAX_MOBILE_SCREEN_WIDTH ? undefined : 100}>
                            {selectedPositions.some(
                              (selectedPosition) => selectedPosition.underlying.address == position.underlying.address
                            )
                              ? 'Deselect'
                              : 'Select'}
                          </Button>
                        )}
                      </PositionCardButton>
                    </PositionCard>
                  )
                })}
              </CardContainer>
            </Scrollable>
          )}
        </Content>
      ) : (
        <Loader />
      )}
    </Fragment>
  )
}
