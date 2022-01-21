import { Tab } from '../types/Tab'
import React, { useState, useEffect, useMemo } from 'react'
import GenericInformationBox from '../components/GenericInformationBox'
import GrayBox from '../components/GrayBox'
import InformationBox from '../components/InformationBox'
import SectionLabel from '../components/SectionLabel'
import SubmitButton from '../components/SubmitButton'
import Twiv from '../components/Twiv'
import lockingBenefitsCalculator from '../utils/stake/LockingBenefitsCalculator'
import { InfoBoxType } from '../types/InfoBoxType'
import InputSection from './InputSection'
import TopSection from './TopSection'
import { StakingVersion } from '../types/Version'
import { useWallet } from '../../../context/WalletManager'
import { useSolaceBalance } from '../../../hooks/useBalance'
import { useXSLocker } from '../../../hooks/useXSLocker'

function TwFlexCol({
  children,
  className,
  css,
  ...props
}: {
  children: React.ReactNode
  className?: string
  css?: string | string[]
  props?: any
}) {
  return (
    <Twiv className={className} css={[`flex flex-col`].concat(css || [])} {...props}>
      {children}
    </Twiv>
  )
}

/* <form
onSubmit={(e) => onSubmit(e)}
className="bg-[#fff] mx-auto shadow-lg max-w-[375px] lg:max-w-[1114px] rounded-b-xl flex flex-col p-7 items-stretch overflow-hidden"
> */

function StyledForm({
  children,
  css,
  onSubmit,
  ...props
}: {
  children: React.ReactNode
  css?: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  props?: any
}) {
  return (
    <form className={css} {...props} onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export default function V2Form({
  tab,
  version,
}: {
  tab: Tab.DEPOSIT | Tab.WITHDRAW | Tab.LOCK
  version: StakingVersion
}): JSX.Element {
  // range max during Staking is the unstaked amount
  // during Unstaking, it's the staked amount,
  // during Locking, it's 1461 (days in 4 years)
  // const rangeMax = tab === Tab.DEPOSIT ? unstakedAmount : tab === Tab.LOCK ? 1461 : stakedAmount;
  const [lockedDays, setLockedDays] = useState(157)
  const { apy, multiplier } = useMemo(() => lockingBenefitsCalculator(lockedDays), [lockedDays])
  const maxDaysLocked = 1461
  // xsolace price in solace

  const solaceBalance = useSolaceBalance()
  const { account } = useWallet()
  const { getStakedBalance, getUserLockerBalances } = useXSLocker()
  const [stakedSolaceBalance, setStakedSolaceBalance] = useState<string>('0')
  const [lockedSolaceBalance, setLockedSolaceBalance] = useState<string>('0')
  const [unlockedSolaceBalance, setUnlockedSolaceBalance] = useState<string>('0')

  const [inputValue, setInputValue] = useState<string>('0')
  const [rangeValue, setRangeValue] = useState<string>('0')

  const setMax = useMemo(
    () =>
      StakingVersion.difference === version
        ? () => undefined
        : ({
            [Tab.DEPOSIT]: () => (setRangeValue('100'), setInputValue(solaceBalance)),
            [Tab.WITHDRAW]: () => (setRangeValue('100'), setInputValue(unlockedSolaceBalance)),
            [Tab.LOCK]: () => (setRangeValue('100'), setInputValue(maxDaysLocked.toString())),
          }[tab] as () => void),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, unlockedSolaceBalance, solaceBalance, maxDaysLocked, setInputValue, setRangeValue]
  )

  useEffect(() => {
    const _getUserLockerBalances = async () => {
      if (!account) return
      const balances = await getUserLockerBalances(account)
      setStakedSolaceBalance(balances.stakedBalance)
      setUnlockedSolaceBalance(balances.unlockedBalance)
      setLockedSolaceBalance(balances.lockedBalance)
    }
    _getUserLockerBalances()
  }, [account])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('clickity click')
  }

  const inputOnChange = (input: string) => {
    setInputValue(input)
    setRangeValue(input)
  }

  return (
    <>
      <TopSection
        staked={stakedSolaceBalance}
        unstaked={solaceBalance}
        locked={lockedSolaceBalance}
        isLocked={lockedDays > 0}
        lockedDays={lockedDays}
        tab={tab}
      />

      {/* underbox */}
      <StyledForm
        onSubmit={(e) => onSubmit(e)}
        css="bg-[#fff] mx-auto shadow-lg max-w-[375px] lg:max-w-[1114px] rounded-b-xl flex flex-col p-7 items-stretch overflow-hidden"
      >
        <Twiv css={`flex`}></Twiv>
        {/*  total: 359 with top part*/}
        {/* input, slider & warning */}
        <Twiv css="flex flex-col lg:flex-row space-x-0 space-y-8 lg:space-y-0 lg:space-x-5">
          {/* input/slider container */}
          <TwFlexCol>
            {tab === Tab.LOCK && lockedDays > 0 && (
              <>
                <SectionLabel>Current lock time duration</SectionLabel>
                <GrayBox>
                  <Twiv css={`h-full flex items-center`}>257 Days</Twiv>
                </GrayBox>
              </>
            )}
            {/* title */}
            <SectionLabel>
              {
                {
                  [Tab.DEPOSIT]: 'Staking amount',
                  [Tab.WITHDRAW]: 'Unstaking amount',
                  [Tab.LOCK]: lockedDays > 0 ? 'Extend lock time duration' : 'Lock time duration',
                }[tab]
              }
            </SectionLabel>
            <InputSection
              tab={tab}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={setMax}
            />
            {/* <TwFlexCol css={`mt-5 mb-10`}></TwFlexCol> */}
            <SubmitButton
              text={
                tab === Tab.DEPOSIT
                  ? 'Stake'
                  : tab === Tab.WITHDRAW
                  ? 'Unstake'
                  : lockedDays > 0
                  ? 'Extend lock time'
                  : 'Lock'
              }
            />
          </TwFlexCol>
          {/* warning */}
          <div>
            {tab === Tab.LOCK && (
              <React.Fragment>
                {lockedDays > 0 && (
                  <React.Fragment>
                    <SectionLabel>Current lock benefits</SectionLabel>
                    <GenericInformationBox
                      details={[
                        {
                          title: 'Current APY',
                          body: (
                            <Twiv css={'flex space-x-2 mt-2 font-semibold'}>
                              <Twiv css={'text-[#5E5E5E] line-through'}>{2000}%</Twiv>
                              <div>{apy.toFixed(0)}%</div>
                            </Twiv>
                          ),
                        },
                        {
                          title: 'Current multiplier',
                          body: `X${multiplier.toFixed(1)}`,
                        },
                      ]}
                    />
                  </React.Fragment>
                )}
                <SectionLabel>{lockedDays > 0 ? 'Extended lock benefits' : 'Lock benefits'}</SectionLabel>
                <GenericInformationBox
                  details={[
                    {
                      title: 'Better APY',
                      body: (
                        <Twiv css={'flex space-x-2 mt-2 font-semibold'}>
                          <Twiv css={'text-[#5E5E5E] line-through'}>{apy.toFixed(0)}%</Twiv>
                          <div>{lockingBenefitsCalculator(Number(inputValue ?? 0) + lockedDays).apy.toFixed(0)}%</div>
                        </Twiv>
                      ),
                    },
                    {
                      title: 'Returns multiplier',
                      body: `X${lockingBenefitsCalculator(Number(inputValue ?? 0)).multiplier.toFixed(1)}`,
                    },
                  ]}
                />
                {/* <LockingInformationBox strDays={inputValue} /> */}
              </React.Fragment>
            )}
            <InformationBox
              type={Tab.DEPOSIT === tab ? InfoBoxType.warning : InfoBoxType.info}
              text="Some important notes about staking for users to see before
            staking any amount of their tokens."
            />
          </div>
        </Twiv>
      </StyledForm>
    </>
  )
}
