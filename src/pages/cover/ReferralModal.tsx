import React from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useCoverageContext } from './CoverageContext'
import { useGeneral } from '../../context/GeneralManager'
import { BigNumber } from 'ethers'
import { CardTemplate, ThinCardTemplate2 } from '../../components/atoms/Card/CardTemplate'
import { StyledShare } from '../../components/atoms/Icon'
import { truncateValue } from '../../utils/formatting'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { ButtonAppearance } from '../../components/atoms/Button'
import { LoaderText } from '../../components/molecules/LoaderText'

export default function ReferralModal(): JSX.Element {
  const { intrface, styles, policy, referral } = useCoverageContext()
  const { policyId } = policy
  const hasPolicy = !policyId?.eq(BigNumber.from(0))
  const { handleShowReferralModal, handleShowShareReferralModal } = intrface
  const { appTheme } = useGeneral()
  const [code, setCode] = React.useState<string>('')
  const { gradientStyle } = styles
  const {
    appliedReferralCode,
    earnedAmount,
    userReferralCode,
    cookieReferralCode,
    cookieCodeUsable,
    handleCookieReferralCode,
  } = referral

  return (
    <Flex col style={{ height: 'calc(100vh - 170px)' }}>
      <Flex py={18} itemsCenter between px={20} zIndex={3} bgSecondary>
        <Text t1s mont semibold>
          Referrals
        </Text>
        <Flex onClick={() => handleShowReferralModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      {userReferralCode && (
        <Flex col pb={20} px={20} gap={12}>
          {/* <Grid columns={2} gap={12}> */}
          {/* <CardTemplate title="People you've referred">{referredCount ?? 0}</CardTemplate> */}
          <CardTemplate title="Earned Rewards">${truncateValue(earnedAmount ?? 0, 2)}</CardTemplate>
          {/* </Grid> */}
          <ThinCardTemplate2
            icon={<StyledShare width={12} height={12} />}
            value1="Your referral code:"
            value2={userReferralCode}
            info
            onClick={() => handleShowShareReferralModal(true)}
          />
        </Flex>
      )}
      <Flex mt={20} mx={37} col>
        <Text t3 info bold>
          About {!hasPolicy ? 'referral' : 'promo'} codes:
        </Text>
        <ul>
          {!hasPolicy ? (
            <li>
              <Text t5s info>
                You can only apply one referral code per account.
              </Text>
            </li>
          ) : (
            <li>
              <Text t5s info>
                You can apply multiple unique promo codes per account.
              </Text>
            </li>
          )}
          <li>
            <Text t5s info>
              You will not be able to edit/remove it afterwards.
            </Text>
          </li>
          <li>
            <Text t5s info>
              The earned amount cannot be withdrawn.
            </Text>
          </li>
          <li>
            <Text t5s info>
              The earned amount will be consumed as balance for your policy.
            </Text>
          </li>
        </ul>
        {!hasPolicy ? (
          <>
            <Flex mt={12} gap={5} col>
              <Text t5s semibold>
                Apply a {!hasPolicy ? 'referral' : 'promo'} code to your policy
              </Text>
              <GenericInputSection
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={!appliedReferralCode && cookieReferralCode ? cookieReferralCode : 'Enter code'}
                h={52}
              />
              {cookieReferralCode && !appliedReferralCode && cookieCodeUsable && (
                <>
                  <Text t4 success textAlignCenter>
                    The current active referral code is valid:{' '}
                    <TextSpan bold>
                      {cookieReferralCode.length > 10
                        ? `${cookieReferralCode.substring(0, 10)}...`
                        : cookieReferralCode}
                    </TextSpan>
                  </Text>
                  <Text t5s success textAlignCenter>
                    You&apos;ll earn $10 upon purchasing a policy.
                  </Text>
                </>
              )}
              {cookieReferralCode && !appliedReferralCode && cookieCodeUsable == false && (
                <>
                  <Text t4 error textAlignCenter>
                    The current active referral code is invalid:{' '}
                    <TextSpan bold>
                      {cookieReferralCode.length > 10
                        ? `${cookieReferralCode.substring(0, 10)}...`
                        : cookieReferralCode}
                    </TextSpan>
                  </Text>
                  <Text t5s error textAlignCenter>
                    Please use another referral code.
                  </Text>
                </>
              )}
              {cookieCodeUsable == undefined && (
                <LoaderText loaderWidth={100} loaderHeight={100} width={100} text={'Checking code'} />
              )}
            </Flex>
            <ButtonAppearance
              secondary
              techygradient={code !== cookieReferralCode && code !== ''}
              disabled={code === '' || code === cookieReferralCode}
              noborder
              onClick={async () => {
                handleCookieReferralCode(code)
              }}
              mt={12}
              pt={16}
              pb={16}
              {...gradientStyle}
            >
              <Text>Check code</Text>
            </ButtonAppearance>
            {cookieReferralCode && code == cookieReferralCode && (
              <ButtonAppearance
                onClick={async () => {
                  handleCookieReferralCode(undefined)
                  setCode('')
                }}
                mt={12}
                pt={16}
                pb={16}
                {...gradientStyle}
              >
                <Text>Clear</Text>
              </ButtonAppearance>
            )}
          </>
        ) : (
          <Text t2 semibold textAlignCenter>
            Promo codes are coming soon!
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
