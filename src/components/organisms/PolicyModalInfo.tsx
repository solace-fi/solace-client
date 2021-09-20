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
import { Policy, Token } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { FormCol, FormRow } from '../atoms/Form'
import { FlexCol, FlexRow, HeroContainer } from '../atoms/Layout'
import { DeFiAsset, DeFiAssetImage } from '../atoms/DeFiAsset'
import { Loader } from '../atoms/Loader'
import { Heading3, Text, TextSpan } from '../atoms/Typography'
import { Card } from '../atoms/Card'
import { StyledTooltip } from '../molecules/Tooltip'
import { Button, ButtonWrapper } from '../atoms/Button'
import { StyledDots } from '../atoms/Icon'
import { AssetsModal } from '../molecules/AssetsModal'

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
  const [tokens, setTokens] = useState<any[]>([])
  const maxPositionsOnDisplay = 4

  /*************************************************************************************

    local functions

  *************************************************************************************/

  const getTokens = async () => {
    const cache = tokenPositionData.storedTokenAndPositionData.find((dataset) => dataset.name == activeNetwork.name)
    if (!selectedPolicy || !cache || !account) return
    const supportedProduct = activeNetwork.cache.supportedProducts.find(
      (product) => product.name == selectedPolicy.productName
    )
    if (!supportedProduct) return
    const savedTokens = cache.tokens[supportedProduct.name].savedTokens
    const balances: Token[] = savedTokens.filter((savedToken: Token) =>
      selectedPolicy.positionDescription.includes(savedToken.token.address.slice(2).toLowerCase())
    )
    setTokens(balances)
  }

  const closeModal = useCallback(() => {
    setShowAssetsModal(false)
  }, [])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    getTokens()
  }, [selectedPolicy])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      <AssetsModal closeModal={closeModal} isOpen={showAssetsModal} assets={tokens} modalTitle={'Covered Assets'} />
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Policy ID
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {selectedPolicy?.policyId}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Days to expiration{' '}
              <StyledTooltip id={'days-to-expiration'} tip={'Number of days left until this policy expires'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Cover Amount <StyledTooltip id={'covered-amount'} tip={'The amount you are covered on this policy'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {selectedPolicy?.coverAmount
                ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                : 0}{' '}
              {activeNetwork.nativeCurrency.symbol}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Position Amount <StyledTooltip id={'position-amount'} tip={'The amount of this asset you own'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
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
              <Text t4 high_em>
                Policy ID:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>{selectedPolicy?.policyId}</Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Days to expiration:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Cover Amount:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {selectedPolicy?.coverAmount
                  ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                  : 0}{' '}
                {activeNetwork.nativeCurrency.symbol}
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Position Amount:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {appraisal.gt(ZERO) ? (
                  `${truncateBalance(formatUnits(appraisal, currencyDecimals) || 0)} ${
                    activeNetwork.nativeCurrency.symbol
                  }`
                ) : (
                  <Loader width={10} height={10} />
                )}{' '}
              </Heading3>
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
                  <img src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`} />
                </DeFiAssetImage>
                <TextSpan h2 high_em>
                  {selectedPolicy?.productName}
                </TextSpan>
              </DeFiAsset>
            </FormCol>
            <FormCol style={{ margin: 'auto' }}>
              <FlexRow>
                {selectedPolicy?.positionNames.slice(0, maxPositionsOnDisplay).map((name: string) => (
                  <FlexCol style={{ alignItems: 'center' }} key={name}>
                    <DeFiAssetImage borderless width={45} height={45}>
                      <img src={`https://assets.solace.fi/${name.toLowerCase()}`} />
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
                    <img src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`} />
                  </DeFiAssetImage>
                  <TextSpan h2 high_em>
                    {selectedPolicy?.productName}
                  </TextSpan>
                </DeFiAsset>
              </FlexCol>
            </FlexRow>
            <FlexRow>
              {selectedPolicy?.positionNames.slice(0, maxPositionsOnDisplay).map((name: string) => (
                <FlexCol style={{ alignItems: 'center' }} key={name}>
                  <DeFiAssetImage borderless width={45} height={45}>
                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} />
                  </DeFiAssetImage>
                </FlexCol>
              ))}
              {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > maxPositionsOnDisplay && (
                <StyledDots size={40} />
              )}
            </FlexRow>
          </FlexCol>
        )}
        {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > maxPositionsOnDisplay && (
          <ButtonWrapper style={{ width: '100%' }}>
            <Button widthP={100} onClick={() => setShowAssetsModal(true)}>
              View all covered assets
            </Button>
          </ButtonWrapper>
        )}
      </HeroContainer>
      <hr style={{ marginBottom: '20px' }} />
    </Fragment>
  )
}
