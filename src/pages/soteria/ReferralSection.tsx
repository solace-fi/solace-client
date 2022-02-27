import React, { useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
import { Button } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { Input } from '../../components/atoms/Input'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { shortenAddress } from '../../utils/formatting'
import { useNetwork } from '../../context/NetworkManager'
import { useContracts } from '../../context/ContractsManager'
import { Text } from '../../components/atoms/Typography'
import { CopyButton } from '../../components/molecules/CopyButton'
import { Card } from '.'

export function ReferralSection({
  referralCode,
  referralChecks,
  setReferralCode,
  userCanRefer,
}: {
  referralCode: string | undefined
  referralChecks: {
    codeIsUsable: boolean
    codeIsValid: boolean
    referrerIsActive: boolean
    checkingReferral: boolean
    referrerIsOther: boolean
  }
  setReferralCode: (referralCode: string | undefined) => void
  userCanRefer: boolean
}): JSX.Element {
  const { keyContracts } = useContracts()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()
  const [formReferralCode, setFormReferralCode] = useState(referralCode)
  const [generatedReferralCode, setGeneratedReferralCode] = useState('')

  const getReferralCode = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum || !solaceCoverProduct) return
    const domainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]

    const msgParams = JSON.stringify({
      domain: {
        name: 'Solace.fi-SolaceCoverProduct',
        version: '1',
        chainId: activeNetwork.chainId,
        verifyingContract: solaceCoverProduct.address,
      },

      message: {
        version: 1,
      },

      primaryType: 'SolaceReferral',

      types: {
        EIP712Domain: domainType,
        SolaceReferral: [{ name: 'version', type: 'uint256' }],
      },
    })

    ethereum
      .request({
        method: 'eth_signTypedData_v4',
        params: [ethereum.selectedAddress, msgParams],
      })
      .then((code: any) => {
        let code_ = String(code)
        if (code_.substring(code_.length - 2, code_.length) == '00') code_ = code_.substring(0, code_.length - 2) + '1b'
        if (code_.substring(code_.length - 2, code_.length) == '01') code_ = code_.substring(0, code_.length - 2) + '1c'
        setGeneratedReferralCode(code_)
      })
      .catch((error: any) => console.log(error))
  }

  return (
    <Card normous horiz>
      <Flex
        stretch
        col
        style={{
          width: '100%',
        }}
        gap={userCanRefer ? 40 : 0}
      >
        <Flex between itemsCenter>
          <Text t2 bold techygradient>
            Bonuses
          </Text>
          <StyledTooltip
            id={'coverage-price'}
            tip={'You can use a referral code to claim a bonus, or share your own code with other users'}
          >
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        <Flex col flex1 gap={40} stretch justifyCenter>
          {userCanRefer && (
            <Flex col gap={10} stretch>
              <Text t4s>
                Give bonuses to users who get coverage via your referral link while you are covered (You&apos;ll get $50
                when your referral code is used) :
              </Text>
              {generatedReferralCode.length > 0 ? (
                <>
                  <Flex
                    p={5}
                    style={{
                      alignItems: 'flex-end',
                    }}
                  >
                    <Input
                      t4s
                      bold
                      techygradient
                      widthP={100}
                      readOnly
                      value={shortenAddress(generatedReferralCode)}
                      textAlignCenter
                    />
                  </Flex>
                  <CopyButton widthP={100} info toCopy={generatedReferralCode} objectName={'Code'} />
                  <CopyButton
                    widthP={100}
                    info
                    toCopy={`${(window as any).location.href}?rc=${generatedReferralCode}`}
                    objectName={'Link'}
                  />
                </>
              ) : (
                <Button info onClick={getReferralCode}>
                  Get My Code
                </Button>
              )}
            </Flex>
          )}
          <Flex col gap={10} stretch>
            <Text t4s>
              <Text t4s inline bold techygradient>
                Got a referral code?
              </Text>{' '}
              Enter here to claim $50 bonus credit when you{' '}
              <Text t4s inline info italics>
                activate a policy
              </Text>{' '}
              <Text t4s inline>
                or
              </Text>{' '}
              <Text t4s inline info italics>
                update your coverage limit
              </Text>
              :
            </Text>
            {referralCode && formReferralCode === referralCode && !referralChecks.checkingReferral ? (
              !referralChecks.codeIsUsable ? (
                <Text t4s error bold>
                  This policy already used a referral code. Cannot be applied.
                </Text>
              ) : !referralChecks.codeIsValid ? (
                <Text t4s error bold>
                  This referral code is invalid. Cannot be applied.
                </Text>
              ) : !referralChecks.referrerIsActive ? (
                <Text t4s error bold>
                  The referrer of this code has no active policy. Cannot be applied.
                </Text>
              ) : !referralChecks.referrerIsOther ? (
                <Text t4s error bold>
                  Sorry, but you cannot use your own referral code.
                </Text>
              ) : (
                <Text t4s success bold>
                  This referral code is valid. Will be applied.
                </Text>
              )
            ) : null}
            <GenericInputSection
              onChange={(e) => setFormReferralCode(e.target.value)}
              value={formReferralCode}
              buttonDisabled={
                referralCode != undefined && formReferralCode != undefined && formReferralCode === referralCode
              }
              displayIconOnMobile
              placeholder={'Enter your referral code'}
              buttonOnClick={() => setReferralCode(formReferralCode)}
              buttonText="Check"
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
