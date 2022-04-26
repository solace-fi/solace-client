/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PolicyModalInfo
      hooks
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useCallback, useState, useEffect, useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Block } from '@ethersproject/abstract-provider'

/* import managers */
import { useNetwork } from '../../../context/NetworkManager'

/* import constants */
import { Policy, BasicData } from '../../../constants/types'
import { BKPT_3, ZERO } from '../../../constants'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../../atoms/Box'
import { Flex, HeroContainer, HorizRule } from '../../atoms/Layout'
import { DeFiAsset, DeFiAssetImage } from '../../atoms/DeFiAsset'
import { Loader } from '../../atoms/Loader'
import { Text, TextSpan } from '../../atoms/Typography'
import { Card } from '../../atoms/Card'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { StyledDots } from '../../atoms/Icon'
import { AssetsModal } from '../AssetsModal'

/* import hooks */
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'

/* import utils */
import { getDaysLeftByBlockNum } from '../../../utils/time'
import { truncateValue } from '../../../utils/formatting'
import { useWeb3React } from '@web3-react/core'

interface PolicyModalInfoProps {
  appraisal: BigNumber
  selectedPolicy: Policy | undefined
  latestBlock: Block | undefined
}

export const PolicyModalInfo: React.FC<PolicyModalInfoProps> = ({ appraisal, selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
  const { width } = useWindowDimensions()
  const { account } = useWeb3React()
  const [showAssetsModal, setShowAssetsModal] = useState<boolean>(false)
  const [formattedAssets, setFormattedAssets] = useState<BasicData[]>([])
  const daysLeft = useMemo(
    () =>
      getDaysLeftByBlockNum(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock ? latestBlock.number : 0),
    [latestBlock, selectedPolicy]
  )
  const MaxPositionsToDisplay = 4

  /*************************************************************************************

    local functions

  *************************************************************************************/

  const getAssets = async () => {
    if (!selectedPolicy || !account) return
    const foundPositions = handleFilterPositions(selectedPolicy)
    setFormattedAssets(foundPositions)
  }

  const handleFilterPositions = (_selectedPolicy: Policy): BasicData[] => {
    const res: BasicData[] = []
    for (let i = 0; i < _selectedPolicy.positionAddrs.length; i++) {
      res.push({
        name: _selectedPolicy.positionNames[i],
        address: _selectedPolicy.positionAddrs[i],
      })
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
    // assets modal not in use
    getAssets()
  }, [selectedPolicy])

  return (
    <Fragment>
      <AssetsModal
        closeModal={closeModal}
        isOpen={showAssetsModal}
        assets={formattedAssets}
        modalTitle={`Covered Assets (${formattedAssets.length})`}
      />
      {width > BKPT_3 ? (
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle t3>Policy ID</BoxItemTitle>
            <Text t2 nowrap>
              {selectedPolicy?.policyId}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>Days to expiration</BoxItemTitle>
            <Text t2 nowrap>
              {daysLeft}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>Cover Amount</BoxItemTitle>
            <Text t2 nowrap>
              {selectedPolicy?.coverAmount
                ? truncateValue(formatUnits(selectedPolicy.coverAmount, activeNetwork.nativeCurrency.decimals))
                : 0}{' '}
              {activeNetwork.nativeCurrency.symbol}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle t3>Position Amount</BoxItemTitle>
            <Text t2 nowrap>
              {appraisal.gt(ZERO) ? (
                `${truncateValue(formatUnits(appraisal, activeNetwork.nativeCurrency.decimals) || 0)} ${
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
          <Flex stretch between mb={10}>
            <Text t4>Policy ID:</Text>
            <Text bold t3>
              {selectedPolicy?.policyId}
            </Text>
          </Flex>
          <Flex stretch between mb={10}>
            <Text t4>Days to expiration:</Text>

            <Text bold t3>
              {daysLeft}
            </Text>
          </Flex>
          <Flex stretch between mb={10}>
            <Text t4>Cover Amount:</Text>
            <Text bold t3>
              {selectedPolicy?.coverAmount
                ? truncateValue(formatUnits(selectedPolicy.coverAmount, activeNetwork.nativeCurrency.decimals))
                : 0}{' '}
              {activeNetwork.nativeCurrency.symbol}
            </Text>
          </Flex>
          <Flex stretch between mb={10}>
            <Text t4>Position Amount:</Text>

            <Text bold t3>
              {appraisal.gt(ZERO) ? (
                `${truncateValue(formatUnits(appraisal, activeNetwork.nativeCurrency.decimals) || 0)} ${
                  activeNetwork.nativeCurrency.symbol
                }`
              ) : (
                <Loader width={10} height={10} />
              )}{' '}
            </Text>
          </Flex>
        </Card>
      )}
      <HeroContainer height={width > BKPT_3 ? 150 : 200}>
        {width > BKPT_3 ? (
          <Flex>
            <DeFiAsset style={{ flexDirection: 'column' }}>
              <DeFiAssetImage width={60} height={60}>
                <img
                  src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`}
                  alt={selectedPolicy?.productName}
                />
              </DeFiAssetImage>
              <TextSpan t2>{selectedPolicy?.productName}</TextSpan>
            </DeFiAsset>
            <Flex center>
              {selectedPolicy?.positionNames.length == 0 && <Loader width={10} height={10} />}
              {selectedPolicy?.positionNames.slice(0, MaxPositionsToDisplay).map((name: string) => (
                <Flex col style={{ alignItems: 'center' }} key={name}>
                  <DeFiAssetImage noborder width={45} height={45}>
                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                  </DeFiAssetImage>
                </Flex>
              ))}
              {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > MaxPositionsToDisplay && (
                <StyledDots size={40} />
              )}
            </Flex>
          </Flex>
        ) : (
          // mobile version
          <Flex col>
            <Flex justifyCenter mt={10} mb={10}>
              <Flex col>
                <DeFiAsset style={{ flexDirection: 'column' }}>
                  <DeFiAssetImage width={60} height={60}>
                    <img
                      src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`}
                      alt={selectedPolicy?.productName}
                    />
                  </DeFiAssetImage>
                  <TextSpan t2>{selectedPolicy?.productName}</TextSpan>
                </DeFiAsset>
              </Flex>
            </Flex>
            <Flex justifyCenter>
              {selectedPolicy?.positionNames.length == 0 && <Loader width={10} height={10} />}
              {selectedPolicy?.positionNames.slice(0, MaxPositionsToDisplay).map((name: string) => (
                <Flex col key={name}>
                  <DeFiAssetImage noborder width={45} height={45}>
                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                  </DeFiAssetImage>
                </Flex>
              ))}
              {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > MaxPositionsToDisplay && (
                <StyledDots size={40} />
              )}
            </Flex>
          </Flex>
        )}
        {selectedPolicy?.positionNames && selectedPolicy?.positionNames.length > MaxPositionsToDisplay && (
          <ButtonWrapper style={{ width: '100%' }}>
            <Button widthP={100} onClick={() => setShowAssetsModal(true)}>
              View your covered positions
            </Button>
          </ButtonWrapper>
        )}
      </HeroContainer>
      <HorizRule mb={20} />
    </Fragment>
  )
}
