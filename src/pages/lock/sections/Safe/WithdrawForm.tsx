import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { Tab } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  formatAmount,
  truncateValue,
} from '../../../../utils/formatting'
import { BigNumber } from 'ethers'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { useXSLocker } from '../../../../hooks/stake/useXSLocker'
import { FunctionName, InfoBoxType } from '../../../../constants/enums'
import InformationBox from '../../components/InformationBox'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex, VerticalSeparator } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { Label } from '../../molecules/InfoPair'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { useProjectedBenefits } from '../../../../hooks/stake/useStakingRewards'
import { BKPT_7, BKPT_5 } from '../../../../constants'
import { Text } from '../../../../components/atoms/Typography'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useProvider } from '../../../../context/ProviderManager'

export default function WithdrawForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { withdrawFromLock } = useXSLocker()
  const { account } = useWeb3React()
  const { width } = useWindowDimensions()

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')
  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    convertSciNotaToPrecise((parseFloat(lock.amount.toString()) - parseFloat(rangeValue)).toString()),
    lock.end.toNumber()
  )

  const callWithdrawFromLock = async () => {
    if (!account) return
    let type = FunctionName.WITHDRAW_IN_PART_FROM_LOCK
    const isMax = parseUnits(inputValue, 18).eq(lock.amount)
    if (isMax) {
      type = FunctionName.WITHDRAW_FROM_LOCK
    }
    await withdrawFromLock(account, [lock.lockID], isMax ? undefined : parseUnits(inputValue, 18))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawFromLock', err, type))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
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
      <InformationBox
        type={InfoBoxType.info}
        text="Withdrawal is available only when the lockup period ends. Withdrawing harvests rewards for you."
      />
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
          <Flex column stretch width={(rightSidebar ? BKPT_7 : BKPT_5) > width ? 300 : 521}>
            <Label importance="quaternary" style={{ marginBottom: '8px' }}>
              Projected benefits
            </Label>
            <GrayBox>
              <Flex stretch column>
                <Flex stretch gap={24}>
                  <Flex column gap={2}>
                    <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                      APR
                    </Text>
                    <div
                      style={
                        (rightSidebar ? BKPT_7 : BKPT_5) > width
                          ? { margin: '-4px 0', display: 'block' }
                          : { display: 'none' }
                      }
                    >
                      &nbsp;
                    </div>
                    <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                      <Flex>{truncateValue(projectedApr.toString(), 1)}%</Flex>
                    </Text>
                  </Flex>
                  <VerticalSeparator />
                  <Flex column gap={2}>
                    <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                      Reward Multiplier
                    </Text>
                    <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                      {projectedMultiplier}x
                    </Text>
                  </Flex>
                  <VerticalSeparator />
                  <Flex column gap={2}>
                    <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                      Yearly Return
                    </Text>
                    <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
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
          disabled={
            !isAppropriateAmount(inputValue, 18, lock.amount) ||
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
