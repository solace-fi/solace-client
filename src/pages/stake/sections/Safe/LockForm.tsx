import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { LockData } from '../../../../constants/types'
import { BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useTransactionExecution } from '../../../../hooks/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { BigNumber } from 'ethers'
import { useProvider } from '../../../../context/ProviderManager'
import { SmallBox } from '../../../../components/atoms/Box'
import { Text } from '../../../../components/atoms/Typography'
import { getExpiration } from '../../../../utils/time'
import { StyledForm } from '../../atoms/StyledForm'
import { truncateValue } from '../../../../utils/formatting'
import Flex from '../../atoms/Flex'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import InfoPair, { Label } from '../../molecules/InfoPair'
import GrayBox from '../../components/GrayBox'
import { VerticalSeparator } from '../../components/VerticalSeparator'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { useProjectedBenefits } from '../../../../hooks/useStakingRewards'

export default function LockForm({ lock }: { lock: LockData }): JSX.Element {
  const { latestBlock } = useProvider()
  const { extendLock } = useXSLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { width } = useWindowDimensions()

  const [inputValue, setInputValue] = React.useState('0')
  const { projectedMultiplier, projectedApy, projectedYearlyReturns } = useProjectedBenefits(
    lock.unboostedAmount.toString(),
    latestBlock ? latestBlock.timestamp + parseInt(inputValue) * 86400 : 0
  )

  const callExtendLock = async () => {
    if (!latestBlock || !inputValue || inputValue == '0') return
    const seconds = latestBlock.timestamp + parseInt(inputValue) * 86400
    await extendLock(lock.xsLockID, BigNumber.from(seconds))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setInputValue(filtered)
    }
  }
  const rangeOnChange = (value: string) => {
    setInputValue(value)
  }

  const setMax = () => setInputValue(`${DAYS_PER_YEAR * 4}`)

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
        <Flex column={BKPT_5 > width} gap={24}>
          <Flex column gap={24}>
            <InputSection
              tab={Tab.LOCK}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={setMax}
            />
            <StyledSlider
              value={inputValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={0}
              max={DAYS_PER_YEAR * 4}
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
                      <Flex>{projectedApy.toNumber()}%</Flex>
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
        {
          <SmallBox transparent collapse={!inputValue || inputValue == '0'} m={0} p={0}>
            <Text>Lockup End Date: {getExpiration(parseInt(inputValue))}</Text>
          </SmallBox>
        }
        <Button
          pl={14}
          pr={14}
          secondary
          info
          noborder
          disabled={!inputValue || parseInt(inputValue) * 86400 <= lock.timeLeft.toNumber()}
          onClick={callExtendLock}
        >
          {lock.timeLeft.toNumber() > 0 ? `Reset Lockup` : `Start Lockup`}
        </Button>
      </StyledForm>
    </div>
  )
}
