import { Dispatch, SetStateAction } from 'react'
import styled, { css } from 'styled-components'
import { GeneralElementProps } from '../../../components/generalInterfaces'
import { StakingVersion } from '../types/Version'
import React from 'react'
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'
import { BKPT_4 } from '../../../constants'
// text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200
const StyledText = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 0.75rem;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  align-self: center;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 0.8;
  }
`

const DifferenceText = function DifferenceText({
  children,
  onClick,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <StyledText
      onClick={onClick}
      // className="text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200"
    >
      {children}
    </StyledText>
  )
}
// const Notification = tw.div`bg-[#F04D42] text-[#fafafa] rounded-[10px] p-6 text-sm font-medium flex items-center`
const Notification = styled.div<GeneralElementProps>`
  background-color: #f04d42;
  color: #fafafa;
  padding: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
`

const baseButtonStyle = css`
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  border: 1px solid;
  border-color: white;
`
const redButtonStyle = css`
  background-color: #f04d42;
  color: #fafafa;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: white;
    color: #f04d42;
  }
`
const whiteButtonStyle = css`
  background-color: white;
  color: #f04d42;
`

const NotificationButton = styled.div<{ active?: boolean }>`
  ${baseButtonStyle}
  ${({ active }) => (active ? whiteButtonStyle : redButtonStyle)}
  &:not(:first-child) {
    margin-left: 10px;
  }
  height: 34px;
  width: 117px;
  border-radius: 10px;
  font-size: 14px;
`

const Typography = {
  Notice: styled.p`
    margin-top: 0;
    margin-bottom: 0;
    margin-right: 60px;
    font-size: 0.875rem /* 14px */;
    line-height: 22.4px;
    font-weight: 500;
  `,
  Emphasis: styled.span`
    font-weight: 700;
  `,
} as const

export default function DifferenceNotification({
  version,
  setVersion,
}: {
  version: StakingVersion
  setVersion: Dispatch<SetStateAction<StakingVersion>>
}): JSX.Element {
  const { width } = useWindowDimensions()

  return (
    <Notification style={{ flexDirection: width > BKPT_4 ? 'row' : 'column' }}>
      <Typography.Notice>
        We have updated our staking mechanism to a new version <Typography.Emphasis>STAKING V2</Typography.Emphasis>{' '}
        which is a part of our <Typography.Emphasis>Governance system</Typography.Emphasis>. New staking is available
        only in new <Typography.Emphasis>STAKING V2</Typography.Emphasis>. In{' '}
        <Typography.Emphasis>STAKING V1</Typography.Emphasis> you can unstake your funds or migrate funds to new{' '}
        <Typography.Emphasis>STAKING V2</Typography.Emphasis>.
      </Typography.Notice>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', padding: '10px' }}>
          {/* div with 2 buttons horizontally saying Staking V1 and Staking V2, one border white, red bg, white text, the other white bg, red text, both semibold */}
          <NotificationButton active={version === StakingVersion.v1} onClick={() => setVersion(StakingVersion.v1)}>
            Staking V1
          </NotificationButton>
          <NotificationButton
            onClick={() => {
              setVersion(StakingVersion.v2)
            }}
            active={version === StakingVersion.v2}
          >
            Staking V2
          </NotificationButton>
        </div>
        <DifferenceText
          onClick={() => {
            setVersion(StakingVersion.difference)
          }}
        >
          What is the difference?
        </DifferenceText>
      </div>
    </Notification>
  )
}
