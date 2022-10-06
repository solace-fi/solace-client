import React, { useMemo, useState } from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { LockData } from '@solace-fi/sdk-nightly'
import { BKPT_7, BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { useXSLocker } from '../../../../hooks/stake/useXSLocker'
import { useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { BigNumber } from 'ethers'
import { useProvider } from '../../../../context/ProviderManager'
import { Text } from '../../../../components/atoms/Typography'
import { getDateStringWithMonthName } from '../../../../utils/time'
import { StyledForm } from '../../atoms/StyledForm'
import { formatAmount, truncateValue } from '../../../../utils/formatting'
import { Flex, VerticalSeparator } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { Label } from '../../molecules/InfoPair'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { formatUnits } from 'ethers/lib/utils'
import { useProjectedBenefits } from '../../../../hooks/stake/useStakingRewards'
import { useGeneral } from '../../../../context/GeneralManager'

export default function LockForm({ lock }: { lock: LockData }): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { extendLock } = useXSLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { width } = useWindowDimensions()
  const [maxSelected, setMaxSelected] = useState(false)

  const lockEnd = useMemo(() => Math.max(lock.end.toNumber(), latestBlock?.timestamp ?? 0), [lock.end, latestBlock])

  const lockTimeInSeconds = useMemo(() => (latestBlock ? lockEnd - latestBlock.timestamp : 0), [latestBlock, lockEnd])

  const extendableDays = useMemo(() => Math.floor(DAYS_PER_YEAR * 4 - lockTimeInSeconds / 86400), [lockTimeInSeconds])

  const [inputValue, setInputValue] = React.useState('')
  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    lock.unboostedAmount.toString(),
    lockEnd + parseInt(formatAmount(inputValue)) * 86400
  )

  const callExtendLock = async () => {
    if (!latestBlock || parseInt(formatAmount(inputValue)) == 0) return
    const newEndDateInSeconds =
      lockEnd +
      (maxSelected ? DAYS_PER_YEAR * 4 * 86400 - lockTimeInSeconds : parseInt(formatAmount(inputValue)) * 86400)
    await extendLock(lock.xsLockID, BigNumber.from(newEndDateInSeconds))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.EXTEND_LOCK))
  }

  const inputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= extendableDays || filtered == '') {
      setInputValue(filtered)
      setMaxSelected(false)
    }
  }
  const rangeOnChange = (value: string) => {
    setInputValue(value)
    setMaxSelected(false)
  }

  const setMax = () => {
    setInputValue(`${extendableDays}`)
    setMaxSelected(true)
  }

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
        text="The maximum lockup period is 4 years. Note that you cannot withdraw funds during a lockup period. Setting the lockup period harvests rewards for you."
      />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
          <Flex column gap={24}>
            <InputSection
              tab={Tab.LOCK}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={setMax}
            />
            <StyledSlider
              value={parseInt(formatAmount(inputValue))}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={0}
              max={extendableDays}
            />
          </Flex>
          <Flex column stretch w={(rightSidebar ? BKPT_7 : BKPT_5) > width ? 300 : 521}>
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
        <Text>
          Lockup End Date:{' '}
          {getDateStringWithMonthName(new Date((lockEnd + parseInt(formatAmount(inputValue)) * 86400) * 1000))}
        </Text>
        <Button
          pl={14}
          pr={14}
          secondary
          info
          noborder
          disabled={
            parseInt(formatAmount(inputValue)) == 0 ||
            parseInt(inputValue) + lockTimeInSeconds / 86400 > DAYS_PER_YEAR * 4
          }
          onClick={callExtendLock}
        >
          Extend
        </Button>
      </StyledForm>
    </div>
  )
}
