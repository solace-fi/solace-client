import React, { Dispatch, SetStateAction } from 'react'

import Twan from '../components/Twan'
import Twiv from '../components/Twiv'
import { Tab } from '../types/Tab'
import { StakingVersion } from '../types/Version'
export default function Switchers({
  tab,
  setTab,
  version,
  setVersion,
}: {
  tab: Tab
  setTab: Dispatch<SetStateAction<Tab>>
  version: StakingVersion
  setVersion: Dispatch<SetStateAction<StakingVersion>>
}): JSX.Element {
  return (
    <>
      {/* <Twiv css={`flex justify-between items-center mb-5`}>
        <Twiv css={`text-xl font-semibold select-none`}>
          <Twan css={`text-gray-600`}>Version: </Twan>
          <Twan
            css={`
              text-gray-700 cursor-pointer underline
              ${version === StakingVersion.v1 ? 'text-blue-500' : 'text-gray-500'}
            `}
            onClick={() => setVersion(StakingVersion.v1)}
          >
            v1
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={`
              text-gray-700 cursor-pointer underline
              ${version === StakingVersion.v2 ? 'text-blue-500' : 'text-gray-500'}
            `}
            onClick={() => setVersion(StakingVersion.v2)}
          >
            v2
          </Twan>
        </Twiv>
      </Twiv> */}
      <Twiv css={`flex justify-between items-center mb-5`}>
        <Twiv css={`text-xl font-semibold select-none`}>
          <Twan css={`text-gray-600`}>Tab: </Twan>
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.DEPOSIT ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.DEPOSIT)}
          >
            Staking
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.WITHDRAW ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.WITHDRAW)}
          >
            Unstaking
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.LOCK ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.LOCK)}
          >
            Locking
          </Twan>
        </Twiv>
      </Twiv>
    </>
  )
}
