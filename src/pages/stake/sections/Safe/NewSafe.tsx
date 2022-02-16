import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import React, { useRef } from 'react'
import styled from 'styled-components'
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
import { Tab } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { SmallBox } from '../../../../components/atoms/Box'
import { Text } from '../../../../components/atoms/Typography'
import { BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { getExpiration } from '../../../../utils/time'
import RaisedBox from '../../../../components/atoms/RaisedBox'
import InfoPair, { Label } from '../../molecules/InfoPair'
import { Flex, ShadowDiv, VerticalSeparator } from '../../../../components/atoms/Layout'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { Accordion } from '../../../../components/atoms/Accordion'
import { useProvider } from '../../../../context/ProviderManager'
import { useProjectedBenefits } from '../../../../hooks/useStakingRewards'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  @media (max-width: ${BKPT_5}px) {
    align-items: center;
    margin-left: auto;
    margin-right: auto;
  }
`

export default function NewSafe({ isOpen }: { isOpen: boolean }): JSX.Element {
  const { width } = useWindowDimensions()
  const { account } = useWallet()
  const { latestBlock } = useProvider()
  const solaceBalance = useSolaceBalance()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { createLock } = useXSLocker()

  const accordionRef = useRef<HTMLDivElement>(null)

  const [stakeInputValue, setStakeInputValue] = React.useState('0')
  const [stakeRangeValue, setStakeRangeValue] = React.useState('0')
  const [lockInputValue, setLockInputValue] = React.useState('0')
  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    stakeRangeValue,
    latestBlock ? latestBlock.timestamp + parseInt(lockInputValue) * 86400 : 0
  )

  const callCreateLock = async () => {
    if (!latestBlock || !account) return
    const seconds = latestBlock.timestamp + parseInt(lockInputValue) * 86400
    await createLock(account, parseUnits(stakeInputValue, 18), BigNumber.from(seconds))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callCreateLock', err, FunctionName.CREATE_LOCK))
  }

  /*            STAKE INPUT & RANGE HANDLERS             */
  const stakeInputOnChange = (value: string) => {
    const filtered = filterAmount(value, stakeInputValue)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return
    setStakeRangeValue(accurateMultiply(filtered, 18))
    setStakeInputValue(filtered)
  }

  const stakeRangeOnChange = (value: string, convertFromSciNota = true) => {
    setStakeInputValue(
      formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18)
    )
    setStakeRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  /*            LOCK INPUT & RANGE HANDLERS             */
  const lockInputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setLockInputValue(filtered)
    }
  }
  const lockRangeOnChange = (value: string) => {
    setLockInputValue(value)
  }

  /*            MAX HANDLERS             */
  const stakeSetMax = () => stakeRangeOnChange(parseUnits(solaceBalance, 18).toString())
  const lockSetMax = () => setLockInputValue(`${DAYS_PER_YEAR * 4}`)

  return (
    <Accordion
      noScroll
      isOpen={isOpen}
      style={{ backgroundColor: 'inherit', marginBottom: '20px' }}
      customHeight={accordionRef.current != null ? `${accordionRef.current.scrollHeight}px` : undefined}
    >
      <ShadowDiv ref={accordionRef} style={{ marginBottom: '20px' }}>
        <RaisedBox>
          <StyledForm>
            <Flex column p={24} gap={30}>
              <Flex column={BKPT_5 > width} gap={24}>
                <Flex column gap={24}>
                  <div>
                    <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                      Deposit amount
                    </Label>
                    <InputSection
                      tab={Tab.DEPOSIT}
                      value={stakeInputValue}
                      onChange={(e) => stakeInputOnChange(e.target.value)}
                      setMax={stakeSetMax}
                    />
                  </div>
                  <StyledSlider
                    value={stakeRangeValue}
                    onChange={(e) => stakeRangeOnChange(e.target.value)}
                    min={1}
                    max={parseUnits(solaceBalance, 18).toString()}
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
              <Flex column={BKPT_5 > width} gap={24}>
                <Flex column gap={24}>
                  <div>
                    <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                      Lock time
                    </Label>
                    <InputSection
                      tab={Tab.LOCK}
                      value={lockInputValue}
                      onChange={(e) => lockInputOnChange(e.target.value)}
                      setMax={lockSetMax}
                    />
                  </div>
                  <StyledSlider
                    value={lockInputValue}
                    onChange={(e) => lockRangeOnChange(e.target.value)}
                    min={0}
                    max={DAYS_PER_YEAR * 4}
                  />
                  {
                    <SmallBox transparent collapse={!lockInputValue || lockInputValue == '0'} m={0} p={0}>
                      <Text
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Lock End Date: {getExpiration(parseInt(lockInputValue))}
                      </Text>
                    </SmallBox>
                  }
                </Flex>
              </Flex>
            </Flex>
            {/* <Flex p={24} stretch>
              <InformationBox
                type={InfoBoxType.info}
                text="New deposit will be added to current locked amount locked for the same time."
                forceExpand
              />
            </Flex> */}
            <Flex pb={24} pl={24} w={BKPT_5 > width ? 333 : undefined}>
              <Button
                secondary
                info
                noborder
                disabled={!isAppropriateAmount(stakeInputValue, 18, parseUnits(solaceBalance, 18))}
                onClick={callCreateLock}
              >
                Stake
              </Button>
            </Flex>
          </StyledForm>
        </RaisedBox>
      </ShadowDiv>
    </Accordion>
  )
}
