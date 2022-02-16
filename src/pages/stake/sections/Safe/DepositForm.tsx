import React from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { useSolaceBalance } from '../../../../hooks/useBalance'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  formatAmount,
  truncateValue,
} from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/useInputAmount'
import { LockData } from '../../../../constants/types'
import { FunctionName } from '../../../../constants/enums'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import { Label } from '../../molecules/InfoPair'
import GrayBox from '../../components/GrayBox'
import { VerticalSeparator } from '../../components/Separator'
import { useProjectedBenefits } from '../../../../hooks/useStakingRewards'
import { BKPT_5 } from '../../../../constants'
import { Text } from '../../../../components/atoms/Typography'

export default function DepositForm({ lock }: { lock: LockData }): JSX.Element {
  const solaceBalance = useSolaceBalance()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { increaseLockAmount } = useXSLocker()
  const { account } = useWallet()
  const { width } = useWindowDimensions()

  const [disabled, setDisabled] = React.useState(false)

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')

  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    convertSciNotaToPrecise((parseFloat(lock.unboostedAmount.toString()) + parseFloat(rangeValue)).toString()),
    lock.end.toNumber()
  )

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseLockAmount(account, lock.xsLockID, parseUnits(inputValue, 18))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseLockAmount', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return
    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(parseUnits(solaceBalance, 18).toString())

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
        text="Stake additional SOLACE to this safe. Staking harvests rewards for you."
      />
      <StyledForm>
        <Flex column={BKPT_5 > width} gap={24}>
          <Flex column gap={24}>
            <InputSection
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
              max={parseUnits(solaceBalance, 18).toString()}
              disabled={disabled}
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
                      APR
                    </Text>
                    <div style={BKPT_5 > width ? { margin: '-4px 0', display: 'block' } : { display: 'none' }}>
                      &nbsp;
                    </div>
                    <Text t3s techygradient>
                      <Flex>{truncateValue(projectedApr.toString(), 1)}%</Flex>
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
          disabled={!isAppropriateAmount(inputValue, 18, parseUnits(solaceBalance, 18))}
          onClick={callIncreaseLockAmount}
        >
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
