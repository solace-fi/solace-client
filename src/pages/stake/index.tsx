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
import { useStakingApyV1, useXSolaceV1, useXSolaceV1Details } from '../../hooks/useXSolaceV1'
import { useInputAmount } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { formatAmount, getUnit, truncateBalance } from '../../utils/formatting'

function Stake(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const [isStaking, setIsStaking] = useState<boolean>(true)
  const solaceBalance = useSolaceBalance()
  const xSolaceBalance = useXSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
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
  const { stake_v1, unstake_v1 } = useXSolaceV1()
  const { stakingApy } = useStakingApyV1()
  const { userShare, xSolacePerSolace, solacePerXSolace } = useXSolaceV1Details()
  const { account } = useWallet()
  const [convertStoX, setConvertStoX] = useState<boolean>(true)
  const [convertedAmount, setConvertedAmount] = useState<BigNumber>(ZERO)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

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
    await stake_v1(
      parseUnits(amount, readSolaceToken.decimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.STAKE_V1)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStakeSigned', err, FunctionName.STAKE_V1))
  }

  const callUnstake = async () => {
    await unstake_v1(
      parseUnits(amount, readXSolaceToken.decimals),
      `${truncateBalance(amount)} ${getUnit(FunctionName.UNSTAKE_V1)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const _setMax = () => {
    setMax(assetBalance, assetDecimals)
  }

  /*

  useEffect hooks

  */

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, assetDecimals, assetBalance))
  }, [amount, isStaking, assetBalance, assetDecimals, readSolaceToken.decimals, readXSolaceToken.decimals, xSolaceV1])

  useEffect(() => {
    resetAmount()
    setConvertedAmount(ZERO)
    setConvertStoX(isStaking)
  }, [isStaking])

  useEffect(() => {
    const getConvertedAmount = async () => {
      if (!xSolaceV1) return
      const formatted = formatAmount(amount)
      if (isStaking) {
        const amountInXSolace = await xSolaceV1.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
        setConvertedAmount(amountInXSolace)
      } else {
        const amountInSolace = await xSolaceV1.xSolaceToSolace(parseUnits(formatted, readXSolaceToken.decimals))
        setConvertedAmount(amountInSolace)
      }
    }
    getConvertedAmount()
  }, [amount, readSolaceToken.decimals, readXSolaceToken.decimals, xSolaceV1])

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
          <FlexCol>
            <Card style={{ margin: 'auto' }}>
              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', position: 'relative' }}>
                <MultiTabIndicator style={{ left: isStaking ? '0' : '50%' }} />
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(true)}
                  jc={'center'}
                  style={{ cursor: 'pointer' }}
                >
                  <Text t1 info={isStaking}>
                    Stake
                  </Text>
                </ModalCell>
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsStaking(false)}
                  jc={'center'}
                  style={{ cursor: 'pointer' }}
                >
                  <Text t1 info={!isStaking}>
                    Unstake
                  </Text>
                </ModalCell>
              </div>
              <FormRow mt={20} mb={10}>
                <FormCol>
                  <Text bold t2>
                    APY
                  </Text>
                </FormCol>
                <FormCol>
                  <Text bold t2 textAlignRight info>
                    {stakingApy}
                  </Text>
                </FormCol>
              </FormRow>
              <FlexRow style={{ textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
                <Input
                  widthP={100}
                  minLength={1}
                  maxLength={79}
                  autoComplete="off"
                  autoCorrect="off"
                  inputMode="decimal"
                  placeholder="0.0"
                  textAlignCenter
                  type="text"
                  onChange={(e) =>
                    handleInputChange(e.target.value, isStaking ? readSolaceToken.decimals : readXSolaceToken.decimals)
                  }
                  value={amount}
                />
                <Button info ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
                  MAX
                </Button>
              </FlexRow>
              <FormRow mt={40} mb={10}>
                <FormCol>
                  <Text t4={!isStaking} fade={!isStaking}>
                    Unstaked Balance
                  </Text>
                </FormCol>
                <FormCol>
                  <Text textAlignRight info t4={!isStaking} fade={!isStaking}>
                    {solaceBalance} {readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow mb={30}>
                <FormCol>
                  <Text t4={isStaking} fade={isStaking}>
                    Staked Balance
                  </Text>
                </FormCol>
                <FormCol>
                  <Text textAlignRight info t4={isStaking} fade={isStaking}>
                    {xSolaceBalance} {readXSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow mb={10}>
                <FormCol>
                  <Text bold>Amount you will get</Text>
                </FormCol>
                <FormCol>
                  <Text bold textAlignRight info>
                    {convertedAmount.eq(ZERO)
                      ? `-`
                      : formatUnits(
                          convertedAmount,
                          isStaking ? readXSolaceToken.decimals : readSolaceToken.decimals
                        )}{' '}
                    {isStaking ? readXSolaceToken.symbol : readSolaceToken.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow mt={10} mb={30}>
                <FormCol>
                  <Button onClick={() => setConvertStoX(!convertStoX)}>
                    Conversion
                    <StyledRefresh size={30} style={{ cursor: 'pointer' }} />
                  </Button>
                </FormCol>
                <FormCol>
                  <Text t4 pr={5}>
                    {convertStoX
                      ? `1 ${readSolaceToken.symbol} = ${xSolacePerSolace} ${readXSolaceToken.symbol}`
                      : `1 ${readXSolaceToken.symbol} = ${solacePerXSolace} ${readSolaceToken.symbol}`}
                  </Text>
                </FormCol>
              </FormRow>
              <HorizRule />
              {account && (
                <FormRow mt={20} mb={10}>
                  <FormCol>
                    <Text t4>My xSolace Pool Share</Text>
                  </FormCol>
                  <FormCol>
                    <Text t4>{userShare}%</Text>
                  </FormCol>
                </FormRow>
              )}
              <ButtonWrapper>
                <Button
                  widthP={100}
                  info
                  disabled={!isAcceptableAmount || haveErrors}
                  onClick={isStaking ? callStakeSigned : callUnstake}
                >
                  {isStaking ? 'Stake' : 'Unstake'}
                </Button>
              </ButtonWrapper>
            </Card>
          </FlexCol>
        </Content>
      )}
    </>
  )
}

export default Stake
