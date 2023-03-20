import { Dispatch, SetStateAction } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { GeneralElementProps } from '../../../components/generalInterfaces'
import { StakingVersion } from '../../../constants/enums'
import React from 'react'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { BKPT_4, BKPT_5 } from '../../../constants'
import { useGeneral } from '../../../context/GeneralManager'
import { NavLink } from 'react-router-dom'
import { Flex } from '../../../components/atoms/Layout'
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

const CoverageTip = styled.div<GeneralElementProps>`
  background: hsla(129, 78%, 21%, 1);

  background: linear-gradient(
    315deg,
    hsla(129, 78%, 21%, 1) 0%,
    hsla(133, 95%, 25%, 1) 6%,
    hsla(76, 38%, 61%, 1) 60%,
    hsla(89, 31%, 51%, 1) 73%,
    hsla(150, 83%, 37%, 1) 93%,
    hsla(129, 78%, 21%, 1) 100%
  );

  background: -moz-linear-gradient(
    315deg,
    hsla(129, 78%, 21%, 1) 0%,
    hsla(133, 95%, 25%, 1) 6%,
    hsla(76, 38%, 61%, 1) 60%,
    hsla(89, 31%, 51%, 1) 73%,
    hsla(150, 83%, 37%, 1) 93%,
    hsla(129, 78%, 21%, 1) 100%
  );

  background: -webkit-linear-gradient(
    315deg,
    hsla(129, 78%, 21%, 1) 0%,
    hsla(133, 95%, 25%, 1) 6%,
    hsla(76, 38%, 61%, 1) 60%,
    hsla(89, 31%, 51%, 1) 73%,
    hsla(150, 83%, 37%, 1) 93%,
    hsla(129, 78%, 21%, 1) 100%
  );
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

const SGTMigrationTip = styled.div<GeneralElementProps>`
  background: rgb(207, 189, 5);
  background: linear-gradient(
    101deg,
    rgba(207, 189, 5, 1) 1%,
    rgba(242, 94, 251, 1) 27%,
    rgba(80, 80, 251, 1) 75%,
    rgba(240, 26, 60, 1) 100%
  );
  color: #fafafa;
  padding: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  box-shadow: 0 0 7px #fff;
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

const greenButtonStyle = css`
  background-color: ${(props) => props.theme.box.success};
  color: #fafafa;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: white;
    color: ${(props) => props.theme.box.success};
  }
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
const whiteNotificationButtonStyle = css`
  background-color: white;
  color: #f04d42;
`

const whiteTipButtonSuccessStyle = css`
  background-color: white;
  color: ${(props) => props.theme.box.success};
`

const whiteTipButtonInfoStyle = css`
  background-color: white;
  color: ${(props) => props.theme.box.info};
`

const NotificationButton = styled.div<{ active?: boolean }>`
  ${baseButtonStyle}
  ${({ active }) => (active ? whiteNotificationButtonStyle : redButtonStyle)}
  &:not(:first-child) {
    margin-left: 10px;
  }
  height: 34px;
  width: 117px;
  border-radius: 10px;
  font-size: 14px;
`

const SuccessTipButton = styled.div<{ active?: boolean }>`
  ${baseButtonStyle}
  ${({ active }) => (active ? whiteTipButtonSuccessStyle : greenButtonStyle)}
  height: 40px;
  width: 170px;
  border-radius: 10px;
  font-size: 16px;
`

const InfoTipButton = styled.div`
  ${baseButtonStyle}
  ${whiteTipButtonInfoStyle}
  height: 40px;
  width: 170px;
  border-radius: 10px;
  font-size: 16px;
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
  Hero: styled.h2`
    font-size: 1.5rem;
    line-height: 26px;
    font-weight: 700;
  `,
  Sidekick: styled.h2`
    font-size: 1rem;
  `,
} as const

export function CoverageNotification(): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()

  return (
    <CoverageTip style={{ flexDirection: width > (rightSidebar ? BKPT_5 : BKPT_4) ? 'row' : 'column' }}>
      <Flex col>
        <Typography.Hero>Get Covered with Solace Portfolio Insurance</Typography.Hero>
        <Typography.Sidekick>
          Buy coverage for your Defi positions on <Typography.Emphasis>Solace</Typography.Emphasis> and other protocols.
        </Typography.Sidekick>
      </Flex>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', padding: '10px' }}>
          <NavLink to={'/cover'}>
            <SuccessTipButton active>Buy Policy Now</SuccessTipButton>
          </NavLink>
        </div>
      </div>
    </CoverageTip>
  )
}

export function SGTMigrationNotification(): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()

  return (
    <SGTMigrationTip style={{ flexDirection: width > (rightSidebar ? BKPT_5 : BKPT_4) ? 'row' : 'column' }}>
      <Flex col>
        <Typography.Hero>Migrate to SGT</Typography.Hero>
        <Typography.Sidekick>
          Solace is now using <Typography.Emphasis>$SGT</Typography.Emphasis> (Solace Governance Token) instead of
          $SOLACE.
        </Typography.Sidekick>
        <Typography.Sidekick>
          If you are eligible, please migrate your <Typography.Emphasis>$SOLACE</Typography.Emphasis> tokens for{' '}
          <Typography.Emphasis>$SGT</Typography.Emphasis> tokens.
        </Typography.Sidekick>
        <Typography.Sidekick>
          Your amount in <Typography.Emphasis>$SGT</Typography.Emphasis> will account for your staked and unstaked
          balances of <Typography.Emphasis>$SOLACE</Typography.Emphasis>.
        </Typography.Sidekick>
      </Flex>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', padding: '10px' }}>
          <NavLink to={'/migrate'}>
            <InfoTipButton>Migrate Now</InfoTipButton>
          </NavLink>
        </div>
      </div>
    </SGTMigrationTip>
  )
}

export function DifferenceNotification({
  version,
  setVersion,
}: {
  version: StakingVersion
  setVersion: Dispatch<SetStateAction<StakingVersion>>
}): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()

  return (
    <Notification style={{ flexDirection: width > (rightSidebar ? BKPT_5 : BKPT_4) ? 'row' : 'column' }}>
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
