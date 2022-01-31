/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    CoverageStep
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useEffect, useMemo, useState } from 'react'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, ZERO } from '../../constants'
import { TransactionCondition, FunctionName, PositionType } from '../../constants/enums'
import { LiquityPosition, LocalTx, Position, Token } from '../../constants/types'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'

/* import components */
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Card } from '../../components/atoms/Card'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { FlexCol, FlexRow, HorizRule } from '../../components/atoms/Layout'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerPolicy } from '../../hooks/usePolicy'
import { useGetFunctionGas } from '../../hooks/useGas'

/* import utils */
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  encodeAddresses,
  filterAmount,
  formatAmount,
} from '../../utils/formatting'
import { getDateStringWithMonthName, getDateExtended } from '../../utils/time'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { protocol, positions, coverAmount, timePeriod, loading } = formData
  const maxCoverPerPolicy = useGetMaxCoverPerPolicy() // in eth
  const quote = useGetQuote(coverAmount, timePeriod)
  const { account } = useWallet()
  const { addLocalTransactions, reload } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useNotifications()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { gasConfig, getSupportedProductGasLimit } = useGetFunctionGas()
  const maxCoverPerPolicyInWei = useMemo(() => parseUnits(maxCoverPerPolicy, currencyDecimals), [
    maxCoverPerPolicy,
    currencyDecimals,
  ])

  // positionAmount: BigNumber = wei but displayable, position.eth.balance: BigNumber = wei
  const positionAmount: BigNumber = useMemo(() => {
    const totalBalance = positions.reduce((pv: BigNumber, cv: Position) => {
      switch (cv.type) {
        case PositionType.TOKEN:
          return pv.add((cv.position as Token).eth.balance)
        case PositionType.LQTY:
          return pv.add((cv.position as LiquityPosition).nativeAmount)
        case PositionType.OTHER:
        default:
          ZERO
      }
    }, ZERO)
    if (totalBalance.isZero()) return ZERO
    return BigNumber.from(accurateMultiply(formatUnits(totalBalance, currencyDecimals), currencyDecimals))
  }, [positions, currencyDecimals])

  const [inputCoverage, setInputCoverage] = useState<string>('')
  const [coveredAssets, setCoveredAssets] = useState<string>(maxCoverPerPolicy)

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const buyPolicy = async () => {
    if (!selectedProtocol) return
    setForm({
      target: {
        name: 'loading',
        value: true,
      },
    })
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await selectedProtocol.buyPolicy(
        account,
        coverAmount,
        NUM_BLOCKS_PER_DAY * parseInt(timePeriod),
        encodeAddresses(
          positions.reduce((pv: string[], cv: Position) => {
            switch (cv.type) {
              case PositionType.TOKEN:
                pv.push((cv.position as Token).token.address)
                break
              case PositionType.LQTY:
                pv.push((cv.position as LiquityPosition).positionAddress)
                break
              case PositionType.OTHER:
              default:
            }
            return pv
          }, [])
        ),
        {
          value: parseUnits(quote, currencyDecimals),
          ...gasConfig,
          gasLimit: getSupportedProductGasLimit(protocol.name, txType),
        }
      )
      navigation.next()
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        status: TransactionCondition.PENDING,
      }
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('buyPolicy', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      reload()
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const setTime = (timePeriod: string) => {
    setForm({
      target: {
        name: 'timePeriod',
        value: timePeriod,
      },
    })
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if ((parseFloat(filtered) <= DAYS_PER_YEAR && parseFloat(filtered) > 0) || filtered == '') {
      setTime(filtered)
    }
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, inputCoverage)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > currencyDecimals) return

    // if number is greater than the max cover per user, do not update
    if (parseUnits(formatted, currencyDecimals).gt(maxCoverPerPolicyInWei)) return

    setInputCoverage(filtered)
    setCoverage(accurateMultiply(formatted, currencyDecimals))
  }

  // coverAmount in wei
  const setCoverage = (coverAmount: string) => {
    setForm({
      target: {
        name: 'coverAmount',
        value: coverAmount,
      },
    })
  }

  const handleCoverageChange = (coverAmount: string, convertFromSciNota = true) => {
    setInputCoverage(
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(coverAmount) : coverAmount}`),
        currencyDecimals
      )
    )
    setCoverage(`${convertFromSciNota ? convertSciNotaToPrecise(coverAmount) : coverAmount}`)
  }

  const setMaxCover = () => {
    const adjustedCoverAmount = maxCoverPerPolicyInWei.toString()
    handleCoverageChange(adjustedCoverAmount, false)
  }

  const setPositionCover = () => {
    if (positionAmount.lte(maxCoverPerPolicyInWei)) {
      handleCoverageChange(positionAmount.toString())
    } else {
      setMaxCover()
    }
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    setPositionCover()
  }, [maxCoverPerPolicyInWei])

  useEffect(() => {
    setCoveredAssets(formatUnits(BigNumber.from(coverAmount), currencyDecimals))
  }, [coverAmount, currencyDecimals])

  return (
    <Card style={{ margin: 'auto' }}>
      <FormRow mb={5}>
        <FormCol>
          <Text bold t2>
            Total Assets
          </Text>
        </FormCol>
        <FormCol>
          <Text bold t2 textAlignRight info>
            {formatUnits(positionAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
          </Text>
        </FormCol>
      </FormRow>
      <FormRow mb={15}>
        <FormCol>
          <Text t3>Max Coverage</Text>
        </FormCol>
        <FormCol>
          <Text t3 textAlignRight info>
            {maxCoverPerPolicy} {activeNetwork.nativeCurrency.symbol}
          </Text>
        </FormCol>
      </FormRow>
      <HorizRule mb={10} />
      <FlexCol mb={20} style={{ padding: '10px 30px' }}>
        <div style={{ textAlign: 'center' }}>
          <Text t3>Coverage Amount</Text>
          <Text t4>How much do you want to cover?</Text>
          <div style={{ marginBottom: '20px' }}>
            <Input
              mt={20}
              mb={5}
              textAlignCenter
              type="text"
              value={inputCoverage}
              onChange={(e) => handleInputCoverage(e.target.value)}
              info
            />
            {maxCoverPerPolicyInWei.gt(positionAmount) && (
              <Button
                disabled={haveErrors}
                ml={10}
                pt={4}
                pb={4}
                pl={2}
                pr={2}
                width={120}
                height={30}
                onClick={setPositionCover}
                info
              >
                Cover to position
              </Button>
            )}
            <Button
              disabled={haveErrors}
              ml={10}
              pt={4}
              pb={4}
              pl={8}
              pr={8}
              width={70}
              height={30}
              onClick={setMaxCover}
              info
            >
              MAX
            </Button>
          </div>
          <StyledSlider
            value={coverAmount}
            onChange={(e) => handleCoverageChange(e.target.value)}
            min={1}
            max={maxCoverPerPolicyInWei.toString()}
          />
        </div>
        <br />
        <div style={{ textAlign: 'center' }}>
          <Text t3>Coverage Period</Text>
          <Text t4>How many days should the coverage last?</Text>
          <div style={{ marginBottom: '20px' }}>
            <Input
              mt={20}
              mb={5}
              textAlignCenter
              type="text"
              pattern="[0-9]+"
              value={timePeriod}
              onChange={(e) => filteredTime(e.target.value)}
              maxLength={3}
              info
            />
          </div>
          <StyledSlider
            value={timePeriod == '' ? '1' : timePeriod}
            onChange={(e) => setTime(e.target.value)}
            min="1"
            max={DAYS_PER_YEAR}
          />
        </div>
      </FlexCol>
      <HorizRule mb={20} />
      <FormRow mb={5}>
        <FormCol>
          <Text t4>Covered Assets</Text>
        </FormCol>
        <FormCol>
          <FlexRow>
            <Text t4 bold info>
              {coveredAssets} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FlexRow>
        </FormCol>
      </FormRow>
      <FormRow mb={5}>
        <FormCol>
          <Text t4>Covered Period</Text>
        </FormCol>
        <FormCol>
          <Text t4>
            <TextSpan nowrap pl={5} pr={5} info>
              {getDateStringWithMonthName(new Date(Date.now()))}
            </TextSpan>{' '}
            <TextSpan info>-</TextSpan>{' '}
            <TextSpan pl={5} pr={5} info>
              {getDateStringWithMonthName(getDateExtended(parseFloat(timePeriod || '1')))}
            </TextSpan>
          </Text>
        </FormCol>
      </FormRow>
      <FormRow mb={5}>
        <FormCol>
          <Text t2 bold>
            Premium
          </Text>
        </FormCol>
        <FormCol>
          <Text t2 bold info>
            {quote} {activeNetwork.nativeCurrency.symbol}
          </Text>
        </FormCol>
      </FormRow>
      <ButtonWrapper>
        {!loading ? (
          <Button widthP={100} onClick={buyPolicy} disabled={haveErrors || coveredAssets == '0.0'} info>
            Buy
          </Button>
        ) : (
          <Loader />
        )}
      </ButtonWrapper>
    </Card>
  )
}
