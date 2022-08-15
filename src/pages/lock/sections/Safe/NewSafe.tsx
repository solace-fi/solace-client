import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { useSolaceBalance } from '../../../../hooks/balance/useBalance'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount } from '../../../../utils/formatting'
import { Tab } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { Text } from '../../../../components/atoms/Typography'
import { BKPT_7, BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { getExpiration } from '../../../../utils/time'
import { RaisedBox } from '../../../../components/atoms/Box'
import { Label } from '../../molecules/InfoPair'
import { Flex, GrayBgDiv, ShadowDiv } from '../../../../components/atoms/Layout'
import { Accordion } from '../../../../components/atoms/Accordion'
import { useProvider } from '../../../../context/ProviderManager'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { useUwpLocker } from '../../../../hooks/lock/useUwpLocker'
import { useLockContext } from '../../LockContext'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { StyledArrowDropDown } from '../../../../components/atoms/Icon'

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
  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { account } = useWeb3React()
  const { latestBlock, signer } = useProvider()
  const { paymentCoins, input } = useLockContext()
  const { batchBalanceData, coinsOpen, setCoinsOpen } = paymentCoins
  const { selectedCoin } = input
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { createLock } = useUwpLocker()

  const selectedCoinContract = useMemo(() => new Contract(selectedCoin.address, ERC20_ABI, signer), [
    selectedCoin.address,
    signer,
  ])

  const selectedCoinBalance = useMemo(() => {
    return batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO
  }, [batchBalanceData, selectedCoin])

  const accordionRef = useRef<HTMLDivElement>(null)

  const [stakeInputValue, setStakeInputValue] = React.useState('0')
  const [stakeRangeValue, setStakeRangeValue] = React.useState('0')
  const [lockInputValue, setLockInputValue] = React.useState('0')

  const callCreateLock = async () => {
    if (!latestBlock || !account) return
    const seconds = latestBlock.timestamp + parseInt(lockInputValue) * 86400
    await createLock(
      account,
      parseUnits(stakeInputValue, selectedCoin.decimals),
      BigNumber.from(seconds),
      selectedCoinContract
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callCreateLock', err, FunctionName.CREATE_LOCK))
  }

  /*            STAKE INPUT & RANGE HANDLERS             */
  const stakeInputOnChange = (value: string) => {
    const filtered = filterAmount(value, stakeInputValue)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > selectedCoin.decimals) return
    setStakeRangeValue(accurateMultiply(filtered, selectedCoin.decimals))
    setStakeInputValue(filtered)
  }

  const stakeRangeOnChange = (value: string, convertFromSciNota = true) => {
    setStakeInputValue(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`),
        selectedCoin.decimals
      )
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
  const stakeSetMax = () => stakeRangeOnChange(selectedCoinBalance.toString())
  const lockSetMax = () => setLockInputValue(`${DAYS_PER_YEAR * 4}`)

  return (
    <Accordion noScroll isOpen={isOpen} style={{ backgroundColor: 'inherit', marginBottom: '20px' }}>
      <ShadowDiv ref={accordionRef} style={{ marginBottom: '20px' }}>
        <RaisedBox>
          <StyledForm>
            <Flex>
              <Flex column p={24} gap={30}>
                <Flex col>
                  <Button
                    nohover
                    noborder
                    p={8}
                    mt={12}
                    ml={12}
                    mb={12}
                    widthP={100}
                    style={{
                      justifyContent: 'center',
                      height: '32px',
                      backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
                    }}
                    onClick={() => setCoinsOpen(!coinsOpen)}
                  >
                    <Flex center gap={4}>
                      <Text autoAlignVertical>
                        <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
                      </Text>
                      <Text t4>{selectedCoin.symbol}</Text>
                      <StyledArrowDropDown
                        style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        size={18}
                      />
                    </Flex>
                  </Button>
                </Flex>
                <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
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
                      max={selectedCoinBalance.toString()}
                    />
                  </Flex>
                </Flex>
                <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
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
                    {lockInputValue && lockInputValue != '0' && (
                      <Text
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Lock End Date: {getExpiration(parseInt(lockInputValue))}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Flex>
              <GrayBgDiv>
                <Flex col>
                  <Text>Amount of UWE minted in exchange</Text>
                  <Text>$$$</Text>
                </Flex>
              </GrayBgDiv>
            </Flex>
            <Flex pb={24} pl={24} width={(rightSidebar ? BKPT_7 : BKPT_5) > width ? 333 : undefined}>
              <Button
                secondary
                info
                noborder
                disabled={!isAppropriateAmount(stakeInputValue, selectedCoin.decimals, selectedCoinBalance)}
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
