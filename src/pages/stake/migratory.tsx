import React from 'react'
import styled from 'styled-components'
import { InfoCircle, Clock } from '@styled-icons/bootstrap'
import { LockAlt } from '@styled-icons/boxicons-solid'
import { Dispatch, SetStateAction, useMemo, useState, ReactNode, Fragment } from 'react'

/*
 Components
 */

const StyledInput = styled.input`
  &::-webkit-range-thumb,
  &::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 0;
    background-color: #5f5df9;
    background-image: "url('/solace-token-gradient.svg')";
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    overflow: hidden;
  }
`

function isOneOf<T>(value: T, list: T[]) {
  return list.indexOf(value) > -1
}

function CardRange({
  value,
  onChange,
  min,
  max,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min: string
  max: string
}) {
  return (
    <StyledInput
      type="range"
      min={min}
      max={max}
      className="bg-gray-200 rounded-full h-2 mt-2.5"
      value={value}
      onChange={onChange}
    />
  )
}

// secondary CardSectionValue is just `font-medium mt-2`
function CardSectionValue({
  children,
  annotation,
  importance,
  className,
}: {
  children: string | React.ReactNode
  annotation?: string
  importance: 'primary' | 'secondary' | 'tertiary'
  className?: string
}) {
  /**
  secondary:
  <div className="font-semibold mt-2 leading">
    <div className="text-base">522.2</div> <span className="text-sm">SOLACE</span>
  </div> */
  const mainTextSize = isOneOf(importance, ['primary', 'secondary']) ? 'text-base' : 'text-sm'
  const annotationTextSize = isOneOf(importance, ['primary', 'secondary']) ? 'text-sm' : 'text-xs'
  return (
    <div className={`font-semibold ${className ?? ''}`}>
      <span className={mainTextSize + (importance === 'primary' ? ' text-text-accent' : '')}>{children}</span>{' '}
      {annotation && (
        <span className={'inline  ' + annotationTextSize + ' ' + (importance === 'primary' ? ' text-text-accent' : '')}>
          {annotation}
        </span>
      )}
    </div>
  )
}

const StyledInfoCircle = styled(InfoCircle)`
  /* color: red; */
`

const SectionLabel = ({
  children,
  className,
  ...props
}: {
  children: string | React.ReactNode
  className?: string
  props?: any[]
}) => (
  <div className={`font-semibold text-xs mb-2 ${className ?? ''}`} {...props}>
    {children}
  </div>
)

enum Version {
  v1,
  v2,
}

enum Tab {
  difference,
  staking,
  unstaking,
  locking,
}

const SubmitButton = ({ text }: { text: string }) => (
  <button
    className="mt-auto bg-[#5F5DF9] text-sm font-semibold text-white w-max px-5 py-1.5 rounded-xl mb-0.5 hover:bg-yellow-600 saturate-150 duration-200"
    type="submit"
  >
    {text}
  </button>
)

function InputSection({
  tab,
  value,
  onChange,
  setMax,
}: // ref,
{
  tab: Tab.staking | Tab.unstaking | Tab.locking
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax: () => void
  // ref: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex rounded-xl border border-util-separator bg-bg-secondary justify-between lg:justify-start">
      {/* icon + text */}
      <div className="hidden lg:flex rounded-l-xl border-r border-util-separator p-5 space-x-1 items-center w-max">
        {
          // switch object
          {
            [Tab.staking]: <img src={'/solace-token-gradient.svg'} className="w-5 h-5 pt-px" />,
            [Tab.unstaking]: <img src={'/xsolace-token-gradient.svg'} className="w-5 h-5 pt-px" />,
            [Tab.locking]: <Clock className="w-5 h-5 pt-px" />,
          }[tab]
        }
        <div className="font-semibold text-xs">
          {
            {
              [Tab.staking]: 'SOLACE',
              [Tab.unstaking]: 'xSOLACE',
              [Tab.locking]: 'Days',
            }[tab]
          }
        </div>
      </div>
      <input
        type="text"
        className="py-3 lg:py-5 px-5 bg-inherit outline-none rounded-xl border-util-separator lg:border-0 lg:rounded-none"
        placeholder="0 (Max 522.2)"
        value={value}
        onChange={onChange}
        // ref={ref}
      />
      <div className="p-2">
        <div
          className="py-2 px-3 lg:px-7 text-base lg:text-lg rounded-xl border border-text-secondary text-text-secondary hover:bg-blue-100 active:bg-blue-200 select-none cursor-pointer duration-150"
          onClick={setMax}
        >
          MAX
        </div>
      </div>
    </div>
  )
}

const VerticalSeparator = () => <div className="border-l border-solid border-util-separator"></div>

function separateChildren(children: React.ReactNode[]) {
  const len = children.length
  return children.map((child, i) => {
    return (
      <Fragment key={i}>
        {child}
        {i !== len - 1 && <VerticalSeparator />}
      </Fragment>
    )
  })
}

const classOrEmpty = (condition: boolean, string: string) => (condition ? string + ' ' : '')

function GrayBox({ children }: { children: React.ReactNode | string }) {
  return (
    <div className="flex bg-bg-secondary text-text-purple rounded-xl items-stretch py-3 px-6 font-medium mb-8 h-[72px]">
      {children}
    </div>
  )
}

function GenericInformationBox({
  details,
}: {
  details: {
    title: string | ReactNode
    body: string | ReactNode
  }[]
}) {
  return (
    <div className="flex bg-bg-secondary text-text-purple rounded-xl items-stretch py-3 px-6 font-medium space-x-5 mb-8">
      {separateChildren(
        details.map((detail, i) => {
          const { title, body } = detail
          return (
            <div key={i} className={classOrEmpty(details.length > 1, 'flex space-x-3')}>
              <div>
                <SectionLabel>{title}</SectionLabel>
                <div className="mt-2 font-semibold">{body}</div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
const lockingBenefitsCalculator = (days: number): { apy: number; multiplier: number } => {
  const multiplier = 1 + (days / 365) * 0.2
  const apy = multiplier * 2000
  return { apy, multiplier }
}

enum InfoBoxType {
  info,
  warning,
  error,
}

function InformationBox({ type, text }: { type: InfoBoxType; text: string }) {
  return (
    <div
      className={`flex border ${
        {
          [InfoBoxType.info]: 'border-text-accent bg-bg-accent text-text-accent',
          [InfoBoxType.warning]: 'border-text-warning text-text-warning bg-bg-warning',
          [InfoBoxType.error]: 'border-text-warning text-text-warning bg-bg-warning',
        }[type]
      } rounded-xl items-center h-20 pr-7 text-xs font-medium`}
    >
      {/* left icon */}
      <div className="flex rounded-l-xl h-full pt-5 pl-6 pr-6">
        <div>
          <StyledInfoCircle
            className={`h-5 w-5 ${
              {
                [InfoBoxType.info]: 'text-text-accent',
                [InfoBoxType.warning]: 'text-text-warning',
                [InfoBoxType.error]: 'text-text-warning',
              }[type]
            }`}
          />
        </div>
      </div>
      {/* right text */}
      <div className="leading-5">{text}</div>
    </div>
  )
}

function TopSection({
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
}) {
  return (
    <div
      className="flex flex-col lg:flex-row py-5 px-7 lg:pl-7 border-b bg-white border-util-separator space-x-0 lg:space-x-20 w-full items-center lg:items-stretch mx-auto max-w-[375px] lg:max-w-[1114px] rounded-t-xl"
      style={{
        boxShadow: '0 0px 25px 0px rgb(0 0 0 / 0.1), 0 8px 10px 0px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* gotta make the one above the child, then give it a flex-row parent on desktop (lg: and higher) and a flex-col parent on mobile. this will push apy below it */}
      <div className="flex items-stretch space-x-20">
        <div className="flex-shrink-0">
          <SectionLabel>Unstaked Balance</SectionLabel>
          <CardSectionValue annotation="SOLACE" importance={Tab.staking === tab ? 'primary' : 'secondary'}>
            {unstaked.toFixed(2)}
          </CardSectionValue>
        </div>
        <div>
          <SectionLabel>
            <div className="flex flex-col lg:flex-row items-start lg:items-center">
              <div>Staked Balance</div>
              {isLocked ? (
                <span className="ml-0 lg:ml-2 text-text-accent flex items-center mt-1 lg:mt-0">
                  <LockAlt className="text-text-accent h-3.5 mr-1" /> <div>{String(lockedDays)} Days</div>
                </span>
              ) : (
                <></>
              )}
            </div>
          </SectionLabel>
          <div className="flex flex-col lg:flex-row w-max flex-shrink-0">
            <CardSectionValue annotation="SOLACE" importance={Tab.staking === tab ? 'secondary' : 'primary'}>
              {staked.toFixed(2)}
            </CardSectionValue>
            <div className="w-2 hidden lg:block" />
            <CardSectionValue annotation="xSOLACE)" importance="tertiary">
              {'(' + (staked * xSolacePrice).toFixed(2)}
            </CardSectionValue>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-between space-x-0 lg:space-x-20 items-center lg:items-stretch">
        <div className="hidden lg:flex items-stretch">
          <VerticalSeparator />
        </div>
        {/* horizontal separator for mobile */}
        <div className="block w-64 border-b mt-5 mb-5 border-b-util-separator border-solid mx-auto lg:hidden" />
        <div className="flex flex-row items-baseline space-x-1 lg:space-x-0 lg:items-start lg:flex-col">
          <SectionLabel>
            <div>APY</div>
          </SectionLabel>
          <CardSectionValue importance={isLocked ? 'primary' : 'secondary'}>
            {lockingBenefitsCalculator(lockedDays).apy.toFixed(0)}%
          </CardSectionValue>
        </div>
      </div>
    </div>
  )
}

function Switchers({
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
}) {
  const defaultLockedDays = 157
  const noLockedDays = 0
  const onOffLockedDays = () => setLockedDays(lockedDays === noLockedDays ? defaultLockedDays : noLockedDays)

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div className="text-xl font-semibold select-none">
          <span className="text-gray-600">Version: </span>
          <span
            className={
              'text-gray-700 cursor-pointer underline ' + (version === Version.v1 ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={() => setVersion(Version.v1)}
          >
            v1
          </span>{' '}
          <span className="text-gray-600">/</span>{' '}
          <span
            className={
              'text-gray-700 cursor-pointer underline ' + (version === Version.v2 ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={() => setVersion(Version.v2)}
          >
            v2
          </span>
        </div>
      </div>
      {/* select between staking, unstaking, locking */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-xl font-semibold select-none">
          <span className="text-gray-600">Tab: </span>
          <span
            className={
              'text-gray-700 cursor-pointer underline ' + (tab === Tab.staking ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={() => setTab(Tab.staking)}
          >
            Staking
          </span>{' '}
          <span className="text-gray-600">/</span>{' '}
          <span
            className={
              'text-gray-700 cursor-pointer underline ' + (tab === Tab.unstaking ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={() => setTab(Tab.unstaking)}
          >
            Unstaking
          </span>{' '}
          <span className="text-gray-600">/</span>{' '}
          <span
            className={
              'text-gray-700 cursor-pointer underline ' + (tab === Tab.locking ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={() => setTab(Tab.locking)}
          >
            Locking
          </span>
        </div>
      </div>
      {/* select between on and off Locking */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-xl font-semibold select-none">
          <span className="text-gray-600">Locking: </span>
          <span
            className={
              'text-gray-700 cursor-pointer underline ' +
              (lockedDays === defaultLockedDays ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={onOffLockedDays}
          >
            On
          </span>{' '}
          <span className="text-gray-600">/</span>{' '}
          <span
            className={
              'text-gray-700 cursor-pointer underline ' +
              (lockedDays === noLockedDays ? 'text-blue-500' : 'text-gray-500')
            }
            onClick={onOffLockedDays}
          >
            Off
          </span>
        </div>
      </div>
    </>
  )
}

function TwFlexCol({ children, className, ...props }: { children: React.ReactNode; className?: string; props?: any }) {
  return (
    <div className={`flex flex-col ${className}`} {...props}>
      {children}
    </div>
  )
}

function V2Form({
  tab,
  stakedAmount,
  unstakedAmount,
  lockedDays,
  xSolacePrice,
  onSubmit,
  inputValue,
  inputOnChange,
  rangeValue,
  rangeOnChange,
  setMax,
}: {
  tab: Tab.staking | Tab.unstaking | Tab.locking
  stakedAmount: number
  unstakedAmount: number
  lockedDays: number
  xSolacePrice: number
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  inputValue: string | undefined
  inputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  rangeValue: string
  rangeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax: () => void
}) {
  // range max during Staking is the unstaked amount
  // during Unstaking, it's the staked amount,
  // during Locking, it's 1461 (days in 4 years)
  // const rangeMax = tab === Tab.staking ? unstakedAmount : tab === Tab.locking ? 1461 : stakedAmount;
  const { apy, multiplier } = lockingBenefitsCalculator(lockedDays)
  return (
    <>
      <TopSection
        staked={stakedAmount}
        unstaked={unstakedAmount}
        xSolacePrice={xSolacePrice}
        isLocked={lockedDays > 0}
        lockedDays={lockedDays}
        tab={tab}
      />

      {/* underbox */}
      <form
        onSubmit={(e) => onSubmit(e)}
        className="bg-bg-primary mx-auto shadow-lg max-w-[375px] lg:max-w-[1114px] rounded-b-xl flex flex-col p-7 items-stretch overflow-hidden"
      >
        <div className="flex"></div>
        {/*  total: 359 with top part*/}
        {/* input, slider & warning */}
        <div className="flex flex-col lg:flex-row space-x-0 space-y-8 lg:space-y-0 lg:space-x-5">
          {/* input/slider container */}
          <TwFlexCol>
            {tab === Tab.locking && lockedDays > 0 && (
              <>
                <SectionLabel>Current lock time duration</SectionLabel>
                <GrayBox>
                  <div className="h-full flex items-center">257 Days</div>
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
            <TwFlexCol className="mt-5 mb-10">
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
              <>
                {lockedDays > 0 && (
                  <>
                    <SectionLabel>Current lock benefits</SectionLabel>
                    <GenericInformationBox
                      details={[
                        {
                          title: 'Current APY',
                          body: (
                            <div className="flex space-x-2 mt-2 font-semibold">
                              <div className="text-text-secondary line-through">{2000}%</div>
                              <div>{apy.toFixed(0)}%</div>
                            </div>
                          ),
                        },
                        {
                          title: 'Current multiplier',
                          body: `X${multiplier.toFixed(1)}`,
                        },
                      ]}
                    />
                  </>
                )}
                <SectionLabel>{lockedDays > 0 ? 'Extended lock benefits' : 'Lock benefits'}</SectionLabel>
                <GenericInformationBox
                  details={[
                    {
                      title: 'Better APY',
                      body: (
                        <div className="flex space-x-2 mt-2 font-semibold">
                          <div className="text-text-secondary line-through">{apy.toFixed(0)}%</div>
                          <div>{lockingBenefitsCalculator(Number(inputValue ?? 0) + lockedDays).apy.toFixed(0)}%</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Returns multiplier',
                      body: `X${lockingBenefitsCalculator(Number(inputValue ?? 0)).multiplier.toFixed(1)}`,
                    },
                  ]}
                />
                {/* <LockingInformationBox strDays={inputValue} /> */}
              </>
            )}
            <InformationBox
              type={Tab.staking === tab ? InfoBoxType.warning : InfoBoxType.info}
              text="Some important notes about staking for users to see before
            staking any amount of their tokens."
            />
          </div>
        </div>
      </form>
    </>
  )
}

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
    <div className="font-sans text-text-secondary">
      <div className="bg-bg-secondary min-h-screen px-1 lg:px-10 py-10">
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
      </div>
    </div>
  )
}
