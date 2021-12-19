/*

  Table of Contents:

  import packages
  import constants
  import managers
  import components
  import hooks
  import utils

  V1RewardsWindow
      custom hooks
      local functions
      useEffect hooks

*/

/* import packages */
import React, { useState, useEffect, useMemo } from 'react'
import useDebounce from '@rooks/use-debounce'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'

/* import constants */
import { /*ExplorerscanApi, */ FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { BKPT_5, ZERO } from '../../constants'
import IERC20 from '../../constants/metadata/IERC20Metadata.json'
import { FunctionGasLimits } from '../../constants/mappings/gasMapping'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useNotifications } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { Input } from '../atoms/Input'
import { FlexCol, FlexRow, HorizRule } from '../atoms/Layout'
import { ModalRow } from '../atoms/Modal'
import { StyledSelect } from '../molecules/Select'
import { Box, BoxItem, BoxItemTitle, SmallBox } from '../atoms/Box'
import { Text } from '../atoms/Typography'
import { FormRow, FormCol } from '../atoms/Form'
import { Loader } from '../atoms/Loader'
import { SourceContract } from './SourceContract'

/* import hooks */
import { useInputAmount } from '../../hooks/useInputAmount'
import { useTokenAllowance } from '../../hooks/useToken'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useV1FarmRewards } from '../../hooks/useFarm'

/* import utils */
import { getDateStringWithMonthName } from '../../utils/time'
import { queryBalance, queryDecimals } from '../../utils/contract'
import { truncateBalance } from '../../utils/formatting'
import { getContract, isAddress } from '../../utils'

export const V1RewardsWindow: React.FC = () => {
  /* 
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { farmRewards } = useMemo(() => keyContracts, [keyContracts])
  const { library, account } = useWallet()
  const { chainId, currencyDecimals } = useNetwork()
  const { makeTxToast } = useNotifications()
  const { reload } = useCachedData()
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
  const stablecoins = useMemo(
    () => [
      { value: `${USDC_ADDRESS[chainId]}`, label: 'USDC' },
      { value: `${USDT_ADDRESS[chainId]}`, label: 'USDT' },
      { value: `${DAI_ADDRESS[chainId]}`, label: 'DAI' },
      { value: `${FRAX_ADDRESS[chainId]}`, label: 'FRAX' },
    ],
    [chainId]
  )
  const { width } = useWindowDimensions()

  const [stablecoinPayment, setStablecoinPayment] = useState(stablecoins[0])
  const [stablecoinUnsupported, setStablecoinUnsupported] = useState<boolean>(false)
  const [userStablecoinBalance, setUserStablecoinBalance] = useState<BigNumber>(ZERO)
  const [userStablecoinDecimals, setUserStablecoinDecimals] = useState<number>(0)

  const [vestingStart, setVestingStart] = useState<BigNumber>(ZERO)
  const [vestingEnd, setVestingEnd] = useState<BigNumber>(ZERO)

  const {
    totalEarnedSolaceRewards,
    totalEarnedXSolaceRewards,
    purchaseableVestedSolace,
    purchaseableVestedXSolace,
    redeemedSolaceRewards,
    redeemedXSolaceRewards,
    unredeemedSolaceRewards,
    unredeemedXSolaceRewards,
  } = useV1FarmRewards()
  const [pVestedXSolace_Stablecoin, setPVestedXSolace_Stablecoin] = useState<BigNumber | undefined>(ZERO)
  const [calculatedAmountOut, setCalculatedAmountOut] = useState<BigNumber | undefined>(ZERO)

  const [buttonLoading, setButtonLoading] = useState<boolean>(false)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, userStablecoinDecimals).toString() : '0'
  )

  const vestingStartString = useMemo(
    () => getDateStringWithMonthName(new Date(parseInt(vestingStart.toString()) * 1000)),
    [vestingStart]
  )
  const vestingEndString = useMemo(() => getDateStringWithMonthName(new Date(parseInt(vestingEnd.toString()) * 1000)), [
    vestingEnd,
  ])

  /*

  contract functions

  */

  const approve = async () => {
    if (!farmRewards || !account || !isAddress(stablecoinPayment.value) || !library) return
    const stablecoinContract = getContract(stablecoinPayment.value, IERC20.abi, library, account)
    try {
      const tx = await stablecoinContract.approve(farmRewards.address, parseUnits(amount, userStablecoinDecimals))
      const txHash = tx.hash
      setButtonLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, txHash)
        reload()
      })
      setButtonLoading(false)
    } catch (err) {
      handleContractCallError('approve', err, FunctionName.APPROVE)
    }
  }

  const callRedeem = async () => {
    if (!farmRewards || !account || !isAddress(stablecoinPayment.value) || !library) return
    try {
      const stablecoinContract = getContract(stablecoinPayment.value, IERC20.abi, library, account)
      const tx = await farmRewards.redeem(stablecoinContract.address, parseUnits(amount, userStablecoinDecimals), {
        ...gasConfig,
        gasLimit: FunctionGasLimits['farmRewards.redeem'],
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REWARDS_REDEEM,
        value: 'Redeeming rewards',
        status: TransactionCondition.PENDING,
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callRedeem', err, FunctionName.REWARDS_REDEEM)
    }
  }

  /*

  local functions

  */

  const handleSelect = (s: any) => setStablecoinPayment(s)

  const _setMax = () => {
    if (!pVestedXSolace_Stablecoin) return
    if (pVestedXSolace_Stablecoin.gt(userStablecoinBalance)) {
      setMax(userStablecoinBalance, userStablecoinDecimals)
    } else {
      setMax(pVestedXSolace_Stablecoin, userStablecoinDecimals)
    }
  }

  const _getBalance = useDebounce(async () => {
    if (!library || !account) return
    if (!isAddress(stablecoinPayment.value)) {
      setUserStablecoinDecimals(0)
      setUserStablecoinBalance(ZERO)
      setStablecoinUnsupported(true)
      return
    }
    const stablecoinContract = getContract(stablecoinPayment.value, IERC20.abi, library, account)
    const balance = await queryBalance(stablecoinContract, account)
    const decimals = await queryDecimals(stablecoinContract)
    setUserStablecoinDecimals(decimals)
    setUserStablecoinBalance(balance)
    setContractForAllowance(stablecoinContract)
    setStablecoinUnsupported(false)
  }, 300)

  const _checkAmount = useDebounce(async () => {
    if (!farmRewards || !isAddress(stablecoinPayment.value) || buttonLoading) return
    setButtonLoading(true)
    try {
      const calculatedAmountOut = await farmRewards.calculateAmountOut(
        stablecoinPayment.value,
        parseUnits(amount, userStablecoinDecimals)
      )
      setCalculatedAmountOut(calculatedAmountOut)
      const isApproriateAmount = isAppropriateAmount(amount, userStablecoinDecimals, userStablecoinBalance)
      const calc_aO_Acceptable = calculatedAmountOut ? calculatedAmountOut.lte(purchaseableVestedXSolace) : false
      const isAcceptable = isApproriateAmount && calc_aO_Acceptable
      setIsAcceptableAmount(isAcceptable)
      setButtonLoading(false)
    } catch (e) {
      setCalculatedAmountOut(undefined)
      setIsAcceptableAmount(false)
      setButtonLoading(false)
    }
  }, 300)

  /*

  useEffect Hooks

  */

  useEffect(() => {
    _getBalance()
    resetAmount()
  }, [stablecoinPayment, library, account])

  useEffect(() => {
    _checkAmount()
  }, [stablecoinPayment, userStablecoinDecimals, userStablecoinBalance, amount, purchaseableVestedXSolace])

  useEffect(() => {
    const getFarmRewardsData = async () => {
      if (!farmRewards) return
      const vestingStart = await farmRewards.vestingStart()
      const vestingEnd = await farmRewards.vestingEnd()
      setVestingStart(vestingStart)
      setVestingEnd(vestingEnd)
      setSpenderAddress(farmRewards.address)
    }
    getFarmRewardsData()
  }, [farmRewards])

  useEffect(() => {
    ;(async () => {
      if (!farmRewards || !isAddress(stablecoinPayment.value)) return
      try {
        const pVestedXSolace_Stablecoin = await farmRewards.calculateAmountIn(
          stablecoinPayment.value,
          purchaseableVestedXSolace
        )
        setPVestedXSolace_Stablecoin(pVestedXSolace_Stablecoin)
      } catch (e) {
        setPVestedXSolace_Stablecoin(undefined)
      }
    })()
  }, [farmRewards, purchaseableVestedXSolace, stablecoinPayment.value])

  return (
    <FlexCol>
      <Card style={{ margin: 'auto' }}>
        <Box glow success mb={20}>
          <BoxItem style={{ textAlign: 'center' }}>
            <BoxItemTitle t2 bold light mb={10}>
              Attention, early capital providers!
            </BoxItemTitle>
            <Text t4 light>
              You can redeem rewards if you participated in our early incentive pools.
            </Text>
          </BoxItem>
        </Box>
        <Text t4 mb={10} bold textAlignCenter autoAlignHorizontal>
          Instructions
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Starting on {vestingStart.gt(ZERO) ? vestingStartString : `-`}, your earned SOLACE tokens are automatically
          staked and vested.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Pay stablecoins to receive your token rewards in xSOLACE.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Vested tokens unlock linearly over 6 months.
        </Text>
        <ModalRow style={{ display: 'block' }}>
          <StyledSelect value={stablecoinPayment} onChange={handleSelect} options={stablecoins} />
        </ModalRow>
        <SmallBox
          jc={'center'}
          transparent
          errorBorder
          collapse={!stablecoinUnsupported}
          mb={stablecoinUnsupported ? 20 : undefined}
        >
          <Text error>Stablecoin unsupported on this network</Text>
        </SmallBox>
        <FlexRow mb={20} style={{ textAlign: 'center', position: 'relative' }}>
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
            onChange={(e) => handleInputChange(e.target.value, userStablecoinDecimals)}
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
        <FormRow mb={20}>
          <FormCol bold>You will get</FormCol>
          <FormCol bold textAlignRight info>
            {calculatedAmountOut ? `${truncateBalance(formatUnits(calculatedAmountOut, 18), 18, false)} xSOLACE` : `-`}
          </FormCol>
        </FormRow>
        <HorizRule />
        <FormRow mt={20} mb={0}>
          <FormCol bold>Amount you can redeem now</FormCol>
          <FormCol bold textAlignRight info>
            {truncateBalance(formatUnits(purchaseableVestedXSolace, currencyDecimals), 4, false)} xSOLACE
          </FormCol>
        </FormRow>
        <FormRow mb={10}>
          <FormCol></FormCol>
          <FormCol>
            <Text t4 textAlignRight>
              {'( '}
              {truncateBalance(formatUnits(purchaseableVestedSolace, currencyDecimals), 4, false)} SOLACE
              {' )'}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={0}>
          <FormCol bold>Amount already redeemed</FormCol>
          <FormCol bold textAlignRight info>
            {truncateBalance(formatUnits(redeemedXSolaceRewards, currencyDecimals), 4, false)} xSOLACE
          </FormCol>
        </FormRow>
        <FormRow mb={10}>
          <FormCol></FormCol>
          <FormCol>
            <Text t4 textAlignRight>
              {'( '}
              {truncateBalance(formatUnits(redeemedSolaceRewards, currencyDecimals), 4, false)} SOLACE
              {' )'}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={0}>
          <FormCol bold>Your total earned amount</FormCol>
          <FormCol bold textAlignRight info>
            {truncateBalance(formatUnits(totalEarnedXSolaceRewards, currencyDecimals), 4, false)} xSOLACE
          </FormCol>
        </FormRow>
        <FormRow mb={10}>
          <FormCol></FormCol>
          <FormCol>
            <Text t4 textAlignRight>
              {'( '}
              {truncateBalance(formatUnits(totalEarnedSolaceRewards, currencyDecimals), 4, false)} SOLACE
              {' )'}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={0}>
          <FormCol bold>Amount still vesting</FormCol>
          <FormCol bold textAlignRight info>
            {truncateBalance(formatUnits(unredeemedXSolaceRewards, currencyDecimals), 4, false)} xSOLACE
          </FormCol>
        </FormRow>
        <FormRow mb={10}>
          <FormCol></FormCol>
          <FormCol>
            <Text t4 textAlignRight>
              {'( '}
              {truncateBalance(formatUnits(unredeemedSolaceRewards, currencyDecimals), 4, false)} SOLACE
              {' )'}
            </Text>
          </FormCol>
        </FormRow>
        <HorizRule />
        <FormRow mb={10}>
          <FormCol t4>Start of Vesting Term</FormCol>
          <FormCol t4 textAlignRight>
            {vestingStart.gt(ZERO) ? vestingStartString : `-`}
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol t4>End of Vesting Term</FormCol>
          <FormCol t4 textAlignRight>
            {vestingEnd.gt(ZERO) ? vestingEndString : `-`}
          </FormCol>
        </FormRow>
        {buttonLoading ? (
          <Loader />
        ) : (
          <ButtonWrapper isColumn={width <= BKPT_5}>
            {!approval && (
              <Button
                widthP={100}
                info
                disabled={!isAcceptableAmount || haveErrors || stablecoinUnsupported}
                onClick={approve}
              >
                Approve
              </Button>
            )}
            <Button
              widthP={100}
              info
              disabled={haveErrors || !isAcceptableAmount || !approval || stablecoinUnsupported}
              onClick={callRedeem}
            >
              Redeem Rewards
            </Button>
          </ButtonWrapper>
        )}
        {farmRewards && <SourceContract contract={farmRewards} />}
      </Card>
    </FlexCol>
  )
}
