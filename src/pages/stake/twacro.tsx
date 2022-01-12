import React from 'react'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import tw from 'twin.macro'
import Twiv from './components/Twiv'
import { Tab } from './types/Tab'
import { Version } from './types/Version'
import Switchers from './sections/Switchers'
import V2Form from './sections/V2Form'
/*
 Components
 */

export default function Home(): JSX.Element {
  const [version, setVersion] = useState(Version.v2)
  const [tab, setTab] = useState(Tab.staking)
  // const inputRef = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('cickity click')
    // if (inputRef.current && inputRef.current.value) {
    //   alert(`Submitting ${inputRef.current.value}`);
    // }
  }
  // inputValue and rangeValue for staking, unstaking and locking
  const [stakingInputValue, setStakingInputValue] = useState('')
  const [stakingRangeValue, setStakingRangeValue] = useState('')
  const [unstakingInputValue, setUnstakingInputValue] = useState('')
  const [unstakingRangeValue, setUnstakingRangeValue] = useState('')
  const [lockingInputValue, setLockingInputValue] = useState('')
  const [lockingRangeValue, setLockingRangeValue] = useState('')

  // simplification utilities
  // prettier-ignore
  const [inputValue, setInputValue, rangeValue, setRangeValue] = useMemo(() => tab === Tab.difference ? [undefined, () => {""}, undefined, () => {""}] : ({
    [Tab.staking]: [stakingInputValue, setStakingInputValue, stakingRangeValue, setStakingRangeValue],
    [Tab.unstaking]: [unstakingInputValue, setUnstakingInputValue, unstakingRangeValue, setUnstakingRangeValue],
    [Tab.locking]: [lockingInputValue, setLockingInputValue, lockingRangeValue, setLockingRangeValue],
  }[tab] as [string, Dispatch<SetStateAction<string>>, string, Dispatch<SetStateAction<string>>]),
  [tab, stakingInputValue, stakingRangeValue, unstakingInputValue, unstakingRangeValue, lockingInputValue, lockingRangeValue]);

  // user current staked and unstaked amounts, and locking time
  const [stakedAmount /*, setStakedAmount*/] = useState(552)
  const [unstakedAmount /*, setUnstakedAmount*/] = useState(0)
  const [lockedDays, setLockedDays] = useState(157)
  // xsolace price in solace
  const [xSolacePrice /*, setXSolacePrice */] = useState(1.5)
  const maxDaysLocked = 1461

  // prettier-ignore
  const setMax = useMemo(() => Tab.difference === tab ? () => undefined :  ({
      [Tab.staking]: () => (setRangeValue("100"), setInputValue(unstakedAmount.toString())),
      [Tab.unstaking]: () => (setRangeValue("100"), setInputValue(stakedAmount.toString())),
      [Tab.locking]: () => (setRangeValue("100"), setInputValue(maxDaysLocked.toString())),
    }[tab] as () => void) ,
    [tab, stakedAmount, unstakedAmount, maxDaysLocked, setInputValue, setRangeValue]
  );

  return (
    <Twiv css={tw`font-sans text-text-secondary`}>
      <Twiv css={tw`bg-bg-secondary min-h-screen px-1 lg:px-10 py-10`}>
        {/* select between v1 and v2 */}
        <Switchers
          tab={tab}
          setTab={setTab}
          version={version}
          lockedDays={lockedDays}
          setLockedDays={setLockedDays}
          setVersion={setVersion}
        />
        {tab !== Tab.difference && (
          <V2Form
            tab={tab}
            stakedAmount={stakedAmount}
            unstakedAmount={unstakedAmount}
            xSolacePrice={xSolacePrice}
            onSubmit={onSubmit}
            inputValue={inputValue}
            setMax={setMax}
            lockedDays={lockedDays}
            inputOnChange={(e) => {
              // 1. validate input (blocked till main project integration)
              // 2. update input value state
              setInputValue(e.target.value)
              // 3. update range value state (as percentage string between 0 and 100)
              setRangeValue(
                {
                  [Tab.staking]: String((Number(inputValue) * 100) / unstakedAmount),
                  [Tab.unstaking]: String((Number(inputValue) * 100) / stakedAmount),
                  [Tab.locking]: String((Number(inputValue) * 100) / maxDaysLocked),
                }[tab]
              )
            }}
            rangeValue={rangeValue ?? '0'}
            rangeOnChange={(e) => {
              // 1. validate input (blocked till main project integration)
              // 2. update input value state (as percentage string between 0 and 100)
              // 3. update range value state

              setRangeValue(e.target.value)
              setTimeout(() => console.log({ targetValue: e.target.value, rangeValue }), 0)
              setInputValue(
                {
                  [Tab.staking]: String((Number(e.target.value) * unstakedAmount) / 100),
                  [Tab.unstaking]: String((Number(e.target.value) * stakedAmount) / 100),
                  [Tab.locking]: String((Number(e.target.value) * maxDaysLocked) / 100),
                }[tab]
              )
            }}
          />
        )}
      </Twiv>
    </Twiv>
  )
}
