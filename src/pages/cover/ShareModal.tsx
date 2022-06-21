import React, { useEffect } from 'react'
import { Flex, Grid } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useCoverageContext } from './CoverageContext'
import { useGeneral } from '../../context/GeneralManager'
import { CardTemplate, SmallCardTemplate, ThinCardTemplate2 } from '../../components/atoms/Card/CardTemplate'
import { Button } from '../../components/atoms/Button'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { StyledCopy, StyledShare } from '../../components/atoms/Icon'
import useReferralApi from '../../hooks/api/useReferralApi'
import useCopyClipboard from '../../hooks/internal/useCopyToClipboard'

export default function ShareModal() {
  const { intrface } = useCoverageContext()
  const { handleShowShareReferralModal } = intrface
  const { appTheme } = useGeneral()
  const [browserSupportsShare, setBrowserSupportsShare] = React.useState(false)
  const { userReferralCode } = useReferralApi()
  const [isCopied, setCopied] = useCopyClipboard()

  useEffect(() => {
    if ((window as { navigator?: { share?: any } }).navigator?.share) {
      setBrowserSupportsShare(true)
    }
  }, [])

  return (
    <Flex col stretch style={{ overflow: 'hidden' }}>
      <Flex shadow stretch col px={20} pb={20}>
        <Flex py={18} itemsCenter between bgSecondary>
          <Text t1s mont semibold>
            Invite friends
          </Text>
          <Flex onClick={() => handleShowShareReferralModal(false)}>
            <ModalCloseButton lightColor={appTheme == 'dark'} />
          </Flex>
        </Flex>
        <Text info t3s semibold style={{ lineHeight: '27.6px' }}>
          Earn $10 in policy balance, and your friend can get $10 more
        </Text>
        <Text t4s mt={5} style={{ lineHeight: '20.7px' }}>
          {"You'll both get rewarded when your friend activates their policy"}
        </Text>
        <Text mt={12} semibold t5s>
          Share your link
        </Text>
        <Flex gap={12} mt={8}>
          <Flex
            bgRaised
            button
            nohover
            separator
            rounded={12}
            py={16}
            itemsCenter
            flex1
            style={{ cursor: 'default', userSelect: 'none' }}
          >
            solace.fi...{userReferralCode ?? 'you have no ref code'}
          </Flex>
          <Button
            techygradient={!isCopied}
            success={isCopied}
            noborder
            secondary
            width={141}
            onClick={() => setCopied(`${(window as any).location.href}?rc=${userReferralCode}`)}
          >
            {!isCopied ? 'Copy link' : 'Link copied'}
          </Button>
        </Flex>
      </Flex>
      <Flex mt={20} px={20} col gap={12}>
        <Text mont t3s semibold>
          More ways to share
        </Text>

        <Flex gap={12}>
          <a
            href={`https://t.me/share/url?url=${
              (window as any).location.href
            }?rc=${userReferralCode}&text=Use my referral code to get $10 in Solace Portfolio Insurance!`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1 }}
          >
            <Flex
              bgRaised
              button
              separator
              rounded={12}
              itemsCenter
              justifyCenter
              flex1
              style={{ userSelect: 'none', height: '103px' }}
            >
              Telegram
            </Flex>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Use my referral code to get $10 in Solace Portfolio Insurance!&url=${
              (window as any).location.href
            }?rc=${userReferralCode}&hashtags=Solace`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1 }}
          >
            <Flex
              bgRaised
              button
              separator
              rounded={12}
              itemsCenter
              justifyCenter
              flex1
              style={{ userSelect: 'none', height: '103px' }}
            >
              Twitter
            </Flex>
          </a>
        </Flex>
        {browserSupportsShare && (
          <Flex
            bgRaised
            button
            separator
            rounded={12}
            itemsCenter
            justifyCenter
            flex1
            style={{ userSelect: 'none', minHeight: '103px' }}
            onClick={() => {
              window.navigator.share({
                title: 'Use my referral code to get $10 in Solace Portfolio Insurance!',
                text: 'Use my referral code to get $10 in Solace Portfolio Insurance!',
                url: `${(window as any).location.href}?rc=${userReferralCode}`,
              })
            }}
          >
            Share
          </Flex>
        )}
        {!userReferralCode && (
          <ThinCardTemplate2
            icon={<StyledCopy width={12} height={12} />}
            value1="Your referral code:"
            value2={userReferralCode ?? 'none yet'}
            info
            copy
          />
        )}
      </Flex>
    </Flex>
  )
}
