import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { LockData } from '../../../../constants/types'
import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  formatAmount,
  truncateValue,
} from '../../../../utils/formatting'
import { BigNumber } from 'ethers'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/useInputAmount'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { FunctionName } from '../../../../constants/enums'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { StyledForm } from '../../atoms/StyledForm'
import Flex from '../../atoms/Flex'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import InfoPair, { Label } from '../../molecules/InfoPair'
import GrayBox from '../../components/GrayBox'
import { VerticalSeparator } from '../../components/VerticalSeparator'
import { useProjectedBenefits } from '../../../../hooks/useStakingRewards'
import { BKPT_5 } from '../../../../constants'
import { Text } from '../../../../components/atoms/Typography'

export default function WithdrawForm({ lock }: { lock: LockData }): JSX.Element {
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { withdrawFromLock } = useXSLocker()
  const { account } = useWallet()
  const { width } = useWindowDimensions()

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')
  const { projectedMultiplier, projectedApy, projectedYearlyReturns } = useProjectedBenefits(
    convertSciNotaToPrecise((parseFloat(lock.unboostedAmount.toString()) - parseFloat(rangeValue)).toString()),
    lock.end.toNumber()
  )

  const callWithdrawFromLock = async () => {
    if (!account) return
    let type = FunctionName.WITHDRAW_IN_PART_FROM_LOCK
    const isMax = parseUnits(inputValue, 18).eq(lock.unboostedAmount)
    if (isMax) {
      type = FunctionName.WITHDRAW_FROM_LOCK
    }
    await withdrawFromLock(account, [lock.xsLockID], isMax ? undefined : parseUnits(inputValue, 18))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawFromLock', err, type))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    if (parseUnits(formatted, 18).gt(lock.unboostedAmount)) return

    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(lock.unboostedAmount.toString())

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox
        type={InfoBoxType.info}
        text="Withdrawal is available only when the lockup period ends. Withdrawing harvests rewards for you."
      />
      <StyledForm>
        <Flex column={BKPT_5 > width} gap={24}>
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
              max={lock.unboostedAmount.toString()}
            />
          </Flex>
          <Flex column stretch w={BKPT_5 > width ? 300 : 521}>
            <Label importance="quaternary" style={{ marginBottom: '8px' }}>
              Projected benefits
            </Label>
            <GrayBox>
              <Flex stretch column>
                <Flex stretch gap={24}>
                  <Flex column gap={2}>
                    <Text t5s techygradient mb={8}>
                      APY
                    </Text>
                    <div style={BKPT_5 > width ? { margin: '-4px 0', display: 'block' } : { display: 'none' }}>
                      &nbsp;
                    </div>
                    <Text t3s techygradient>
                      <Flex>{truncateValue(projectedApy.toString(), 1)}%</Flex>
                    </Text>
                  </Flex>
                  <VerticalSeparator />
                  <Flex column gap={2}>
                    <Text t5s techygradient mb={8}>
                      Reward Multiplier
                    </Text>
                    <Text t3s techygradient>
                      {projectedMultiplier}x
                    </Text>
                  </Flex>
                  <VerticalSeparator />
                  <Flex column gap={2}>
                    <Text t5s techygradient mb={8}>
                      Yearly Return
                    </Text>
                    <Text t3s techygradient>
                      {truncateValue(formatUnits(projectedYearlyReturns, 18), 4, false)}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </GrayBox>
          </Flex>
        </Flex>

        <Button
          secondary
          info
          noborder
          disabled={!isAppropriateAmount(inputValue, 18, lock.unboostedAmount) || lock.timeLeft.toNumber() > 0}
          onClick={callWithdrawFromLock}
        >
          Withdraw
        </Button>
      </StyledForm>
    </div>
  )
}
