import React, { useMemo } from 'react'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount } from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'

import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { BKPT_5, BKPT_7 } from '../../../../constants'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useUwpLocker } from '../../../../hooks/lock/useUwpLocker'
import { useLockContext } from '../../LockContext'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { useProvider } from '../../../../context/ProviderManager'
import { Text } from '../../../../components/atoms/Typography'
import { StyledArrowDropDown } from '../../../../components/atoms/Icon'

export default function DepositForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { account } = useWeb3React()
  const { signer } = useProvider()
  const { width } = useWindowDimensions()
  const { increaseAmount } = useUwpLocker()
  const { paymentCoins, input } = useLockContext()
  const { batchBalanceData, coinsOpen, setCoinsOpen } = paymentCoins
  const { selectedCoin } = input

  const disabled = false

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')

  const selectedCoinContract = useMemo(() => new Contract(selectedCoin.address, ERC20_ABI, signer), [
    selectedCoin.address,
    signer,
  ])

  const selectedCoinBalance = useMemo(() => {
    return batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO
  }, [batchBalanceData, selectedCoin])

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(inputValue, selectedCoin.decimals, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, inputValue, selectedCoin.address, selectedCoin.decimals])

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseAmount(account, lock.lockID, parseUnits(inputValue, selectedCoin.decimals), selectedCoinContract)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseAmount', err, FunctionName.INCREASE_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > selectedCoin.decimals) return
    setRangeValue(accurateMultiply(filtered, selectedCoin.decimals))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`),
        selectedCoin.decimals
      )
    )
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(selectedCoinBalance.toString())

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Deposit into this safe for voting power." />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
          <Flex column gap={24}>
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
                  <StyledArrowDropDown style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={18} />
                </Flex>
              </Button>
            </Flex>
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
              max={selectedCoinBalance.toString()}
              disabled={disabled}
            />
          </Flex>
        </Flex>
        <Button secondary info noborder disabled={!isAcceptableDeposit} onClick={callIncreaseLockAmount}>
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
