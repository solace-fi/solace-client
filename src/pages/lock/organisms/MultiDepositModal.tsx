import useDebounce from '@rooks/use-debounce'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Label } from '../molecules/InfoPair'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { GrayBox } from '../../../components/molecules/GrayBox'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { LoaderText } from '../../../components/molecules/LoaderText'
import { Modal } from '../../../components/molecules/Modal'
import { BKPT_7, BKPT_5 } from '../../../constants'
import { FunctionName } from '../../../constants/enums'
import { VoteLockData } from '../../../constants/types'
import { useGeneral } from '../../../context/GeneralManager'
import { useProvider } from '../../../context/ProviderManager'
import { useTokenAllowance } from '../../../hooks/contract/useToken'
import { useInputAmount, useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { useUwLocker } from '../../../hooks/lock/useUwLocker'
import { filterAmount, formatAmount } from '../../../utils/formatting'
import { useLockContext } from '../LockContext'
import { useBalanceConversion } from '../../../hooks/lock/useUnderwritingHelper'

export const MultiDepositModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const [amountTracker, setAmountTracker] = useState<
    {
      lockID: BigNumber
      amount: string
    }[]
  >([])

  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { signer } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { increaseAmountMultiple } = useUwLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { tokensToUwe } = useBalanceConversion()
  const { intrface, paymentCoins, input } = useLockContext()
  const { tokensLoading } = intrface
  const { batchBalanceData, coinsOpen, handleCoinsOpen, approveCPM } = paymentCoins
  const { selectedCoin } = input

  const selectedCoinContract = useMemo(
    () => (selectedCoin ? new Contract(selectedCoin.address, ERC20_ABI, signer) : undefined),
    [selectedCoin, signer]
  )

  const selectedCoinBalance = useMemo(() => {
    return selectedCoin
      ? batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO
      : ZERO
  }, [batchBalanceData, selectedCoin])

  const [commonAmount, setCommonAmount] = useState<string>('')
  const [totalAmountToDeposit, setTotalAmountToDeposit] = useState<string>('')
  const [equivalentUwe, setEquivalentUwe] = useState<BigNumber>(ZERO)

  const depositApproval = useTokenAllowance(
    selectedCoinContract ?? null,
    null,
    totalAmountToDeposit && totalAmountToDeposit != '.'
      ? parseUnits(totalAmountToDeposit, selectedCoin?.decimals ?? 18).toString()
      : '0'
  )

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(totalAmountToDeposit, selectedCoin?.decimals ?? 18, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, totalAmountToDeposit, selectedCoin])

  const callIncreaseLockAmountMultiple = async () => {
    await increaseAmountMultiple(
      amountTracker.map((d) => d.lockID),
      amountTracker.map((d) => parseUnits(d.amount, selectedCoin?.decimals ?? 18))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseAmountMultiple', err, FunctionName.INCREASE_AMOUNT_MULTIPLE))
  }

  const handleAmountInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, amountTracker[index].amount.toString())
      setAmountTracker((prevState) => {
        return [
          ...prevState.slice(0, index),
          {
            ...prevState[index],
            amount: filtered,
          },
          ...prevState.slice(index + 1),
        ]
      })
    },
    [amountTracker]
  )

  const handleCommonAmountInput = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, commonAmount)
      setCommonAmount(filtered)
    },
    [commonAmount]
  )

  const changeAlltoCommonAmount = useDebounce((commonAmount: string) => {
    setAmountTracker(
      amountTracker.map((item) => {
        return {
          ...item,
          amount: commonAmount,
        }
      })
    )
  }, 400)

  const handleTotalAmount = useDebounce((amountTracker: { lockID: BigNumber; amount: string }[]) => {
    const amounts = amountTracker.map((item) => item.amount)
    const total = amounts.reduce(
      (acc, curr) => acc.add(curr == '' ? ZERO : parseUnits(curr, selectedCoin?.decimals ?? 18)),
      ZERO
    )
    setTotalAmountToDeposit(formatUnits(total, selectedCoin?.decimals ?? 18))
  }, 300)

  useEffect(() => {
    changeAlltoCommonAmount(commonAmount)
  }, [changeAlltoCommonAmount, commonAmount])

  useEffect(() => {
    handleTotalAmount(amountTracker)
  }, [handleTotalAmount, amountTracker])

  useEffect(() => {
    if (isOpen)
      setAmountTracker(
        selectedLocks.map((lock) => {
          return {
            lockID: lock.lockID,
            amount: '',
          }
        })
      )
    else {
      setAmountTracker([])
      setCommonAmount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const getConversion = useDebounce(async () => {
    if (!selectedCoin) return
    const res = await tokensToUwe(
      [selectedCoin.address],
      [parseUnits(formatAmount(totalAmountToDeposit), selectedCoin?.decimals ?? 18)]
    )
    setEquivalentUwe(res)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [totalAmountToDeposit, selectedCoin])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Deposit'}>
      <Flex col gap={10}>
        <Flex col>
          {tokensLoading ? (
            <LoaderText text={'Loading Tokens'} />
          ) : (
            <Button
              nohover
              noborder
              p={8}
              mt={12}
              ml={12}
              mb={12}
              style={{
                justifyContent: 'center',
                height: '32px',
                backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
              }}
              onClick={() => handleCoinsOpen(!coinsOpen)}
            >
              <Flex center gap={4}>
                <Text autoAlignVertical>
                  {selectedCoin && (
                    <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
                  )}
                </Text>
                <Text t4>{selectedCoin?.symbol}</Text>
                <StyledArrowDropDown style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={18} />
              </Flex>
            </Button>
          )}
        </Flex>
        <Flex col>
          <Text>Set all to this amount</Text>
          <SmallerInputSection
            placeholder={'Amount'}
            value={commonAmount}
            onChange={(e) => handleCommonAmountInput(e.target.value)}
          />
        </Flex>
        <Accordion isOpen={true} thinScrollbar customHeight={'50vh'}>
          <Flex col gap={10} p={10}>
            {amountTracker.map((lock, i) => (
              <Flex gap={10} key={i}>
                <Text autoAlign>Lock</Text>
                <SmallerInputSection
                  placeholder={'Amount'}
                  value={lock.amount}
                  onChange={(e) => handleAmountInput(e.target.value, i)}
                />
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Flex column stretch width={500}>
          <Label importance="quaternary" style={{ marginBottom: '8px' }}>
            Projected benefits
          </Label>
          <GrayBox>
            <Flex stretch column>
              <Flex stretch gap={24}>
                <Flex column gap={2}>
                  <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                    Amount of UWE to be minted on deposit
                  </Text>
                  <div style={(rightSidebar ? BKPT_7 : BKPT_5) > width ? { display: 'block' } : { display: 'none' }}>
                    &nbsp;
                  </div>
                  <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                    <Flex>{formatUnits(equivalentUwe, 18)} UWE</Flex>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </GrayBox>
        </Flex>
        {depositApproval && (
          <Button
            secondary
            warmgradient
            noborder
            disabled={!isAcceptableDeposit}
            onClick={callIncreaseLockAmountMultiple}
          >
            Make Deposits
          </Button>
        )}
        {!depositApproval && (
          <Button
            secondary
            warmgradient
            noborder
            disabled={!isAcceptableDeposit || !selectedCoinContract}
            onClick={() =>
              approveCPM(
                '',
                selectedCoinContract?.address ?? '',
                parseUnits(totalAmountToDeposit, selectedCoin?.decimals ?? 18)
              )
            }
          >
            {`Approve Entered ${selectedCoin?.symbol}`}
          </Button>
        )}
        {!depositApproval && (
          <Button
            secondary
            warmgradient
            noborder
            onClick={() => approveCPM('', selectedCoinContract?.address ?? '')}
            disabled={!selectedCoinContract}
          >
            {`Approve MAX ${selectedCoin?.symbol}`}
          </Button>
        )}
      </Flex>
    </Modal>
  )
}
