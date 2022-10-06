import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import { Tab } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { Text } from '../../../../components/atoms/Typography'
import { BKPT_7, BKPT_5 } from '../../../../constants'
import { getExpiration } from '../../../../utils/time'
import { RaisedBox } from '../../../../components/atoms/Box'
import { Label } from '../../molecules/InfoPair'
import { Flex, ShadowDiv } from '../../../../components/atoms/Layout'
import { Accordion } from '../../../../components/atoms/Accordion'
import { useProvider } from '../../../../context/ProviderManager'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { useLockContext } from '../../LockContext'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { StyledArrowDropDown } from '../../../../components/atoms/Icon'
import { LoaderText } from '../../../../components/molecules/LoaderText'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import useDebounce from '@rooks/use-debounce'
import { useContracts } from '../../../../context/ContractsManager'
import { useTokenAllowance } from '../../../../hooks/contract/useToken'
import { useDepositHelper } from '../../../../hooks/lock/useDepositHelper'

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  @media (max-width: ${BKPT_5}px) {
    align-items: center;
    margin-left: auto;
    margin-right: auto;
  }
`

export default function NewSafe({ isOpen }: { isOpen: boolean }): JSX.Element {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { account } = useWeb3React()
  const { latestBlock, signer } = useProvider()
  const { intrface, paymentCoins, input, locker } = useLockContext()
  const { tokensLoading } = intrface
  const { batchBalanceData, coinsOpen, handleCoinsOpen, approveCPM } = paymentCoins
  const { selectedCoin } = input
  const {
    minLockDuration,
    maxLockDuration,
    maxNumLocks,
    userLocks,
    stakeInputValue,
    stakeRangeValue,
    handleStakeInputValue,
    handleStakeRangeValue,
  } = locker
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { depositAndLock, calculateDeposit } = useDepositHelper()
  const { keyContracts } = useContracts()
  const { depositHelper } = keyContracts

  const minDays = useMemo(() => Math.ceil(minLockDuration.toNumber() / 86400), [minLockDuration])
  const maxDays = useMemo(() => Math.ceil(maxLockDuration.toNumber() / 86400), [maxLockDuration])
  const mounting = useRef(true)

  const selectedCoinContract = useMemo(
    () => (selectedCoin ? new Contract(selectedCoin.address, ERC20_ABI, signer) : undefined),
    [selectedCoin, signer]
  )

  const selectedCoinBalance = useMemo(() => {
    return (
      batchBalanceData.find((d) => d.address.toLowerCase() == (selectedCoin?.address ?? '').toLowerCase())?.balance ??
      ZERO
    )
  }, [batchBalanceData, selectedCoin])

  const accordionRef = useRef<HTMLDivElement>(null)
  const [lockInputValue, setLockInputValue] = useState(`${minDays}`)
  const [equivalentUwe, setEquivalentUwe] = useState<BigNumber>(ZERO)

  const depositApproval = useTokenAllowance(
    selectedCoinContract ?? null,
    depositHelper?.address ?? null,
    stakeInputValue && stakeInputValue != '.'
      ? parseUnits(stakeInputValue, selectedCoin?.decimals ?? 18).toString()
      : '0'
  )

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(formatAmount(stakeInputValue), selectedCoin?.decimals ?? 18, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, stakeInputValue, selectedCoin])

  const callDepositAndLock = async () => {
    if (!latestBlock || !account || !selectedCoinContract) return
    const endInSeconds = latestBlock.timestamp + parseInt(formatAmount(lockInputValue)) * 86400
    await depositAndLock(
      selectedCoinContract.address,
      parseUnits(formatAmount(stakeInputValue), selectedCoin?.decimals ?? 18),
      BigNumber.from(endInSeconds)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositAndLock', err, FunctionName.DEPOSIT_AND_LOCK))
  }

  /*            STAKE INPUT & RANGE HANDLERS             */
  const stakeInputOnChange = (value: string) => {
    const filtered = filterAmount(value, formatAmount(stakeInputValue))
    if (filtered.includes('.') && filtered.split('.')[1]?.length > (selectedCoin?.decimals ?? 18)) return
    handleStakeRangeValue(accurateMultiply(filtered, selectedCoin?.decimals ?? 18))
    handleStakeInputValue(filtered)
  }

  const stakeRangeOnChange = (value: string, convertFromSciNota = true) => {
    handleStakeInputValue(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`),
        selectedCoin?.decimals ?? 18
      )
    )
    handleStakeRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  /*            LOCK INPUT & RANGE HANDLERS             */
  const lockInputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= maxDays || filtered == '') {
      setLockInputValue(filtered)
    }
  }
  const lockRangeOnChange = (value: string) => {
    setLockInputValue(value)
  }

  const getConversion = useDebounce(async () => {
    if (selectedCoin) {
      const res = await calculateDeposit(
        selectedCoin.address,
        parseUnits(formatAmount(stakeInputValue), selectedCoin?.decimals ?? 18)
      )
      setEquivalentUwe(res)
    }
  }, 400)

  useEffect(() => {
    getConversion()
  }, [stakeInputValue, selectedCoin])

  useEffect(() => {
    if (minDays == 0) return
    if (mounting.current) {
      mounting.current = false
      setLockInputValue(`${minDays}`)
    }
  }, [minDays])

  /*            MAX HANDLERS             */
  const stakeSetMax = () => stakeRangeOnChange(selectedCoinBalance.toString())
  const lockSetMax = () => setLockInputValue(`${maxDays}`)

  return (
    <Accordion
      noScroll
      isOpen={isOpen}
      style={{ backgroundColor: 'inherit', marginBottom: '20px' }}
      customHeight={'100vh'}
    >
      <ShadowDiv ref={accordionRef} style={{ marginBottom: '20px' }}>
        <RaisedBox>
          <StyledForm>
            <Flex column={isMobile} p={24} gap={30}>
              <Flex column gap={24}>
                <Flex column gap={24}>
                  {tokensLoading ? (
                    <LoaderText text={'Loading Tokens'} />
                  ) : (
                    <Button
                      nohover
                      noborder
                      p={8}
                      style={{
                        justifyContent: 'center',
                        height: '32px',
                        backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
                      }}
                      onClick={() => handleCoinsOpen(!coinsOpen)}
                    >
                      <Flex center gap={4}>
                        <Text autoAlignVertical>
                          {selectedCoin && (
                            <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
                          )}
                        </Text>
                        <Text t4>{selectedCoin?.symbol}</Text>
                        <StyledArrowDropDown
                          style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          size={18}
                        />
                      </Flex>
                    </Button>
                  )}
                </Flex>
                <Flex column gap={24}>
                  <div>
                    <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                      Deposit amount
                    </Label>
                    <InputSection
                      placeholder={'Amount'}
                      tab={Tab.DEPOSIT}
                      value={stakeInputValue}
                      onChange={(e) => stakeInputOnChange(e.target.value)}
                      setMax={stakeSetMax}
                    />
                  </div>
                  <StyledSlider
                    value={stakeRangeValue}
                    onChange={(e) => stakeRangeOnChange(e.target.value)}
                    min={1}
                    max={selectedCoinBalance.toString()}
                  />
                </Flex>
                <Flex column gap={24}>
                  <div>
                    <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                      Lock time
                    </Label>
                    <InputSection
                      tab={Tab.LOCK}
                      value={lockInputValue}
                      onChange={(e) => lockInputOnChange(e.target.value)}
                      setMax={lockSetMax}
                    />
                  </div>
                  <StyledSlider
                    value={lockInputValue}
                    onChange={(e) => lockRangeOnChange(e.target.value)}
                    min={183}
                    max={maxDays}
                  />
                  {parseInt(formatAmount(lockInputValue)) > 0 && (
                    <Text
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Lock End Date: {getExpiration(parseInt(formatAmount(lockInputValue)))}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Flex column stretch width={isMobile ? 300 : 521}>
                <GrayBox>
                  <Flex stretch column>
                    <Flex column gap={10}>
                      <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                        Amount of UWE to be minted on deposit
                      </Text>
                      <div style={isMobile ? { display: 'block' } : { display: 'none' }}>&nbsp;</div>
                      <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                        <Flex>{formatUnits(equivalentUwe, 18)} UWE</Flex>
                      </Text>
                    </Flex>
                  </Flex>
                </GrayBox>
              </Flex>
            </Flex>
            <Flex pb={24} pl={24} width={isMobile ? 333 : undefined}>
              {depositApproval && selectedCoin && (
                <Button
                  secondary
                  info
                  noborder
                  disabled={
                    !isAcceptableDeposit ||
                    !selectedCoin ||
                    userLocks.length >= maxNumLocks.toNumber() ||
                    parseFloat(formatAmount(lockInputValue)) < minDays
                  }
                  onClick={callDepositAndLock}
                >
                  Stake
                </Button>
              )}
              {!depositApproval && selectedCoin && (
                <Flex gap={10}>
                  <Button
                    secondary
                    warmgradient
                    noborder
                    disabled={
                      !stakeInputValue ||
                      stakeInputValue == '.' ||
                      parseUnits(stakeInputValue, selectedCoin?.decimals ?? 18).isZero() ||
                      !selectedCoinContract ||
                      !depositHelper
                    }
                    onClick={() =>
                      approveCPM(
                        depositHelper?.address ?? '',
                        selectedCoinContract?.address ?? '',
                        parseUnits(stakeInputValue, selectedCoin?.decimals ?? 18)
                      )
                    }
                  >
                    {`Approve Entered ${selectedCoin?.symbol}`}
                  </Button>
                  <Button
                    secondary
                    warmgradient
                    noborder
                    onClick={() => approveCPM(depositHelper?.address ?? '', selectedCoinContract?.address ?? '')}
                    disabled={!selectedCoinContract || !depositHelper}
                  >
                    {`Approve MAX ${selectedCoin?.symbol}`}
                  </Button>
                </Flex>
              )}
            </Flex>
          </StyledForm>
        </RaisedBox>
      </ShadowDiv>
    </Accordion>
  )
}
