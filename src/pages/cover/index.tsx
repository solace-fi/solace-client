import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'
import { Box } from '../../components/atoms/Box'
import { Button } from '../../components/atoms/Button'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content, Flex, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { useNetwork } from '../../context/NetworkManager'
import CoverageManager, { useCoverageContext } from './CoverageContext'
import { PortfolioWindow } from './PortfolioWindow'
import { PolicyContent } from './PolicyContent'

const CoverageContent = () => {
  return (
    <div
      style={{
        gridTemplateColumns: '2fr 1fr',
        display: 'grid',
        position: 'relative',
        gap: '15px',
      }}
    >
      <CoveragePage />
      <PortfolioWindow show={true} />
    </div>
  )
}

function Cover(): JSX.Element {
  return (
    <CoverageManager>
      <CoverageContent />
    </CoverageManager>
  )
}

const CoveragePage = (): JSX.Element => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { styles, intrface } = useCoverageContext()
  const { handleShowPortfolio } = intrface
  const { gradientStyle } = styles
  const canShowCoverageV3 = useMemo(() => !activeNetwork.config.restrictedFeatures.noCoverageV3, [
    activeNetwork.config.restrictedFeatures.noCoverageV3,
  ])

  return (
    <>
      {canShowCoverageV3 && account ? (
        <PolicyContent />
      ) : account ? (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              This dashboard is not supported on this network.
            </Text>
          </Box>
          <Flex justifyCenter>
            <HeroContainer>
              <Button {...gradientStyle} secondary noborder p={20} onClick={() => handleShowPortfolio(true)}>
                <Text t2>Open Portfolio Editor</Text>
              </Button>
            </HeroContainer>
          </Flex>
        </Content>
      ) : (
        <PleaseConnectWallet />
      )}
    </>
  )
}

export default Cover
