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
import { BKPT_7, BKPT_5, ZERO } from '../../../../constants'
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

export default function WithdrawForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { withdraw, withdrawInPart, getBurnOnWithdrawAmount, getBurnOnWithdrawInPartAmount } = useUwLocker()
  const { account } = useWeb3React()
  const { width } = useWindowDimensions()
  const { uweToTokens } = useBalanceConversion()
  const { paymentCoins } = useLockContext()
  const { batchBalanceData } = paymentCoins

  const [inputValue, setInputValue] = React.useState('')
  const [rangeValue, setRangeValue] = React.useState('0')
  const [equivalentTokenAmounts, setEquivalentTokenAmounts] = useState<BigNumber[]>([])
  const [equivalentUSDValue, setEquivalentUSDValue] = useState<BigNumber>(ZERO)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)

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
    setMaxSelected(true)
    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setMaxSelected(true)
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => {
    setMaxSelected(true)
    rangeOnChange(lock.amount.toString())
  }

  const getConversion = useDebounce(async () => {
    const totalUweToWithdraw = inputValue
    const burnAmount = maxSelected
      ? await getBurnOnWithdrawAmount(lock.lockID)
      : await getBurnOnWithdrawInPartAmount(lock.lockID, lock.amount)
    const res = await uweToTokens(parseUnits(formatAmount(totalUweToWithdraw), 18).sub(burnAmount))
    setEquivalentTokenAmounts(res.depositTokens)
    setEquivalentUSDValue(res.usdValueOfUwpAmount)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [inputValue])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Withdrawal is available only when the lockup period ends." />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
          <Flex column gap={24}>
            <InputSection value={inputValue} onChange={(e) => inputOnChange(e.target.value)} setMax={setMax} />
            <StyledSlider
              value={rangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={lock.amount.toString()}
            />
          </Flex>
          <Flex column stretch width={(rightSidebar ? BKPT_7 : BKPT_5) > width ? 300 : 521}>
            <GrayBox>
              <Flex column gap={15}>
                <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                  Tokens to be given on withdrawal
                </Text>
                <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
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
                </Flex>
              </Flex>
            </GrayBox>
          </Flex>
        </Flex>
        <Button
          secondary
          info
          noborder
          disabled={
            !isAppropriateAmount(formatAmount(inputValue), 18, lock.amount) ||
            (latestBlock ? lock.end.toNumber() > latestBlock.timestamp : true)
          }
          onClick={callWithdrawFromLock}
        >
          Withdraw
        </Button>
      </StyledForm>
    </div>
  )
}
