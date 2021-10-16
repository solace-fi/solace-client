/*************************************************************************************

    Table of Contents:

    import react
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
import { Scrollable, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'

/* import constants */
import { PolicyState } from '../../constants/enums'
import {
  LiquityPosition,
  NetworkCache,
  Policy,
  Position,
  SupportedProduct,
  Token,
  TokenData,
} from '../../constants/types'
import { BKPT_3 } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixedPositionBalance, truncateBalance } from '../../utils/formatting'
import { HyperLink } from '../../components/atoms/Link'
import { TokenPositionCard } from '../../components/organisms/TokenPositionCard'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, loading, positions } = formData

  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors } = useGeneral()
  const { account, library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData, latestBlock, tokenPosData } = useCachedData()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [selectablePositions, setSelectablePositions] = useState<Position[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Position[]>(positions)
  const [fetchedPositions, setFetchedPositions] = useState<Position[]>([])
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

  const handlePositionAddressFind = (selectedPosition: Position, positionToSelect: Position) => {
    switch (positionToSelect.type) {
      case 'erc20':
        const erc20Eq =
          (selectedPosition.position as Token).token.address == (positionToSelect.position as Token).token.address
        return erc20Eq
      case 'liquity':
        const liquityEq =
          (selectedPosition.position as LiquityPosition).positionAddress ==
          (positionToSelect.position as LiquityPosition).positionAddress
        return liquityEq
      case 'other':
      default:
        return true
    }
  }

  const handleFetchPositions = async (supportedProduct: SupportedProduct, cache: NetworkCache): Promise<Position[]> => {
    if (!account || !library) return []
    const savedPositions = cache.positions[supportedProduct.name].positions
    switch (supportedProduct.positionsType) {
      case 'erc20':
        if (typeof supportedProduct.getBalances !== 'undefined') {
          const balances: Token[] = await supportedProduct.getBalances(
            account,
            library,
            activeNetwork,
            savedPositions.map((position) => position.position as Token)
          )
          return balances.map((balance) => {
            return { type: 'erc20', position: balance }
          })
        }
        return []
      case 'liquity':
        if (typeof supportedProduct.getPositions !== 'undefined') {
          const positions: LiquityPosition[] = await supportedProduct.getPositions(
            account,
            library,
            activeNetwork,
            savedPositions.map((position) => position.position as LiquityPosition)
          )
          return positions.map((balance) => {
            return { type: 'liquity', position: balance }
          })
        }
        return []
      case 'other':
      default:
        return []
    }
  }

  const handleSelect = (position: Position) => {
    const found = selectedPositions.some((selectedPosition) => handlePositionAddressFind(selectedPosition, position))
    if (!found) {
      setSelectedPositions((selectedPositions) => [position, ...selectedPositions])
    } else {
      setSelectedPositions(
        selectedPositions.filter((selectedPosition) => !handlePositionAddressFind(selectedPosition, position))
      )
    }
  }

  const toggleSelectAll = () => {
    // deselect all
    if (selectedPositions.length == selectablePositions.length) {
      setSelectedPositions([])
    } else {
      // select all
      const positionsToAdd: Position[] = []
      selectablePositions.forEach((position: Position) => {
        const found = selectedPositions.find((selectedPosition) =>
          handlePositionAddressFind(selectedPosition, position)
        )
        if (!found) {
          positionsToAdd.push(position)
        }
      })
      setSelectedPositions((selectedPositions) => [...positionsToAdd, ...selectedPositions])
    }
  }

  const getUserPositions = async () => {
    if (!tokenPosData.dataInitialized || !chainId) return
    if (findNetworkByChainId(chainId)) {
      try {
        const supportedProduct = activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name)
        const matchingCache = tokenPosData.storedPosData.find((dataset) => dataset.chainId == activeNetwork.chainId)
        if (!supportedProduct || !matchingCache) return
        const _fetchedPositions = await handleFetchPositions(supportedProduct, matchingCache)
        setFetchedPositions(_fetchedPositions)
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

  const checkUserPositionsForAllUnderlying = (protocolName: string, underlying: TokenData[]) => {
    for (let i = 0; i < underlying.length; i++) {
      if (userHasActiveProductPosition(protocolName, underlying[i].symbol)) return true
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
      if (supportedProduct && supportedProduct.productLink) setProductLink(supportedProduct.productLink)
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
      await getUserPositions()
      canLoadOverTime.current = true
    }
    loadOnBoot()
  }, [])

  useEffect(() => {
    const loadOverTime = async () => {
      if (canLoadOverTime.current && tokenPosData.dataInitialized) {
        await getUserPositions()
      }
    }
    loadOverTime()
  }, [latestBlock])

  useEffect(() => {
    setSelectablePositions(
      fetchedPositions.filter((position: Position) => {
        let positionStr: string | TokenData[] = ''
        switch (position.type) {
          case 'erc20':
            positionStr = (position.position as Token).underlying
            break
          case 'liquity':
            positionStr = (position.position as LiquityPosition).positionName
            break
          case 'other':
          default:
        }
        if (typeof positionStr == 'string') return !userHasActiveProductPosition(protocol.name, positionStr)
        return !checkUserPositionsForAllUnderlying(protocol.name, positionStr)
      })
    )
  }, [fetchedPositions, protocol.name])

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
      {fetchedPositions.length == 0 && !loading && !userPolicyData.policiesLoading && (
        <HeroContainer>
          <Text t1 textAlignCenter>
            You do not own any positions on this protocol.
          </Text>
          {productLink && (
            <HyperLink href={productLink} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
              <Button secondary>Click here to start positions on {protocol.name}</Button>
            </HyperLink>
          )}
        </HeroContainer>
      )}
      {!loading && !userPolicyData.policiesLoading ? (
        <Fragment>
          {selectablePositions.length > 0 && (
            <ButtonWrapper style={{ marginTop: '0' }} isColumn={width <= BKPT_3}>
              <Button widthP={100} secondary onClick={() => toggleSelectAll()}>
                {selectedPositions.length == selectablePositions.length
                  ? `Deselect All (${selectablePositions.length} available)`
                  : `Select All (${selectablePositions.length} available)`}
              </Button>
              <Button disabled={selectedPositions.length == 0} widthP={100} onClick={handleChange} info>
                Proceed to next page
              </Button>
            </ButtonWrapper>
          )}
          {fetchedPositions.length > 0 && (
            <Scrollable maxMobileHeight={65}>
              <CardContainer>
                {fetchedPositions.map((position: Position, i) => {
                  const isActive = userHasActiveProductPosition(
                    protocol.name,
                    (position.position as LiquityPosition).positionName
                  )
                  const isSelected = selectedPositions.some(
                    (selectedPosition) =>
                      (selectedPosition.position as LiquityPosition).positionAddress ==
                      (position.position as LiquityPosition).positionAddress
                  )
                  const lightText = isSelected || isActive

                  if (position.type == 'erc20')
                    return (
                      <TokenPositionCard
                        key={i}
                        position={position}
                        protocolName={protocol.name}
                        selectedPositions={selectedPositions}
                        userPolicies={userPolicyData.userPolicies}
                        openManageModal={openManageModal}
                        handleSelect={handleSelect}
                        checkUserPositionsForAllUnderlying={checkUserPositionsForAllUnderlying}
                      />
                    )
                  if (position.type == 'liquity')
                    return (
                      <PositionCard
                        key={(position.position as LiquityPosition).positionAddress}
                        color1={isSelected}
                        glow={isSelected}
                        fade={isActive}
                        onClick={
                          errors.length > 0
                            ? undefined
                            : isActive
                            ? () =>
                                openManageModal(
                                  userPolicyData.userPolicies.filter(
                                    (policy) =>
                                      policy.productName == protocol.name &&
                                      policy.positionNames.includes((position.position as LiquityPosition).positionName)
                                  )[0]
                                )
                            : () => handleSelect(position)
                        }
                      >
                        {isActive && (
                          <PositionCardText style={{ opacity: '.8' }} light={lightText}>
                            This position is already covered
                          </PositionCardText>
                        )}
                        <DeFiAssetImage
                          noborder
                          style={{
                            opacity: isActive ? '.5' : '1',
                          }}
                        >
                          <img
                            src={`https://assets.solace.fi/${(position.position as LiquityPosition).positionAddress.toLowerCase()}`}
                            alt={(position.position as LiquityPosition).positionName}
                          />
                        </DeFiAssetImage>
                        <PositionCardName
                          style={{
                            opacity: isActive ? '.5' : '1',
                          }}
                          light={lightText}
                        >
                          {(position.position as LiquityPosition).positionName}
                        </PositionCardName>
                        <PositionCardText
                          t1
                          style={{
                            opacity: isActive ? '.5' : '1',
                          }}
                          light={lightText}
                        >
                          {truncateBalance(
                            fixedPositionBalance((position.position as LiquityPosition).amount.toString(), 18)
                          )}{' '}
                          <TextSpan style={{ fontSize: '12px' }} light={lightText}>
                            {(position.position as LiquityPosition).associatedToken.symbol}
                          </TextSpan>
                        </PositionCardText>
                        <PositionCardButton>
                          {isActive ? (
                            <Button widthP={width > BKPT_3 ? undefined : 100} light>
                              Manage
                            </Button>
                          ) : isSelected ? (
                            <Button widthP={width > BKPT_3 ? undefined : 100} light>
                              {'Deselect'}
                            </Button>
                          ) : (
                            <Button widthP={width > BKPT_3 ? undefined : 100} info>
                              {'Select'}
                            </Button>
                          )}
                        </PositionCardButton>
                      </PositionCard>
                    )
                })}
              </CardContainer>
            </Scrollable>
          )}
        </Fragment>
      ) : (
        <Loader />
      )}
    </Fragment>
  )
}
