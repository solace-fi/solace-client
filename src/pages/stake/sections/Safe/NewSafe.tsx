import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { useSolaceBalance } from '../../../../hooks/useBalance'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { SmallBox } from '../../../../components/atoms/Box'
import { Text } from '../../../../components/atoms/Typography'
import { DAYS_PER_YEAR } from '../../../../constants'
import { getExpiration } from '../../../../utils/time'
import RaisedBox from '../../atoms/RaisedBox'
import ShadowDiv from '../../atoms/ShadowDiv'
import InfoPair, { Label } from '../../molecules/InfoPair'
import Flex from '../../atoms/Flex'
import GrayBox from '../../components/GrayBox'
import { DarkSeparator } from '../../components/VerticalSeparator'
import { Accordion } from '../../../../components/atoms/Accordion'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`
const Container = styled.div`
  max-width: 521px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
`

export default function NewSafe({ isOpen }: { isOpen: boolean }): JSX.Element {
  const solaceBalance = useSolaceBalance()
  const { handleToast, handleContractCallError, isAppropriateAmount, gasConfig } = useInputAmount()
  const { increaseLockAmount } = useXSLocker()
  const { account } = useWallet()

  const [stakeInputValue, setStakeInputValue] = React.useState('0')
  const [stakeRangeValue, setStakeRangeValue] = React.useState('0')
  const [lockInputValue, setLockInputValue] = React.useState('0')

  const lock = {
    xsLockID: BigNumber.from(12321),
  }

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseLockAmount(account, lock.xsLockID, parseUnits(lockInputValue, 18), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseLockAmount', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  /*            STAKE INPUT & RANGE HANDLERS             */
  const stakeInputOnChange = (value: string) => {
    const filtered = filterAmount(value, stakeInputValue)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    if (parseUnits(formatted, 18).gt(parseUnits(solaceBalance, 18))) return

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
  const lockSetMax = () => lockRangeOnChange(parseUnits(solaceBalance, 18).toString())

  /*            SUBMIT HANDLER             */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    callIncreaseLockAmount()
  }

  return (
    <Accordion isOpen={isOpen} style={{ backgroundColor: 'inherit' }}>
      <ShadowDiv style={{ marginBottom: '20px' }}>
        <RaisedBox>
          <StyledForm onSubmit={onSubmit}>
            <Flex column p={24} gap={30} stretch>
              <Flex gap={24}>
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
                <Flex column stretch w={521}>
                  <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                    Stake benefits
                  </Label>
                  <GrayBox>
                    <Flex stretch column>
                      <Flex stretch gap={24}>
                        <Flex column gap={2}>
                          <Text t3>Regular APY</Text>
                          <Text>55%</Text>
                        </Flex>
                        <DarkSeparator />
                        <Flex column gap={2}>
                          <Text t3>Multiplier</Text>
                          <Text>1x</Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </GrayBox>
                </Flex>
              </Flex>
              <Flex gap={24}>
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
                        dark
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Lock End Date: {getExpiration(parseInt(lockInputValue))}
                      </Text>
                    </SmallBox>
                  }
                </Flex>
                <Flex column stretch w={521}>
                  <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                    Lock benefits
                  </Label>
                  <GrayBox>
                    <Flex stretch column>
                      <Flex stretch gap={24}>
                        <Flex column gap={2}>
                          <Text t3>Better APY</Text>
                          <Text>0.5%</Text>
                        </Flex>
                        <DarkSeparator />
                        <Flex column gap={2}>
                          <Text t3>Better multiplier</Text>
                          <Text>1.7x</Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </GrayBox>
                </Flex>
              </Flex>
            </Flex>
            <Flex p={24}>
              <InformationBox
                type={InfoBoxType.info}
                text="New deposit will be added to current locked amount locked for the same time."
              />
            </Flex>
            <Flex pb={24} pl={24}>
              <Button
                secondary
                info
                noborder
                disabled={!isAppropriateAmount(stakeInputValue, 18, parseUnits(solaceBalance, 18))}
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
