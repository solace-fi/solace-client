import React, { useState, useEffect } from 'react'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { Input } from '../atoms/Input'
import { FlexCol, FlexRow, HorizRule } from '../atoms/Layout'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useInputAmount } from '../../hooks/useInputAmount'
import { ModalRow } from '../atoms/Modal'
import { StyledSelect } from '../molecules/Select'
import { USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { useNetwork } from '../../context/NetworkManager'
import { BKPT_4, GAS_LIMIT, ZERO } from '../../constants'
import { BigNumber } from 'ethers'
import { getContract } from '../../utils'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { useWallet } from '../../context/WalletManager'
import useDebounce from '@rooks/use-debounce'
import { queryBalance, queryDecimals } from '../../utils/contract'
import { truncateBalance } from '../../utils/formatting'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Text } from '../atoms/Typography'
import { FormRow, FormCol } from '../atoms/Form'
import { useContracts } from '../../context/ContractsManager'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { getDateStringWithMonthName, getLongtimeFromMillis } from '../../utils/time'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { useProvider } from '../../context/ProviderManager'

export const OptionsWindow: React.FC = () => {
  const { farmRewards } = useContracts()
  const { latestBlock } = useProvider()
  const { library, account } = useWallet()
  const { chainId, currencyDecimals } = useNetwork()
  const {
    gasConfig,
    amount,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    handleInputChange,
    setMax,
    resetAmount,
  } = useInputAmount()
  const totalUserRewards = useTotalPendingRewards()

  const stablecoins = [
    { value: `${USDC_ADDRESS[chainId]}`, label: 'USDC' },
    { value: `${USDT_ADDRESS[chainId]}`, label: 'USDT' },
    { value: `${DAI_ADDRESS[chainId]}`, label: 'DAI' },
  ]

  const [stablecoinPayment, setStablecoinPayment] = useState(stablecoins[0])
  const [userStablecoinDecimals, setUserStablecoinDecimals] = useState<number>(0)
  const [deadline, setDeadline] = useState<BigNumber>(ZERO)
  const [vestingTerm, setVestingTerm] = useState<BigNumber>(ZERO)
  const [purchasableSolace, setPurchasableSolace] = useState<BigNumber>(ZERO)
  const [redeemableAmount, setRedeemableAmount] = useState<BigNumber>(ZERO)
  const [userStablecoinBalance, setUserStablecoinBalance] = useState<BigNumber>(ZERO)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const { width } = useWindowDimensions()

  /*

  contract functions

  */

  const callDepositForRewards = async () => {
    if (!farmRewards) return
    try {
      const tx = await farmRewards.depositSigned({
        value: parseUnits(amount, currencyDecimals),
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REWARDS_DEPOSIT,
        value: 'Depositing stablecoins',
        status: TransactionCondition.PENDING,
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDepositForRewards', err, FunctionName.REWARDS_DEPOSIT)
    }
  }

  const callRedeemRewards = async () => {
    if (!farmRewards || !account) return
    try {
      const tx = await farmRewards.depositSigned(account, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REWARDS_REDEEM,
        value: 'Redeeming rewards',
        status: TransactionCondition.PENDING,
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDepositForRewards', err, FunctionName.REWARDS_REDEEM)
    }
  }

  /*

  local functions

  */

  const handleSelect = (s: any) => setStablecoinPayment(s)

  const _setMax = () => setMax(userStablecoinBalance, userStablecoinDecimals)

  const _getBalance = useDebounce(async () => {
    if (!library || !account) return
    const stablecoinContract = getContract(stablecoinPayment.value, IERC20.abi, library, account)
    const balance = await queryBalance(stablecoinContract, account)
    const decimals = await queryDecimals(stablecoinContract)
    setIsAcceptableAmount(isAppropriateAmount(amount, decimals, balance))
    setUserStablecoinDecimals(decimals)
    setUserStablecoinBalance(balance)
  }, 300)

  /*

  useEffect Hooks

  */

  useEffect(() => {
    _getBalance()
  }, [stablecoinPayment, library, account])

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, userStablecoinDecimals, userStablecoinBalance))
  }, [userStablecoinDecimals, userStablecoinBalance, amount])

  useEffect(() => {
    resetAmount()
  }, [stablecoinPayment])

  useEffect(() => {
    const getFarmRewardsData = async () => {
      if (!farmRewards) return
      const deadline = await farmRewards.expiry()
      const vestingTerm = await farmRewards.vestingTerm()
      setVestingTerm(vestingTerm)
      setDeadline(deadline)
    }
    getFarmRewardsData()
  }, [farmRewards])

  useEffect(() => {
    const getUserData = async () => {
      if (!farmRewards || !account) return
      const redeemableRewards = await farmRewards.redeemableRewards(account)
      const purchasableSolace = await farmRewards.purchasableSolace(account)
      setPurchasableSolace(purchasableSolace)
      setRedeemableAmount(redeemableRewards)
    }
    getUserData()
  }, [account, farmRewards, latestBlock])

  return (
    <FlexCol>
      <Card style={{ margin: 'auto' }}>
        <Box success mb={20}>
          <BoxItem style={{ textAlign: 'center' }}>
            <BoxItemTitle t2 bold light mb={10}>
              Attention, early investors!
            </BoxItemTitle>
            <Text t4 light mb={5}>
              You can redeem rewards if you participated in our early incentive programs:
            </Text>
            <Text t4 light bold>
              Options Mining Pool
            </Text>
            <Text t4 light bold>
              Policy Whirlpool
            </Text>
          </BoxItem>
        </Box>
        <Text t4 mb={10} bold textAlignCenter autoAlignHorizontal>
          Instructions
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Start by depositing an amount of a stablecoin of your choosing.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Based on how much you deposited, you purchase a portion of your earned SOLACE tokens.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - In other words, you are paying for your token rewards, at $0.03 per SOLACE.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - You will then redeem your purchased SOLACE tokens in a linear vesting schedule.
        </Text>
        <ModalRow style={{ display: 'block' }}>
          <StyledSelect value={stablecoinPayment} onChange={handleSelect} options={stablecoins} />
        </ModalRow>
        <FlexRow mt={20} mb={20} style={{ textAlign: 'center', position: 'relative' }}>
          <Input
            widthP={100}
            minLength={1}
            maxLength={79}
            autoComplete="off"
            autoCorrect="off"
            inputMode="decimal"
            placeholder="0.0"
            textAlignCenter
            type="text"
            onChange={(e) => handleInputChange(e.target.value)}
            value={amount}
          />
          <Button info ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30} onClick={_setMax}>
            MAX
          </Button>
        </FlexRow>
        <FormRow mb={10}>
          <FormCol bold>My balance</FormCol>
          <FormCol bold textAlignRight info>
            {truncateBalance(formatUnits(userStablecoinBalance, userStablecoinDecimals), userStablecoinDecimals, false)}{' '}
            {stablecoinPayment.label}
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol bold>Unclaimed SOLACE rewards</FormCol>
          <FormCol bold textAlignRight info>
            {totalUserRewards} SOLACE
          </FormCol>
        </FormRow>
        <HorizRule />
        <FormRow mt={20}>
          <FormCol bold>SOLACE tokens you can buy</FormCol>
          <FormCol bold textAlignRight>
            {formatUnits(purchasableSolace, currencyDecimals)} SOLACE
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol bold>Amount of redeemable SOLACE</FormCol>
          <FormCol bold textAlignRight>
            {formatUnits(redeemableAmount, currencyDecimals)} SOLACE
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol bold>Vesting Term</FormCol>
          <FormCol bold textAlignRight>
            {getLongtimeFromMillis(parseInt(vestingTerm.toString()) * 1000)}
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol bold>Deadline to create options</FormCol>
          <FormCol bold textAlignRight>
            {getDateStringWithMonthName(new Date(parseInt(deadline.toString()) * 1000))}
          </FormCol>
        </FormRow>
        <ButtonWrapper isColumn={width <= BKPT_4}>
          <Button widthP={100} info>
            Create Option
          </Button>
          <Button widthP={100} info>
            Redeem Rewards
          </Button>
        </ButtonWrapper>
      </Card>
    </FlexCol>
  )
}
