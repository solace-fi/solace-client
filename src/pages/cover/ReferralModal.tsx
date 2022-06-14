import React from 'react'
import { Flex, Grid } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useCoverageContext } from './CoverageContext'
import { useGeneral } from '../../context/GeneralManager'
import { utils } from 'ethers'
import { CardTemplate, SmallCardTemplate } from '../../components/atoms/Card/CardTemplate'
import { StyledExport, StyledClose, StyledCopy } from '../../components/atoms/Icon'
import { truncateValue } from '../../utils/formatting'

export default function ReferralModal(): JSX.Element {
  const { intrface } = useCoverageContext()
  const { handleShowReferralModal } = intrface
  const { appTheme } = useGeneral()

  return (
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative', overflow: 'hidden' }}>
      <Flex py={18} itemsCenter between px={20} zIndex={3} bgSecondary>
        <Text t1s mont semibold>
          Referrals
        </Text>
        <Flex onClick={() => handleShowReferralModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>

      <Flex shadow pb={20}>
        <Grid
          columns={2}
          gap={12}
          style={{
            margin: '0 20px',
          }}
        >
          <CardTemplate title="People you've referred">{`${truncateValue(123, 2)}`}</CardTemplate>
          <CardTemplate title="Referral Rewards" hasIcon onClick={() => handleShowReferralModal(true)}>
            {`$${truncateValue(utils.formatUnits(123), 2)}`}{' '}
            <Text success inline>
              (+$83)
            </Text>
          </CardTemplate>
          <CardTemplate techy title="Your referral code">
            <Text techygradient>A1fgg1X</Text>
          </CardTemplate>
          <Flex col gap={12}>
            <SmallCardTemplate
              icon={<StyledCopy height={12} width={12} />}
              value={`Copy referral code`}
              techy
              onClick={() => alert('copy code')}
              // onClick={() => handleEnteredCoverLimit(coverageLimit)}
            />
            <SmallCardTemplate
              icon={<StyledCopy height={12} width={12} />}
              value={`Copy referral link`}
              info
              onClick={() => alert('copy link')}
              // onClick={() => handleSimPortfolio(undefined)}
            />
          </Flex>
        </Grid>
      </Flex>
    </Flex>
  )
}
