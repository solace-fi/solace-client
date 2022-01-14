import React, { Dispatch, SetStateAction } from 'react'

import Twan from '../components/Twan'
import Twiv from '../components/Twiv'
import { Tab } from '../types/Tab'
import { Version } from '../types/Version'
export default function Switchers({
  tab,
  setTab,
  version,
  setVersion,
  lockedDays,
  setLockedDays,
}: {
  tab: Tab
  setTab: Dispatch<SetStateAction<Tab>>
  version: Version
  setVersion: Dispatch<SetStateAction<Version>>
  lockedDays: number
  setLockedDays: Dispatch<SetStateAction<number>>
}): JSX.Element {
  const defaultLockedDays = 157
  const noLockedDays = 0
  const onOffLockedDays = () => setLockedDays(lockedDays === noLockedDays ? defaultLockedDays : noLockedDays)

  return (
    <>
      {/* <Twiv css={`flex justify-between items-center mb-5`}>
        <Twiv css={`text-xl font-semibold select-none`}>
          <Twan css={`text-gray-600`}>Version: </Twan>
          <Twan
            css={`
              text-gray-700 cursor-pointer underline
              ${version === Version.v1 ? 'text-blue-500' : 'text-gray-500'}
            `}
            onClick={() => setVersion(Version.v1)}
          >
            v1
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={`
              text-gray-700 cursor-pointer underline
              ${version === Version.v2 ? 'text-blue-500' : 'text-gray-500'}
            `}
            onClick={() => setVersion(Version.v2)}
          >
            v2
          </Twan>
        </Twiv>
      </Twiv> */}
      <Twiv css={`flex justify-between items-center mb-5`}>
        <Twiv css={`text-xl font-semibold select-none`}>
          <Twan css={`text-gray-600`}>Tab: </Twan>
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.staking ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.staking)}
          >
            Staking
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.unstaking ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.unstaking)}
          >
            Unstaking
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={[`text-gray-700 cursor-pointer underline`, tab === Tab.locking ? `text-blue-500` : `text-gray-500`]}
            onClick={() => setTab(Tab.locking)}
          >
            Locking
          </Twan>
        </Twiv>
      </Twiv>

      <Twiv css={`flex justify-between items-center mb-5`}>
        <Twiv css={`text-xl font-semibold select-none`}>
          <Twan css={`text-gray-600`}>Locking: </Twan>
          <Twan
            css={[
              `text-gray-700 cursor-pointer underline`,
              lockedDays === defaultLockedDays ? `text-blue-500` : `text-gray-500`,
            ]}
            onClick={onOffLockedDays}
          >
            On
          </Twan>{' '}
          <Twan css={`text-gray-600`}>/</Twan>{' '}
          <Twan
            css={[
              `text-gray-700 cursor-pointer underline`,
              lockedDays === noLockedDays ? `text-blue-500` : `text-gray-500`,
            ]}
            onClick={onOffLockedDays}
          >
            Off
          </Twan>
        </Twiv>
      </Twiv>
    </>
  )
}