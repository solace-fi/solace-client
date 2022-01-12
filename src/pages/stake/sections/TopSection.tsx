import { Tab } from '../types/Tab'
import { LockAlt } from '@styled-icons/boxicons-solid'
import React from 'react'
import tw from 'twin.macro'
import CardSectionValue from '../components/CardSectionValue'
import SectionLabel from '../components/SectionLabel'
import Twan from '../components/Twan'
import Twiv from '../components/Twiv'
import VerticalSeparator from '../components/VerticalSeparator'
import lockingBenefitsCalculator from '../functions/LockingBenefitsCalculator'
export default function TopSection({
  staked,
  unstaked,
  xSolacePrice,
  tab,
  isLocked,
  lockedDays,
}: // lockedDays
{
  staked: number
  unstaked: number
  xSolacePrice: number
  tab: Tab
  isLocked: boolean
  lockedDays: number
}): JSX.Element {
  return (
    <div
      className="flex flex-col lg:flex-row py-5 px-7 lg:pl-7 border-b bg-white border-util-separator space-x-0 lg:space-x-20 w-full items-center lg:items-stretch mx-auto max-w-[375px] lg:max-w-[1114px] rounded-t-xl"
      style={{
        boxShadow: '0 0px 25px 0px rgb(0 0 0 / 0.1), 0 8px 10px 0px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* gotta make the one above the child, then give it a flex-row parent on desktop (lg: and higher) and a flex-col parent on mobile. this will push apy below it */}
      <Twiv css={tw`flex items-stretch space-x-20`}>
        <Twiv css={tw`flex-shrink-0`}>
          <SectionLabel>Unstaked Balance</SectionLabel>
          <CardSectionValue annotation="SOLACE" importance={Tab.staking === tab ? 'primary' : 'secondary'}>
            {unstaked.toFixed(2)}
          </CardSectionValue>
        </Twiv>
        <div>
          <SectionLabel>
            <Twiv css={tw`flex flex-col lg:flex-row items-start lg:items-center`}>
              <div>Staked Balance</div>
              {isLocked ? (
                <Twan css={tw`ml-0 lg:ml-2 text-text-accent flex items-center mt-1 lg:mt-0`}>
                  <LockAlt className="text-text-accent h-3.5 mr-1" /> <div>{String(lockedDays)} Days</div>
                </Twan>
              ) : (
                <></>
              )}
            </Twiv>
          </SectionLabel>
          <Twiv css={tw`flex flex-col lg:flex-row w-max flex-shrink-0`}>
            <CardSectionValue annotation="SOLACE" importance={Tab.staking === tab ? 'secondary' : 'primary'}>
              {staked.toFixed(2)}
            </CardSectionValue>
            <Twiv css={tw`w-2 hidden lg:block`}>
              <CardSectionValue annotation="xSOLACE)" importance="tertiary">
                {'(' + (staked * xSolacePrice).toFixed(2)}
              </CardSectionValue>
            </Twiv>
          </Twiv>
        </div>
        <Twiv css={tw`flex flex-col lg:flex-row justify-between space-x-0 lg:space-x-20 items-center lg:items-stretch`}>
          <Twiv css={tw`hidden lg:flex items-stretch`}>
            <VerticalSeparator />
          </Twiv>
          {/* horizontal separator for mobile */}
          <Twiv css={tw`block w-64 border-b mt-5 mb-5 border-b-util-separator border-solid mx-auto lg:hidden`}>
            <Twiv css={tw`flex flex-row items-baseline space-x-1 lg:space-x-0 lg:items-start lg:flex-col`}>
              <SectionLabel>
                <div>APY</div>
              </SectionLabel>
              <CardSectionValue importance={isLocked ? 'primary' : 'secondary'}>
                {lockingBenefitsCalculator(lockedDays).apy.toFixed(0)}%
              </CardSectionValue>
            </Twiv>
          </Twiv>
        </Twiv>
      </Twiv>
    </div>
  )
}
