import React, { useEffect, useMemo, useState } from 'react'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'

import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { BKPT_5, BKPT_7 } from '../../../../constants'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useUwLocker } from '../../../../hooks/lock/useUwLocker'
import { useLockContext } from '../../LockContext'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { useProvider } from '../../../../context/ProviderManager'
import { Text } from '../../../../components/atoms/Typography'
import { StyledArrowDropDown } from '../../../../components/atoms/Icon'
import { LoaderText } from '../../../../components/molecules/LoaderText'
import { Label } from '../../molecules/InfoPair'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { useBalanceConversion } from '../../../../hooks/lock/useUnderwritingHelper'
import useDebounce from '@rooks/use-debounce'

export default function DepositForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { account } = useWeb3React()
  const { signer } = useProvider()
  const { width } = useWindowDimensions()
  const { increaseAmount } = useUwLocker()
  const { tokensToUwe } = useBalanceConversion()
  const { intrface, paymentCoins, input } = useLockContext()
  const { tokensLoading } = intrface
  const { batchBalanceData, coinsOpen, handleCoinsOpen } = paymentCoins
  const { selectedCoin } = input

  const disabled = false

  const [inputValue, setInputValue] = React.useState('')
  const [rangeValue, setRangeValue] = React.useState('0')
  const [equivalentUwe, setEquivalentUwe] = useState<BigNumber>(ZERO)

  const selectedCoinContract = useMemo(() => new Contract(selectedCoin?.address ?? '', ERC20_ABI, signer), [
    selectedCoin,
    signer,
  ])

  const selectedCoinBalance = useMemo(() => {
    return (
      batchBalanceData.find((d) => d.address.toLowerCase() == (selectedCoin?.address ?? '').toLowerCase())?.balance ??
      ZERO
    )
  }, [batchBalanceData, selectedCoin])

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(formatAmount(inputValue), selectedCoin?.decimals ?? 18, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, inputValue, selectedCoin])

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseAmount(
      account,
      lock.lockID,
      parseUnits(formatAmount(inputValue), selectedCoin?.decimals ?? 18),
      selectedCoinContract
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseAmount', err, FunctionName.INCREASE_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, formatAmount(inputValue))
    if (filtered.includes('.') && filtered.split('.')[1]?.length > (selectedCoin?.decimals ?? 18)) return
    setRangeValue(accurateMultiply(filtered, selectedCoin?.decimals ?? 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`),
        selectedCoin?.decimals ?? 18
      )
    )
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(selectedCoinBalance.toString())

  const getConversion = useDebounce(async () => {
    const res = await tokensToUwe(
      [selectedCoin?.address ?? ''],
      [parseUnits(formatAmount(inputValue), selectedCoin?.decimals ?? 18)]
    )
    setEquivalentUwe(res)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [inputValue, selectedCoin])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Deposit into this safe for voting power." />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={30}>
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
              value={inputValue}
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
              value={rangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={selectedCoinBalance.toString()}
              disabled={disabled}
            />
          </Flex>
          <Flex column stretch width={(rightSidebar ? BKPT_7 : BKPT_5) > width ? 300 : 521}>
            <Label importance="quaternary" style={{ marginBottom: '8px' }}>
              Projected benefits
            </Label>
            <GrayBox>
              <Flex stretch column>
                <Flex stretch gap={24}>
                  <Flex column gap={2}>
                    <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                      Amount of UWE to be minted on deposit
                    </Text>
                    <div style={(rightSidebar ? BKPT_7 : BKPT_5) > width ? { display: 'block' } : { display: 'none' }}>
                      &nbsp;
                    </div>
                    <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                      <Flex>{formatUnits(equivalentUwe, 18)} UWE</Flex>
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </GrayBox>
          </Flex>
        </Flex>
        <Button secondary info noborder disabled={!isAcceptableDeposit} onClick={callIncreaseLockAmount}>
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
