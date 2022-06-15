import React from 'react'
import { Flex, Grid } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useCoverageContext } from './CoverageContext'
import { useGeneral } from '../../context/GeneralManager'
import { utils } from 'ethers'
import { CardTemplate, SmallCardTemplate, ThinCardTemplate2 } from '../../components/atoms/Card/CardTemplate'
import { StyledExport, StyledClose, StyledCopy, StyledShare } from '../../components/atoms/Icon'
import { truncateValue } from '../../utils/formatting'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { Button } from '../../components/atoms/Button'

export default function ReferralModal(): JSX.Element {
  const { intrface, styles } = useCoverageContext()
  const { handleShowReferralModal, handleShowShareReferralModal } = intrface
  const { appTheme } = useGeneral()
  const [code, setCode] = React.useState<string>('')
  const { gradientStyle } = styles

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

      <Flex col shadow pb={20} px={20} gap={12}>
        <Grid columns={2} gap={12}>
          <CardTemplate title="People you've referred">{`${truncateValue(123, 2)}`}</CardTemplate>
          <CardTemplate title="Earned by referring" hasIcon onClick={() => handleShowReferralModal(true)}>
            {`$${truncateValue(utils.formatUnits(123), 2)}`}{' '}
            {/* <Text success inline>
              (+$83)
            </Text> */}
          </CardTemplate>
          {/* <CardTemplate techy title="Your referral code">
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
          </Flex> */}
        </Grid>
        <ThinCardTemplate2
          icon={<StyledShare width={12} height={12} />}
          value1="Your referral code:"
          value2="A1g97C"
          info
          onClick={() => handleShowShareReferralModal(true)}
        />
      </Flex>
      <Flex mt={20} mx={37} col>
        <Text t5s info>
          Please note:
        </Text>
        <ul>
          <li>
            <Text t5s info>
              You can only apply this code once
            </Text>
          </li>
          <li>
            <Text t5s info>
              You will not be able to edit/remove it afterwards
            </Text>
          </li>
          <li>
            <Text t5s info>
              The earned amount cannot be withdrawn
            </Text>
          </li>
          <li>
            <Text t5s info>
              The earned amount will be consumed as balance for your policy
            </Text>
          </li>
        </ul>
        <Flex mt={12} gap={5} col>
          <Text t5s semibold>
            Apply a promo code to your policy
          </Text>
          <GenericInputSection value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
        </Flex>
        <Button
          techygradient
          secondary
          noborder
          onClick={() => alert('apply')}
          mt={12}
          pt={16}
          pb={16}
          {...gradientStyle}
        >
          <Text>Apply code</Text>
        </Button>
      </Flex>
    </Flex>
  )
}
