import React from 'react'
import { Flex } from '../../components/atoms/Layout'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { CoverageLimitSelector2 } from '../soteria/CoverageLimitSelector'
import { Text } from '../../components/atoms/Typography'
import { useCoverageContext } from './CoverageContext'
import { ButtonWrapper, Button } from '../../components/atoms/Button'
import { BigNumber } from 'ethers'

export const SimCoverModal = () => {
  const { appTheme } = useGeneral()
  const { intrface, portfolioKit, input, dropdowns, styles, policy } = useCoverageContext()
  const { gradientStyle, bigButtonStyle } = styles
  const { handleShowSimCoverModal, transactionLoading, handleTransactionLoading } = intrface
  const { simPortfolio, curPortfolio } = portfolioKit
  const { handleSimCoverLimit } = input

  const [coverageLimit, setCoverageLimit] = React.useState<BigNumber>(BigNumber.from(0))

  const hijackedHandleSimCoverLimit = (value: BigNumber) => {
    setCoverageLimit(value)
    handleSimCoverLimit(value)
  }

  return (
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative' }} justifyCenter>
      <Flex
        itemsCenter
        justifyCenter
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '50px',
          width: '50px',
        }}
      >
        <Flex onClick={() => handleShowSimCoverModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex justifyCenter mb={4}>
        <Text big3 mont semibold style={{ lineHeight: '29.26px' }}>
          Simulated Cover Limit
        </Text>
      </Flex>
      <CoverageLimitSelector2
        portfolioScore={simPortfolio ?? curPortfolio}
        setNewCoverageLimit={hijackedHandleSimCoverLimit}
      />
      <ButtonWrapper>
        <Button
          {...gradientStyle}
          {...bigButtonStyle}
          onClick={() => {
            handleSimCoverLimit(coverageLimit)
            handleShowSimCoverModal(false)
          }}
          secondary
          noborder
        >
          Save
        </Button>
      </ButtonWrapper>
    </Flex>
  )
}
