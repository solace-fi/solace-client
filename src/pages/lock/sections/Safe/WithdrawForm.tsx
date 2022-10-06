import React, { useEffect, useState } from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { InputSection } from '../../../../components/molecules/InputSection'
import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  floatUnits,
  formatAmount,
  truncateValue,
} from '../../../../utils/formatting'
import { BigNumber } from 'ethers'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName, InfoBoxType } from '../../../../constants/enums'
import InformationBox from '../../components/InformationBox'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { ZERO } from '../../../../constants'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useProvider } from '../../../../context/ProviderManager'
import { useUwLocker } from '../../../../hooks/lock/useUwLocker'
import { Text } from '../../../../components/atoms/Typography'
import useDebounce from '@rooks/use-debounce'
import { useBalanceConversion } from '../../../../hooks/lock/useUnderwritingHelper'
import { useLockContext } from '../../LockContext'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { StyledFire } from '../../../../components/atoms/Icon'

export default function WithdrawForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { latestBlock } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { withdraw, withdrawInPart, getBurnOnWithdrawAmount, getBurnOnWithdrawInPartAmount } = useUwLocker()
  const { account } = useWeb3React()
  const { uweToTokens } = useBalanceConversion()
  const { paymentCoins, input } = useLockContext()
  const { selectedCoin } = input
  const { batchBalanceData } = paymentCoins

  const [inputValue, setInputValue] = React.useState('')
  const [rangeValue, setRangeValue] = React.useState('0')
  const [equivalentTokenAmounts, setEquivalentTokenAmounts] = useState<BigNumber[]>([])
  const [equivalentUSDValue, setEquivalentUSDValue] = useState<BigNumber>(ZERO)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [actualUweWithdrawal, setActualUweWithdrawal] = useState<BigNumber>(ZERO)
  const [burnAmount, setBurnAmount] = useState<BigNumber>(ZERO)

  const callWithdrawFromLock = async () => {
    if (!account) return
    let type = FunctionName.WITHDRAW_LOCK_IN_PART
    const isMax = parseUnits(formatAmount(inputValue), 18).eq(lock.amount)
    if (isMax) {
      type = FunctionName.WITHDRAW_LOCK
    }
    if (!isMax) {
      await withdrawInPart(lock.lockID, parseUnits(formatAmount(inputValue), 18), account)
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callWithdrawInPart', err, type))
    } else {
      await withdraw(lock.lockID, account)
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callWithdraw', err, type))
    }
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, formatAmount(inputValue))
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    if (parseUnits(formatted, 18).gt(lock.amount)) return
    setMaxSelected(false)
    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setMaxSelected(false)
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => {
    setMaxSelected(true)
    rangeOnChange(lock.amount.toString())
  }

  const getConversion = useDebounce(async () => {
    const totalUweToWithdraw = inputValue
    const _burnAmount = maxSelected
      ? await getBurnOnWithdrawAmount(lock.lockID)
      : await getBurnOnWithdrawInPartAmount(lock.lockID, lock.amount)
    const _actualUweWithdrawal = parseUnits(formatAmount(totalUweToWithdraw), 18).sub(_burnAmount)
    setBurnAmount(_burnAmount)
    setActualUweWithdrawal(_actualUweWithdrawal.gt(ZERO) ? _actualUweWithdrawal : ZERO)
    // const res = await uweToTokens(actualUweWithdrawal)
    // setEquivalentTokenAmounts(res.depositTokens)
    // setEquivalentUSDValue(res.usdValueOfUwpAmount)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [inputValue, latestBlock])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <StyledForm>
        <Flex column={isMobile} gap={24}>
          <Flex column gap={24}>
            <InputSection value={inputValue} onChange={(e) => inputOnChange(e.target.value)} setMax={setMax} />
            <StyledSlider
              value={rangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={lock.amount.toString()}
            />
          </Flex>
          <Flex column stretch width={isMobile ? 300 : 521}>
            <GrayBox>
              <Flex column gap={15}>
                <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                  Tokens to be given on withdrawal
                </Text>
                {/* <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                  ${truncateValue(formatUnits(equivalentUSDValue, 18), 2)}
                </Text>
                <Flex col gap={2}>
                  {batchBalanceData.length > 0 &&
                    equivalentTokenAmounts.length > 0 &&
                    equivalentTokenAmounts.map((item, i) => (
                      <Flex key={i} between>
                        <Text>
                          <img src={`https://assets.solace.fi/${batchBalanceData[i].name.toLowerCase()}`} height={20} />
                        </Text>
                        <Text>{truncateValue(formatUnits(item, batchBalanceData[i].decimals), 3)}</Text>
                        <Text>
                          ~$
                          {truncateValue(floatUnits(item, batchBalanceData[i].decimals) * batchBalanceData[i].price, 2)}
                        </Text>
                      </Flex>
                    ))}
                </Flex> */}
                <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                  {formatUnits(actualUweWithdrawal, 18)} UWE
                </Text>
                <Flex>
                  <Text error>
                    <StyledFire size={18} />
                  </Text>
                  <Text t4s error>
                    {burnAmount.gt(ZERO) ? formatUnits(burnAmount, 18) : '0'} UWE
                  </Text>
                </Flex>
              </Flex>
            </GrayBox>
          </Flex>
        </Flex>
        <Button
          secondary
          info
          noborder
          disabled={!isAppropriateAmount(formatAmount(inputValue), 18, lock.amount)}
          onClick={callWithdrawFromLock}
        >
          Withdraw
        </Button>
      </StyledForm>
    </div>
  )
}
