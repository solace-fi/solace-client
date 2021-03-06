/*

  Table of Contents:

  import packages
  import constants
  import managers
  import components
  import hooks
  import utils

  EarlyFarmRewardsWindow
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
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'

/* import constants */
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { USDC_TOKEN, USDT_TOKEN, DAI_TOKEN, FRAX_TOKEN } from '../../constants/mappings/token'
import { MAX_APPROVAL_AMOUNT, ZERO } from '../../constants'
import { ERC20_ABI } from '../../constants/abi'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { Input } from '../atoms/Input'
import { Flex, HorizRule } from '../atoms/Layout'
import { ModalRow } from '../atoms/Modal'
import { StyledSelect } from '../molecules/Select'
import { Box, BoxItem, BoxItemTitle, SmallBox } from '../atoms/Box'
import { Text } from '../atoms/Typography'
import { Loader } from '../atoms/Loader'

/* import hooks */
import { useInputAmount, useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useTokenAllowance } from '../../hooks/contract/useToken'
import { useEarlyFarmRewards } from '../../hooks/farm/useFarm'
import { useGetFunctionGas } from '../../hooks/provider/useGas'

/* import utils */
import { getDateStringWithMonthName, withBackoffRetries } from '../../utils/time'
import { queryBalance } from '../../utils/contract'
import { truncateValue } from '../../utils/formatting'
import { isAddress } from '../../utils'
import { useProvider } from '../../context/ProviderManager'
import { useWeb3React } from '@web3-react/core'

export const EarlyFarmRewardsWindow: React.FC = () => {
  /* 
  
  custom hooks 
  
  */
  const { haveErrors } = useGeneral()
  const { keyContracts } = useContracts()
  const { farmRewards } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const { signer } = useProvider()
  const { activeNetwork } = useNetwork()
  const { makeTxToast } = useNotifications()
  const { reload } = useCachedData()
  const { gasConfig } = useGetFunctionGas()
  const { amount, isAppropriateAmount, handleInputChange, setMax, resetAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const stablecoins = useMemo(
    () => [
      {
        value: `${USDC_TOKEN.address[activeNetwork.chainId]}`,
        label: USDC_TOKEN.constants.symbol,
        decimals: USDC_TOKEN.constants.decimals,
      },
      {
        value: `${USDT_TOKEN.address[activeNetwork.chainId]}`,
        label: USDT_TOKEN.constants.symbol,
        decimals: USDT_TOKEN.constants.decimals,
      },
      {
        value: `${DAI_TOKEN.address[activeNetwork.chainId]}`,
        label: DAI_TOKEN.constants.symbol,
        decimals: DAI_TOKEN.constants.decimals,
      },
      {
        value: `${FRAX_TOKEN.address[activeNetwork.chainId]}`,
        label: FRAX_TOKEN.constants.symbol,
        decimals: FRAX_TOKEN.constants.decimals,
      },
    ],
    [activeNetwork.chainId]
  )

  const [stablecoinPayment, setStablecoinPayment] = useState(stablecoins[0])
  const [stablecoinUnsupported, setStablecoinUnsupported] = useState<boolean>(false)
  const [userStablecoinBalance, setUserStablecoinBalance] = useState<BigNumber>(ZERO)
  const [userStablecoinDecimals, setUserStablecoinDecimals] = useState<number>(stablecoins[0].decimals)

  const [vestingEnd, setVestingEnd] = useState<BigNumber>(ZERO)

  const { totalEarnedSolaceRewards, purchaseableSolace } = useEarlyFarmRewards()
  const [pSolaceInStablecoin, setPSolaceInStablecoin] = useState<BigNumber | undefined>(ZERO)
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

  const vestingEndString = useMemo(() => getDateStringWithMonthName(new Date(parseInt(vestingEnd.toString()) * 1000)), [
    vestingEnd,
  ])

  /*

  contract functions

  */

  const unlimitedApprove = async () => {
    if (!farmRewards || !isAddress(stablecoinPayment.value) || !signer) return
    const stablecoinContract = new Contract(stablecoinPayment.value, ERC20_ABI, signer)
    try {
      const tx: TransactionResponse = await stablecoinContract.approve(farmRewards.address, MAX_APPROVAL_AMOUNT)
      const txHash = tx.hash
      setButtonLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
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
    if (!farmRewards || !isAddress(stablecoinPayment.value) || !signer) return
    try {
      const stablecoinContract = new Contract(stablecoinPayment.value, ERC20_ABI, signer)
      const estGas = await farmRewards.estimateGas.redeem(
        stablecoinContract.address,
        parseUnits(amount, userStablecoinDecimals)
      )
      console.log('farmRewards.estimateGas.redeem', estGas.toString())
      const tx = await farmRewards.redeem(stablecoinContract.address, parseUnits(amount, userStablecoinDecimals), {
        ...gasConfig,
        // gasLimit: FunctionGasLimits['farmRewards.redeem'],
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REWARDS_REDEEM,
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
    if (!pSolaceInStablecoin) return
    if (pSolaceInStablecoin.gt(userStablecoinBalance)) {
      setMax(userStablecoinBalance, userStablecoinDecimals)
    } else {
      setMax(pSolaceInStablecoin, userStablecoinDecimals)
    }
  }

  const _getBalance = useDebounce(async () => {
    if (!signer || !account) return
    if (!isAddress(stablecoinPayment.value)) {
      setUserStablecoinDecimals(0)
      setUserStablecoinBalance(ZERO)
      setStablecoinUnsupported(true)
      return
    }
    const stablecoinContract = new Contract(stablecoinPayment.value, ERC20_ABI, signer)
    const balance = await queryBalance(stablecoinContract, account)
    setUserStablecoinDecimals(stablecoinPayment.decimals)
    setUserStablecoinBalance(balance)
    setContractForAllowance(stablecoinContract)
    setStablecoinUnsupported(false)
  }, 300)

  const _checkAmount = useDebounce(async () => {
    if (!farmRewards || !isAddress(stablecoinPayment.value) || buttonLoading) return
    setButtonLoading(true)
    try {
      const calculatedAmountOut = await withBackoffRetries(async () =>
        farmRewards.calculateAmountOut(stablecoinPayment.value, parseUnits(amount, userStablecoinDecimals))
      )
      setCalculatedAmountOut(calculatedAmountOut)
      const isApproriateAmount = isAppropriateAmount(amount, userStablecoinDecimals, userStablecoinBalance)
      const calc_aO_Acceptable = calculatedAmountOut ? calculatedAmountOut.lte(purchaseableSolace) : false
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
  }, [stablecoinPayment, account])

  useEffect(() => {
    _checkAmount()
  }, [stablecoinPayment, userStablecoinDecimals, userStablecoinBalance, amount])

  useEffect(() => {
    const getFarmRewardsData = async () => {
      if (!farmRewards) return
      const vestingEnd = await withBackoffRetries(async () => farmRewards.VESTING_END())
      setVestingEnd(vestingEnd)
      setSpenderAddress(farmRewards.address)
    }
    getFarmRewardsData()
  }, [farmRewards])

  useEffect(() => {
    ;(async () => {
      if (!farmRewards || !isAddress(stablecoinPayment.value)) return
      try {
        const pSolace_Stablecoin = await withBackoffRetries(async () =>
          farmRewards.calculateAmountIn(stablecoinPayment.value, purchaseableSolace)
        )
        setPSolaceInStablecoin(pSolace_Stablecoin)
      } catch (e) {
        setPSolaceInStablecoin(undefined)
      }
    })()
  }, [farmRewards, purchaseableSolace, stablecoinPayment.value])

  return (
    <Flex col>
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
          - Your earned SOLACE tokens are automatically staked and vested.
        </Text>
        <Text t4 mb={10} autoAlignHorizontal>
          - Pay stablecoins to migrate your token rewards into a lock.
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
        <Flex mb={20} style={{ textAlign: 'center', position: 'relative' }}>
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
        </Flex>
        <Flex stretch between mb={10}>
          <Text bold>My balance</Text>
          <Text bold textAlignRight info>
            {truncateValue(formatUnits(userStablecoinBalance, userStablecoinDecimals), userStablecoinDecimals, false)}{' '}
            {stablecoinPayment.label}
          </Text>
        </Flex>
        <Flex stretch between mb={20}>
          <Text bold>You will get</Text>
          <Text bold textAlignRight info>
            {calculatedAmountOut ? `${truncateValue(formatUnits(calculatedAmountOut, 18), 18, false)}` : `-`} SOLACE
          </Text>
        </Flex>
        <HorizRule />
        <Flex stretch between mt={20}>
          <Text bold>Amount you can redeem now</Text>
          <Text bold textAlignRight info>
            {truncateValue(formatUnits(purchaseableSolace, activeNetwork.nativeCurrency.decimals), 4, false)} SOLACE
          </Text>
        </Flex>
        <Flex stretch between>
          <Text bold>Your total earned amount</Text>
          <Text bold textAlignRight info>
            {truncateValue(formatUnits(totalEarnedSolaceRewards, activeNetwork.nativeCurrency.decimals), 4, false)}{' '}
            SOLACE
          </Text>
        </Flex>
        <HorizRule />
        <Flex stretch between mb={24}>
          <Text t4>End of Vesting Term</Text>
          <Text t4 textAlignRight>
            {vestingEnd.gt(ZERO) ? vestingEndString : `-`}
          </Text>
        </Flex>
        {buttonLoading ? (
          <Loader />
        ) : (
          <ButtonWrapper>
            {!approval && (
              <Button widthP={100} info disabled={haveErrors || stablecoinUnsupported} onClick={unlimitedApprove}>
                Approve
              </Button>
            )}
            {approval && (
              <Button
                widthP={100}
                info
                disabled={haveErrors || !isAcceptableAmount || stablecoinUnsupported}
                onClick={callRedeem}
              >
                Redeem Rewards
              </Button>
            )}
          </ButtonWrapper>
        )}
      </Card>
    </Flex>
  )
}
