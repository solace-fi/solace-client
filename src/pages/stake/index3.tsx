/*

    Table of Contents:

    import packages
    import managers
    import components
    import hooks

    Stake 
      custom hooks
      useEffect hooks

*/

/* import packages */
import React, { useState, useEffect, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useGeneral } from '../../context/GeneralManager'
import { useContracts } from '../../context/ContractsManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { ZERO } from '../../constants'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { Content, FlexCol, FlexRow, HorizRule } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text } from '../../components/atoms/Typography'
import { HeroContainer, MultiTabIndicator } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { StyledRefresh } from '../../components/atoms/Icon'

/* import hooks */
import { useSolaceBalance, useXSolaceBalance } from '../../hooks/useBalance'
// import { useStakingApy, useXSolace, useXSolaceDetails } from '../../hooks/useXSolace'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { formatAmount, getUnit, truncateBalance } from '../../utils/formatting'
import tw, { TwStyle } from 'twin.macro'
import styled from 'styled-components'

/* styled components */

// function Twiv({
//   className,
//   children,
//   ...props
// }: {
//   className?: string
//   children: React.ReactNode
//   [key: string]: any
// }) {
//   const Styled = styled.div(tw`${className}`)
//   return <Styled {...props}>{children}</Styled>
// }

function CardHeader(props: { title: string; solaceAmount: number; xSolaceAmount?: number }) {
  return (
    <GridParent>
      <div>{props.title}</div>
      <div>{props.solaceAmount}</div>
      <div>{props.xSolaceAmount}</div>
    </GridParent>
  )
}

// Upper banner
const Notification = tw.div`bg-[#F04D42] text-[#fafafa] rounded-[10px] p-6 text-sm font-medium flex items-center`

const baseButton = tw`rounded-lg text-sm font-semibold flex items-center justify-center select-none border-solid border-[1px] border-white duration-200`
const whiteButton = tw`bg-white text-[#F04D42]`
const redButton = tw`bg-[#F04D42] text-[#fafafa] hover:bg-white hover:text-[#F04D42] cursor-pointer`
const DifferenceText = tw.div`text-sm font-bold underline mt-3 text-underline-offset[4px] text-decoration-thickness[2px] self-center cursor-pointer select-none hover:opacity-80 duration-200`

// create a div that takes css and appends it to styled div
function Twiv({
  className,
  children,
  css,
  span,
  ...props
}: {
  className?: string
  children: React.ReactNode
  css?: TwStyle
  span?: boolean
  [key: string]: any
}) {
  // grab the css style prop and put it in a styled div (use pure styled/components, do not use tw(
  const Styled = (span ? styled.span : styled.div)`
    ${css}
  `
  return (
    <Styled className={className} {...props}>
      {children}
    </Styled>
  )
}

// button specs: height: 34px, width: 117px, radius: 10px, font-size: 14px,
// ${({ active }) => (!active ? tw`border-[1px] border-white` : tw`border-0`)}
const NotificationButton = styled.div<{ active?: boolean }>`
  ${({ active }) => (active ? whiteButton : redButton)}
  ${baseButton}
  
  &:not(:first-child) {
    margin-left: 10px;
  }
  height: 34px;
  width: 117px;
  border-radius: 10px;
  font-size: 14px;
`

const Typography = {
  Notice: tw.p`my-0 text-sm font-medium mr-10`,
  Emphasis: tw.span`font-bold`,
} as const

// Functional card

const ShadowyCard = styled.div`
  ${tw`shadow-xl rounded-lg p-6 bg-white h-96 mt-5`}
`

// header logo is just a flex-col where the logo takes 2 rows out of 3
const HeaderLogoWrapper = styled.div`
  ${tw`flex flex-col items-center justify-center`}
`
const HeaderLogo = ({ activeTab }: { activeTab: number }) => {
  const [logo, setLogo] = useState<string>('sol')
  useEffect(() => {
    if (activeTab === 0) {
      setLogo('sol')
    } else {
      setLogo('xsol')
    }
  }, [activeTab])
  // logo takes up 2 rows out of 3
  const Logo = styled.div`
    ${tw`h-32 w-32 flex-grow[2]`}
  `
  return (
    <HeaderLogoWrapper>
      {/* <Logo src={logo} /> */}
      <Logo>{logo}</Logo>
    </HeaderLogoWrapper>
  )
}

const TextSm = tw.span`text-sm`

// DataTitle is text-sm semibold
const DataTitle = tw.div`text-sm font-semibold`
// DataValue is text-md font-medium. it takes a number and returns a string like "522.2 SOLACE"
const DataValueWrapper = tw.div`text-[8px] font-medium`
const DataValue = ({ value }: { value: number }) => {
  const formattedValue = formatAmount(String(value))
  return (
    <DataValueWrapper>
      {formattedValue} <TextSm>SOLACE</TextSm>
    </DataValueWrapper>
  )
}
// DataSubValue is text-sm font-medium. it takes a number and returns a string like "522.2 xSOLACE"
const DataSubValueWrapper = tw.div`text-sm font-medium`
const DataSubValue = ({ value }: { value: number }) => {
  const formattedValue = formatAmount(String(value))
  return (
    <DataSubValueWrapper>
      {formattedValue} <TextSm>xSOLACE</TextSm>
    </DataSubValueWrapper>
  )
}

// HeaderContainer is flex-row with 4 tabs
const HeaderContainer = styled.div`
  ${tw`flex flex-row items-center justify-between`}
`

const GridParent = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
`
const LogoChild = styled.div`
  grid-area: 1 / 1 / 3 / 2;
`
const InfoBox1 = styled.div`
  grid-area: 1 / 2 / 4 / 3;
`
const InfoBox2 = styled.div`
  grid-area: 1 / 3 / 4 / 4;
`
const InfoBox3 = styled.div`
  grid-area: 1 / 4 / 4 / 5;
`
/* main */

function Stake(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const [stakingVersion, setStakingVersion] = useState<0 | 1 | 2>(2)
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(2)
  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const [isStaking, setIsStaking] = useState<boolean>(true)
  const solaceBalance = useSolaceBalance()
  const xSolaceBalance = useXSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolace)
  const {
    gasConfig,
    amount,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    handleInputChange,
    setMax,
    resetAmount,
  } = useInputAmount()
  // const { stake, unstake } = useXSolace()
  // const { stakingApy } = useStakingApy()
  // const { userShare, xSolacePerSolace, solacePerXSolace } = useXSolaceDetails()
  const { account } = useWallet()
  // const [convertStoX, setConvertStoX] = useState<boolean>(true)
  // const [convertedAmount, setConvertedAmount] = useState<BigNumber>(ZERO)

  // const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const assetBalance = useMemo(
    () =>
      isStaking
        ? parseUnits(solaceBalance, readSolaceToken.decimals)
        : parseUnits(xSolaceBalance, readXSolaceToken.decimals),
    [isStaking, solaceBalance, xSolaceBalance, readSolaceToken, readXSolaceToken]
  )

  const assetDecimals = useMemo(() => (isStaking ? readSolaceToken.decimals : readXSolaceToken.decimals), [
    isStaking,
    readSolaceToken.decimals,
    readXSolaceToken.decimals,
  ])

  const callStakeSigned = async () => {
    // await stake(
    //   parseUnits(amount, readSolaceToken.decimals),
    //   `${truncateBalance(amount)} ${getUnit(FunctionName.STAKE)}`,
    //   gasConfig
    // )
    // .then((res) => handleToast(res.tx, res.localTx))
    // .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE))
  }

  // const callUnstake = async () => {
  //   await unstake(
  //     parseUnits(amount, readXSolaceToken.decimals),
  //     `${truncateBalance(amount)} ${getUnit(FunctionName.UNSTAKE)}`,
  //     gasConfig
  //   )
  //     .then((res) => handleToast(res.tx, res.localTx))
  //     .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE))
  // }

  const _setMax = () => {
    setMax(assetBalance, assetDecimals)
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    // setIsAcceptableAmount(isAppropriateAmount(amount, assetDecimals, assetBalance))
  }, [amount, isStaking, assetBalance, assetDecimals, readSolaceToken.decimals, readXSolaceToken.decimals, xSolace])

  useEffect(() => {
    resetAmount()
    // setConvertedAmount(ZERO)
    // setConvertStoX(isStaking)
  }, [isStaking])

  useEffect(() => {
    const getConvertedAmount = async () => {
      if (!xSolace) return
      const formatted = formatAmount(amount)
      if (isStaking) {
        const amountInXSolace = await xSolace.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
        // setConvertedAmount(amountInXSolace)
      } else {
        const amountInSolace = await xSolace.xSolaceToSolace(parseUnits(formatted, readXSolaceToken.decimals))
        // setConvertedAmount(amountInSolace)
      }
    }
    getConvertedAmount()
  }, [amount, readSolaceToken.decimals, readXSolaceToken.decimals, xSolace])

  return (
    <>
      {!account ? (
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to begin staking
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
      ) : (
        <Content>
          <Notification>
            <Typography.Notice>
              We have updated our staking mechanism to a new version{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis> which is a part of our{' '}
              <Typography.Emphasis>Governance system</Typography.Emphasis>.<br /> New staking is available only in new{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis>.<br /> In{' '}
              <Typography.Emphasis>STAKING V1</Typography.Emphasis> you can unstake your funds or migrate funds to new{' '}
              <Typography.Emphasis>STAKING V2</Typography.Emphasis>.
            </Typography.Notice>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex' }}>
                {/* div with 2 buttons horizontally saying Staking V1 and Staking V2, one border white, red bg, white text, the other white bg, red text, both semibold */}
                <NotificationButton active={stakingVersion === 1} onClick={() => setStakingVersion(1)}>
                  Staking V1
                </NotificationButton>
                <NotificationButton
                  onClick={() => {
                    setStakingVersion(2)
                  }}
                  active={stakingVersion === 2}
                >
                  Staking V2
                </NotificationButton>
              </div>
              <DifferenceText onClick={() => setStakingVersion(0)}>What is the difference?</DifferenceText>
            </div>
          </Notification>
          <ShadowyCard>
            <HeaderContainer>
              <HeaderLogo activeTab={activeTab} />
              {/* <HeaderDetails /> */}
              <FlexCol>
                <DataTitle>Unstaked Balance</DataTitle>
                <DataValue value={0} />
              </FlexCol>
              <FlexCol>
                <DataTitle>Staked Balance</DataTitle>
                <DataValue value={522.2} />
                <DataSubValue value={522.2} />
              </FlexCol>
              <FlexCol>
                <DataTitle>Locked Balance</DataTitle>
                <DataValue value={522.2} />
                <DataSubValue value={522.2} />
              </FlexCol>
            </HeaderContainer>
          </ShadowyCard>
          <Twiv
            css={tw`text-red-100 text-xl underline text-underline-offset[5px] cursor-pointer bg-blue-400 p-4 rounded-b-xl`}
          >
            When the birbos become an undisputable truth, we will see that they were right all along, and we the
            villains.
          </Twiv>
        </Content>
      )}
    </>
  )
}

export default Stake
