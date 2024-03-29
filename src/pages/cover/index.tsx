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
import { PortfolioSimulator } from './PortfolioSimulator'
import { PolicyContent } from './PolicyContent'
import { CldModal } from './CldModal'
import { SimCoverModal } from './SimCoverModal'
import { Portfolio } from './Portfolio'
import ReferralModal from './ReferralModal'
import ShareModal from './ShareModal'
import { CodeNoticeModal } from './CodeNoticeModal'
import { SGTMigrationNotification } from '../stake/organisms/NotificationBox'

const CoverageContent = () => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { styles, intrface } = useCoverageContext()
  const {
    showPortfolioModal,
    showCLDModal,
    showSimulatorModal,
    showSimCoverModal,
    showReferralModal,
    showShareReferralModal,
    handleShowSimulatorModal,
  } = intrface
  const { gradientStyle } = styles
  const canShowCoverageV3 = useMemo(() => activeNetwork.config.generalFeatures.coverageV3, [
    activeNetwork.config.generalFeatures.coverageV3,
  ])

  const _showCldModal =
    showCLDModal &&
    !showSimulatorModal &&
    !showSimCoverModal &&
    !showPortfolioModal &&
    !showReferralModal &&
    !showShareReferralModal
  const _showSimulatorModal =
    showSimulatorModal &&
    !showCLDModal &&
    !showSimCoverModal &&
    !showPortfolioModal &&
    !showReferralModal &&
    !showShareReferralModal
  const _showSimCoverModal =
    showSimulatorModal &&
    !showCLDModal &&
    showSimCoverModal &&
    !showPortfolioModal &&
    !showReferralModal &&
    !showShareReferralModal
  const _showPortfolioModal =
    showPortfolioModal &&
    !showCLDModal &&
    !showSimulatorModal &&
    !showSimCoverModal &&
    !showReferralModal &&
    !showShareReferralModal
  const _showDefault =
    !showSimulatorModal &&
    !showCLDModal &&
    !showSimCoverModal &&
    !showPortfolioModal &&
    !showReferralModal &&
    !showShareReferralModal

  const _showReferralModal =
    showReferralModal &&
    !showCLDModal &&
    !showSimulatorModal &&
    !showSimCoverModal &&
    !showPortfolioModal &&
    !showShareReferralModal

  const _showShareReferralModal =
    showShareReferralModal && !showCLDModal && !showSimulatorModal && !showSimCoverModal && !showPortfolioModal

  return (
    <>
      {canShowCoverageV3 && account ? (
        <>
          <CodeNoticeModal />
          <SGTMigrationNotification />
          <Flex justifyCenter>
            <Flex col width={450}>
              {_showCldModal && <CldModal />}
              {_showPortfolioModal && <Portfolio />}
              {_showSimulatorModal && <PortfolioSimulator />}
              {_showSimCoverModal && <SimCoverModal />}
              {_showDefault && <PolicyContent />}
              {_showReferralModal && <ReferralModal />}
              {_showShareReferralModal && <ShareModal />}
            </Flex>
          </Flex>
        </>
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
              <Button {...gradientStyle} secondary noborder p={20} onClick={() => handleShowSimulatorModal(true)}>
                <Text t2>Quote Simulator</Text>
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

function Cover(): JSX.Element {
  return (
    <CoverageManager>
      <CoverageContent />
    </CoverageManager>
  )
}
export default Cover
