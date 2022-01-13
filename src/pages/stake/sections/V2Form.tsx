import { Tab } from '../types/Tab'
import React, { useMemo } from 'react'
import CardRange from '../components/CardRange'
import GenericInformationBox from '../components/GenericInformationBox'
import GrayBox from '../components/GrayBox'
import InformationBox from '../components/InformationBox'
import SectionLabel from '../components/SectionLabel'
import SubmitButton from '../components/SubmitButton'
import Twiv from '../components/Twiv'
import lockingBenefitsCalculator from '../utils/LockingBenefitsCalculator'
import { InfoBoxType } from '../types/InfoBoxType'
import InputSection from './InputSection'
import TopSection from './TopSection'
import styled from 'styled-components'

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
  const Styled = styled.form`
    /* ${css} */
  `
  return (
    <Styled className={css} {...props} onSubmit={onSubmit}>
      {children}
    </Styled>
  )
}

export default function V2Form({
  tab,
  staked,
  unstaked,
  lockedDays,
  locked,
  onSubmit,
  inputValue,
  inputOnChange,
  rangeValue,
  rangeOnChange,
  setMax,
}: {
  tab: Tab.staking | Tab.unstaking | Tab.locking
  staked: string
  unstaked: string
  lockedDays: number
  locked: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  inputValue: string | undefined
  inputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  rangeValue: string
  rangeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax: () => void
}): JSX.Element {
  // range max during Staking is the unstaked amount
  // during Unstaking, it's the staked amount,
  // during Locking, it's 1461 (days in 4 years)
  // const rangeMax = tab === Tab.staking ? unstakedAmount : tab === Tab.locking ? 1461 : stakedAmount;
  const { apy, multiplier } = useMemo(() => lockingBenefitsCalculator(lockedDays), [lockedDays])
  return (
    <>
      <TopSection
        staked={staked}
        unstaked={unstaked}
        locked={locked}
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
            {tab === Tab.locking && lockedDays > 0 && (
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
                  [Tab.staking]: 'Staking amount',
                  [Tab.unstaking]: 'Unstaking amount',
                  [Tab.locking]: lockedDays > 0 ? 'Extend lock time duration' : 'Lock time duration',
                }[tab]
              }
            </SectionLabel>
            <InputSection tab={tab} value={inputValue} onChange={inputOnChange} setMax={setMax} />
            {/* slider */}
            <TwFlexCol css={`mt-5 mb-10`}>
              <CardRange value={rangeValue} onChange={rangeOnChange} min="0" max="100" />
            </TwFlexCol>
            <SubmitButton
              text={
                tab === Tab.staking
                  ? 'Stake'
                  : tab === Tab.unstaking
                  ? 'Unstake'
                  : lockedDays > 0
                  ? 'Extend lock time'
                  : 'Lock'
              }
            />
          </TwFlexCol>
          {/* warning */}
          <div>
            {tab === Tab.locking && (
              <React.Fragment>
                {lockedDays > 0 && (
                  <React.Fragment>
                    <SectionLabel>Current lock benefits</SectionLabel>
                    <GenericInformationBox
                      details={[
                        {
                          title: 'Current APY',
                          body: (
                            <Twiv css={`flex space-x-2 mt-2 font-semibold`}>
                              <Twiv css={`text-[#5E5E5E] line-through`}>{2000}%</Twiv>
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
                        <Twiv css={`flex space-x-2 mt-2 font-semibold`}>
                          <Twiv css={`text-[#5E5E5E] line-through`}>{apy.toFixed(0)}%</Twiv>
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
              type={Tab.staking === tab ? InfoBoxType.warning : InfoBoxType.info}
              text="Some important notes about staking for users to see before
            staking any amount of their tokens."
            />
          </div>
        </Twiv>
      </StyledForm>
    </>
  )
}
