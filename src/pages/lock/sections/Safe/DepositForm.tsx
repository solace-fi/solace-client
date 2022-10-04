import React, { useEffect, useMemo, useState } from 'react'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  fixed,
  formatAmount,
} from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'

import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useLockContext } from '../../LockContext'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { useProvider } from '../../../../context/ProviderManager'
import { Text } from '../../../../components/atoms/Typography'
import { StyledArrowDropDown } from '../../../../components/atoms/Icon'
import { LoaderText } from '../../../../components/molecules/LoaderText'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import useDebounce from '@rooks/use-debounce'
import { useContracts } from '../../../../context/ContractsManager'
import { useTokenAllowance } from '../../../../hooks/contract/useToken'
import { useDepositHelper } from '../../../../hooks/lock/useDepositHelper'

export default function DepositForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme } = useGeneral()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { account } = useWeb3React()
  const { signer } = useProvider()
  const { keyContracts } = useContracts()
  const { depositHelper } = keyContracts

  const { isMobile } = useWindowDimensions()
  const { depositIntoLock, calculateDeposit } = useDepositHelper()
  const { intrface, paymentCoins, input, locker } = useLockContext()
  const { tokensLoading } = intrface
  const { batchBalanceData, coinsOpen, handleCoinsOpen, approveCPM } = paymentCoins
  const { selectedCoin } = input
  const { stakeInputValue, stakeRangeValue, handleStakeInputValue, handleStakeRangeValue } = locker

  const disabled = false

  const [equivalentUwe, setEquivalentUwe] = useState<BigNumber>(ZERO)

  const selectedCoinContract = useMemo(
    () => (selectedCoin ? new Contract(selectedCoin.address, ERC20_ABI, signer) : undefined),
    [selectedCoin, signer]
  )

  const depositApproval = useTokenAllowance(
    selectedCoinContract ?? null,
    depositHelper?.address ?? null,
    stakeInputValue && stakeInputValue != '.'
      ? parseUnits(stakeInputValue, selectedCoin?.decimals ?? 18).toString()
      : '0'
  )

  const selectedCoinBalance = useMemo(() => {
    return (
      batchBalanceData.find((d) => d.address.toLowerCase() == (selectedCoin?.address ?? '').toLowerCase())?.balance ??
      ZERO
    )
  }, [batchBalanceData, selectedCoin])

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(formatAmount(stakeInputValue), selectedCoin?.decimals ?? 18, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, stakeInputValue, selectedCoin])

  const callDepositIntoLock = async () => {
    if (!account || !selectedCoinContract) return
    await depositIntoLock(
      selectedCoinContract.address,
      parseUnits(formatAmount(stakeInputValue), selectedCoin?.decimals ?? 18),
      lock.lockID
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositIntoLock', err, FunctionName.DEPOSIT_INTO_LOCK))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, formatAmount(stakeInputValue))
    if (filtered.includes('.') && filtered.split('.')[1]?.length > (selectedCoin?.decimals ?? 18)) return
    handleStakeRangeValue(accurateMultiply(filtered, selectedCoin?.decimals ?? 18))
    handleStakeInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    handleStakeInputValue(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`),
        selectedCoin?.decimals ?? 18
      )
    )
    handleStakeRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(selectedCoinBalance.toString())

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
    if (stakeInputValue.includes('.') && stakeInputValue.split('.')[1]?.length) {
      if (selectedCoin && selectedCoin.decimals < stakeInputValue.split('.')[1].length) {
        handleStakeInputValue(fixed(formatAmount(stakeInputValue), selectedCoin.decimals).toString())
      }
    }
  }, [selectedCoin])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Deposit into this lock for voting power." />
      <StyledForm>
        <Flex column={isMobile} gap={30}>
          <Flex column gap={24}>
            <Flex col>
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
            <InputSection
              placeholder={'Amount'}
              tab={Tab.DEPOSIT}
              value={stakeInputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={() =>
                !disabled
                  ? setMax()
                  : () => {
                      return undefined
                    }
              }
              disabled={disabled}
            />
            <StyledSlider
              value={stakeRangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={selectedCoinBalance.toString()}
              disabled={disabled}
            />
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
        {depositApproval && selectedCoin && (
          <Button
            secondary
            info
            noborder
            disabled={!isAcceptableDeposit || !selectedCoin}
            onClick={callDepositIntoLock}
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
      </StyledForm>
    </div>
  )
}
