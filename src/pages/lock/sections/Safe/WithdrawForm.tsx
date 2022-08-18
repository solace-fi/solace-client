import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { Tab } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import { BigNumber } from 'ethers'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName, InfoBoxType } from '../../../../constants/enums'
import InformationBox from '../../components/InformationBox'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex, GrayBgDiv } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { BKPT_7, BKPT_5 } from '../../../../constants'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useProvider } from '../../../../context/ProviderManager'
import { useUwLocker } from '../../../../hooks/lock/useUwLocker'
import { Text } from '../../../../components/atoms/Typography'

export default function WithdrawForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { withdraw, withdrawInPart } = useUwLocker()
  const { account } = useWeb3React()
  const { width } = useWindowDimensions()

  const [inputValue, setInputValue] = React.useState('')
  const [rangeValue, setRangeValue] = React.useState('0')

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

    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(lock.amount.toString())

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
            <InputSection
              tab={Tab.WITHDRAW}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={setMax}
            />
            <StyledSlider
              value={rangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={lock.amount.toString()}
            />
          </Flex>
          <Flex col stretch>
            <GrayBgDiv>
              <Flex col stretch>
                <Text>Token Amounts redeemed in exchange</Text>
                <Text>$$$</Text>
                <Text>$$$</Text>
                <Text>$$$</Text>
              </Flex>
            </GrayBgDiv>
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
