/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PolicyModalInfo function
      custom hooks
      local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useState, useEffect } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useWallet } from '../../context/WalletManager'

/* import constants */
import {
  Policy,
  Token,
  Position,
  SupportedProduct,
  NetworkCache,
  BasicData,
  LiquityPosition,
} from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { FormCol, FormRow } from '../atoms/Form'
import { FlexCol, FlexRow, HeroContainer } from '../atoms/Layout'
import { DeFiAsset, DeFiAssetImage } from '../atoms/DeFiAsset'
import { Loader } from '../atoms/Loader'
import { Text, TextSpan } from '../atoms/Typography'
import { Card } from '../atoms/Card'
import { StyledTooltip } from '../molecules/Tooltip'
import { Button, ButtonWrapper } from '../atoms/Button'
import { StyledDots } from '../atoms/Icon'
import { AssetsModal } from './AssetsModal'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getDaysLeft } from '../../utils/time'
import { truncateBalance } from '../../utils/formatting'

interface PolicyModalInfoProps {
  appraisal: BigNumber
  selectedPolicy: Policy | undefined
  latestBlock: number
}

export const PolicyModalInfo: React.FC<PolicyModalInfoProps> = ({ appraisal, selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { width } = useWindowDimensions()
  const { account } = useWallet()
  const { tokenPositionData } = useCachedData()
  const [showAssetsModal, setShowAssetsModal] = useState<boolean>(false)
  const [assets, setAssets] = useState<BasicData[]>([])
  const maxPositionsOnDisplay = 4

  /*************************************************************************************

    local functions

  *************************************************************************************/

  const getAssets = async () => {
    const cache = tokenPositionData.storedPositionData.find((dataset) => dataset.name == activeNetwork.name)
    if (!selectedPolicy || !cache || !account) return
    const supportedProduct = activeNetwork.cache.supportedProducts.find(
      (product) => product.name == selectedPolicy.productName
    )
    if (!supportedProduct) return
    const foundPositions = await handleFilterPositions(supportedProduct, cache, selectedPolicy)
    setAssets(foundPositions)
  }

  const handleFilterPositions = async (
    supportedProduct: SupportedProduct,
    _cache: NetworkCache,
    _selectedPolicy: Policy
  ): Promise<BasicData[]> => {
    let res: BasicData[] = []
    const savedPositions: Position[] = _cache.positions[supportedProduct.name].savedPositions
    switch (supportedProduct.positionsType) {
      case 'erc20':
        const filteredPositions: Position[] = savedPositions.filter((savedPosition: Position) =>
          _selectedPolicy.positionDescription.includes(
            (savedPosition.position as Token).token.address.slice(2).toLowerCase()
          )
        )
        res = filteredPositions.map((filteredPosition: Position) => {
          return {
            name: (filteredPosition.position as Token).underlying.name,
            address: (filteredPosition.position as Token).underlying.address,
          }
        })
        break
      case 'liquity':
        res = savedPositions
          .map((pos) => {
            return {
              name: (pos.position as LiquityPosition).positionName,
              address: (pos.position as LiquityPosition).positionAddress,
            }
          })
          .filter((pos: any) => _selectedPolicy.positionDescription.includes(pos.address.slice(2).toLowerCase()))
        break
      case 'other':
      default:
    }
    return res
  }

  const closeModal = useCallback(() => {
    setShowAssetsModal(false)
  }, [])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    getAssets()
  }, [selectedPolicy])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      <AssetsModal
        closeModal={closeModal}
        isOpen={showAssetsModal}
        assets={assets}
        modalTitle={`Covered Assets (${assets.length})`}
      />
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle t3>Policy ID</BoxItemTitle>
            <Text t2 nowrap>
              {selectedPolicy?.policyId}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>
              Days to expiration{' '}
              <StyledTooltip id={'days-to-expiration'} tip={'Number of days left until this policy expires'} />
            </BoxItemTitle>
            <Text t2 nowrap>
              {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>
              Cover Amount <StyledTooltip id={'covered-amount'} tip={'The amount you are covered on this policy'} />
            </BoxItemTitle>
            <Text t2 nowrap>
              {selectedPolicy?.coverAmount
                ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                : 0}{' '}
              {activeNetwork.nativeCurrency.symbol}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>
              Position Amount <StyledTooltip id={'position-amount'} tip={'The amount of this asset you own'} />
            </BoxItemTitle>
            <Text t2 nowrap>
              {appraisal.gt(ZERO) ? (
                `${truncateBalance(formatUnits(appraisal, currencyDecimals) || 0)} ${
                  activeNetwork.nativeCurrency.symbol
                }`
              ) : (
                <Loader width={10} height={10} />
              )}
            </Text>
          </BoxItem>
        </Box>
      ) : (
        // mobile version
        <Card transparent>
          <FormRow mb={10}>
            <FormCol>
              <Text t4>Policy ID:</Text>
            </FormCol>
            <FormCol>
              <Text bold t3>
                {selectedPolicy?.policyId}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4>Days to expiration:</Text>
            </FormCol>
            <FormCol>
              <Text bold t3>
                {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4>Cover Amount:</Text>
            </FormCol>
            <FormCol>
              <Text bold t3>
                {selectedPolicy?.coverAmount
                  ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                  : 0}{' '}
                {activeNetwork.nativeCurrency.symbol}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4>Position Amount:</Text>
            </FormCol>
            <FormCol>
              <Text bold t3>
                {appraisal.gt(ZERO) ? (
                  `${truncateBalance(formatUnits(appraisal, currencyDecimals) || 0)} ${
                    activeNetwork.nativeCurrency.symbol
                  }`
                ) : (
                  <Loader width={10} height={10} />
                )}{' '}
              </Text>
            </FormCol>
          </FormRow>
        </Card>
      )}
      <HeroContainer height={width > MAX_MOBILE_SCREEN_WIDTH ? 150 : 200}>
        {width > MAX_MOBILE_SCREEN_WIDTH ? (
          <FlexRow>
            <FormCol>
              <DeFiAsset style={{ flexDirection: 'column' }}>
                <DeFiAssetImage width={60} height={60}>
                  <img
                    src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`}
                    alt={selectedPolicy?.productName}
                  />
                </DeFiAssetImage>
                <TextSpan t2>{selectedPolicy?.productName}</TextSpan>
              </DeFiAsset>
            </FormCol>
            <FormCol style={{ margin: 'auto' }}>
              <FlexRow>
                {selectedPolicy?.positionNames.slice(0, maxPositionsOnDisplay).map((name: string) => (
                  <FlexCol style={{ alignItems: 'center' }} key={name}>
                    <DeFiAssetImage noborder width={45} height={45}>
                      <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                    </DeFiAssetImage>
                  </FlexCol>
                ))}
                {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > maxPositionsOnDisplay && (
                  <StyledDots size={40} />
                )}
              </FlexRow>
            </FormCol>
          </FlexRow>
        ) : (
          <FlexCol>
            <FlexRow style={{ justifyContent: 'center' }} mt={10} mb={10}>
              <FlexCol>
                <DeFiAsset style={{ flexDirection: 'column' }}>
                  <DeFiAssetImage width={60} height={60}>
                    <img
                      src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`}
                      alt={selectedPolicy?.productName}
                    />
                  </DeFiAssetImage>
                  <TextSpan t2>{selectedPolicy?.productName}</TextSpan>
                </DeFiAsset>
              </FlexCol>
            </FlexRow>
            <FlexRow style={{ justifyContent: 'center' }}>
              {selectedPolicy?.positionNames.slice(0, maxPositionsOnDisplay).map((name: string) => (
                <FlexCol key={name}>
                  <DeFiAssetImage noborder width={45} height={45}>
                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                  </DeFiAssetImage>
                </FlexCol>
              ))}
              {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > maxPositionsOnDisplay && (
                <StyledDots size={40} />
              )}
            </FlexRow>
          </FlexCol>
        )}
        {selectedPolicy?.positionNames && (
          <ButtonWrapper style={{ width: '100%' }}>
            <Button widthP={100} onClick={() => setShowAssetsModal(true)}>
              View your covered positions
            </Button>
          </ButtonWrapper>
        )}
      </HeroContainer>
      <hr style={{ marginBottom: '20px' }} />
    </Fragment>
  )
}
