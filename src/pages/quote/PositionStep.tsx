/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import config
    import components
    import constants
    import hooks
    import utils

    PositionStep
      hooks
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { CardContainer } from '../../components/atoms/Card'
import { Loader } from '../../components/atoms/Loader'
import { Scrollable, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { ManageModal } from '../../components/organisms/ManageModal'
import { HyperLink } from '../../components/atoms/Link'
import { TokenPositionCard } from '../../components/organisms/TokenPositionCard'
import { NftPositionCard } from '../../components/organisms/NftPositionCard'
import { Box, BoxItem, BoxItemTitle } from '../../components/atoms/Box'
import { StyledInfo } from '../../components/atoms/Icon'
import { LiquityPositionCard } from '../../components/organisms/LiquityPositionCard'

/* import constants */
import { PositionType } from '../../constants/enums'
import { LiquityPosition, NetworkCache, Policy, Position, SupportedProduct, Token } from '../../constants/types'
import { BKPT_3 } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useDepositedPolicies } from '../../hooks/useBalance'

/* import utils */
import { userHasActiveProductPosition } from '../../utils/policy'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, loading, positions } = formData

  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { account, library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const { setSelectedProtocolByName } = useContracts()
  const { userPolicyData, latestBlock, tokenPosData } = useCachedData()
  const { width } = useWindowDimensions()
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [selectablePositions, setSelectablePositions] = useState<Position[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Position[]>(positions)
  const [fetchedPositions, setFetchedPositions] = useState<Position[]>([])
  const [productLink, setProductLink] = useState<string | undefined>(undefined)
  const canLoadOverTime = useRef(false)
  const canFetchPositions = useRef(true)

  const supportedProduct = useMemo(
    () => activeNetwork.cache.supportedProducts.find((product) => product.name == protocol.name),
    [activeNetwork.cache.supportedProducts, protocol.name]
  )
  const depositedPolicyTokenInfo = useDepositedPolicies()
  const depositedPolicyIds = useMemo(() => depositedPolicyTokenInfo.map((i) => i.id.toNumber()), [
    depositedPolicyTokenInfo,
  ])
  const isPolicyStaked = useMemo(() => depositedPolicyIds.includes(selectedPolicy ? selectedPolicy.policyId : 0), [
    depositedPolicyIds,
    selectedPolicy,
  ])
  /*************************************************************************************

  local functions

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
      case PositionType.TOKEN:
        const erc20Eq =
          (selectedPosition.position as Token).token.address == (positionToSelect.position as Token).token.address
        return erc20Eq
      case PositionType.LQTY:
        const liquityEq =
          (selectedPosition.position as LiquityPosition).positionAddress ==
          (positionToSelect.position as LiquityPosition).positionAddress
        return liquityEq
      case PositionType.OTHER:
      default:
        return true
    }
  }

  const handleFetchPositions = async (supportedProduct: SupportedProduct, cache: NetworkCache): Promise<Position[]> => {
    if (!account || !library) return []
    const savedPositions = cache.positionsCache[supportedProduct.name].positions
    switch (supportedProduct.positionsType) {
      case PositionType.TOKEN:
        if (typeof supportedProduct.getBalances !== 'undefined') {
          const balances: Token[] = await supportedProduct.getBalances[activeNetwork.chainId](
            account,
            library,
            activeNetwork,
            savedPositions.map((position) => position.position as Token)
          ).catch((e) => {
            console.log(`PositionStep: getBalances() for ${supportedProduct.name} failed`, e)
            return []
          })
          return balances.map((balance) => {
            return { type: PositionType.TOKEN, position: balance }
          })
        }
        return []
      case PositionType.LQTY:
        if (typeof supportedProduct.getPositions !== 'undefined') {
          const positions: LiquityPosition[] = await supportedProduct.getPositions[activeNetwork.chainId](
            account,
            library,
            activeNetwork,
            savedPositions.map((position) => position.position as LiquityPosition)
          ).catch((e: any) => {
            console.log(`PositionStep: getPositions() for ${supportedProduct.name} failed`, e)
            return []
          })
          return positions.map((balance) => {
            return { type: PositionType.LQTY, position: balance }
          })
        }
        return []
      case PositionType.OTHER:
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
    if (!tokenPosData.dataInitialized || !chainId || !canFetchPositions.current) return
    canFetchPositions.current = false
    if (findNetworkByChainId(chainId)) {
      try {
        const matchingCache = tokenPosData.storedPosData.find((dataset) => dataset.chainId == activeNetwork.chainId)
        if (!supportedProduct || !matchingCache) return
        const _fetchedPositions = await handleFetchPositions(supportedProduct, matchingCache)
        canFetchPositions.current = true
        setFetchedPositions(_fetchedPositions)
        setForm({
          target: {
            name: 'loading',
            value: false,
          },
        })
      } catch (err) {
        canFetchPositions.current = true
        console.log(err)
      }
    }
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = useCallback(() => {
    setShowManageModal(false)
    setSelectedPolicy(undefined)
    document.body.style.overflowY = 'scroll'
  }, [])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const getProductLink = () => {
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
      if (canLoadOverTime.current) {
        await getUserPositions()
      }
    }
    loadOverTime()
  }, [latestBlock, tokenPosData.dataInitialized])

  useEffect(() => {
    setSelectablePositions(
      fetchedPositions.filter((position: Position) => {
        let addr = ''
        switch (position.type) {
          case PositionType.TOKEN:
            addr = (position.position as Token).token.address
            break
          case PositionType.LQTY:
            addr = (position.position as LiquityPosition).positionAddress
            break
          case PositionType.OTHER:
          default:
        }
        return !userHasActiveProductPosition(userPolicyData.userPolicies, protocol.name, addr)
      })
    )
  }, [fetchedPositions, protocol.name])

  // if a policy is displayed on modal, always get latest policy
  useEffect(() => {
    if (selectedPolicy) {
      const matchingPolicy = userPolicyData.userPolicies.find(
        (policy: Policy) => policy.policyId == selectedPolicy.policyId
      )
      if (!matchingPolicy) return
      if (JSON.stringify(matchingPolicy) !== JSON.stringify(selectedPolicy)) {
        setSelectedPolicy(matchingPolicy)
      }
    }
  }, [userPolicyData.userPolicies])

  return (
    <Fragment>
      <ManageModal
        selectedPolicy={selectedPolicy}
        isOpen={showManageModal}
        latestBlock={latestBlock}
        closeModal={closeModal}
        isPolicyStaked={isPolicyStaked}
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
                  if (position.type == PositionType.TOKEN) {
                    const metadata = (position.position as Token).metadata
                    if (metadata && metadata.tokenType && metadata.tokenType == 'nft') {
                      return (
                        <NftPositionCard
                          key={i}
                          position={position}
                          protocolName={protocol.name}
                          selectedPositions={selectedPositions}
                          userPolicies={userPolicyData.userPolicies}
                          openManageModal={openManageModal}
                          handleSelect={handleSelect}
                        />
                      )
                    }
                    return (
                      <TokenPositionCard
                        key={i}
                        position={position}
                        protocolName={protocol.name}
                        selectedPositions={selectedPositions}
                        userPolicies={userPolicyData.userPolicies}
                        openManageModal={openManageModal}
                        handleSelect={handleSelect}
                      />
                    )
                  }
                  if (position.type == PositionType.LQTY) {
                    return (
                      <LiquityPositionCard
                        key={i}
                        position={position}
                        protocolName={protocol.name}
                        selectedPositions={selectedPositions}
                        userPolicies={userPolicyData.userPolicies}
                        openManageModal={openManageModal}
                        handleSelect={handleSelect}
                      />
                    )
                  }
                })}
              </CardContainer>
            </Scrollable>
          )}
        </Fragment>
      ) : (
        <Loader />
      )}
      {supportedProduct &&
        supportedProduct.supportedSubProducts &&
        supportedProduct.supportedSubProducts[activeNetwork.chainId] &&
        supportedProduct.supportedSubProducts[activeNetwork.chainId].length > 0 && (
          <Box color2>
            <BoxItem style={{ textAlign: 'center' }}>
              <TextSpan light>
                <StyledInfo size={30} />
              </TextSpan>
              <BoxItemTitle mt={5} light>
                Positions are also fetched from:
              </BoxItemTitle>
              {supportedProduct.supportedSubProducts[activeNetwork.chainId].map((name) => (
                <Text light key={name} t4 bold>
                  {name}
                </Text>
              ))}
            </BoxItem>
          </Box>
        )}
    </Fragment>
  )
}
