/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    CoverageStep function
      custom hooks
      useState hooks
      Contract functions
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useMemo, useState } from 'react'

/* import packages */
import { Slider } from '@rebass/forms'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

/* import constants */
import { DAYS_PER_YEAR, GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../../constants'
import { TransactionCondition, FunctionName, Unit } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Card, CardContainer } from '../../components/atoms/Card'
import { Heading2, Text3, TextSpan } from '../../components/atoms/Typography'
import { Input } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { SmallBox } from '../../components/atoms/Box'
import { FlexCol, FlexRow } from '../../components/atoms/Layout'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerUser } from '../../hooks/usePolicy'

/* import utils */
import { accurateMultiply, getGasValue } from '../../utils/formatting'
import { getDateStringWithMonthName, getDateExtended } from '../../utils/time'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { position, coverAmount, timePeriod, loading } = formData
  const maxCoverPerUser = useGetMaxCoverPerUser() // in eth
  const quote = useGetQuote(coverAmount, position.token.address, timePeriod)
  const { account, errors, activeWalletConnector } = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()
  const { activeNetwork, currencyDecimals } = useNetwork()

  const maxCoverPerUserInWei = useMemo(() => {
    return parseUnits(maxCoverPerUser, currencyDecimals)
  }, [maxCoverPerUser, currencyDecimals])

  // positionAmount: BigNumber = wei but displayable, position.eth.balance: BigNumber = wei
  const positionAmount: BigNumber = useMemo(() => {
    return BigNumber.from(accurateMultiply(formatUnits(position.eth.balance, currencyDecimals), currencyDecimals))
  }, [position.eth.balance, currencyDecimals])

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [inputCoverage, setInputCoverage] = useState<string>('')
  const [coveredAssets, setCoveredAssets] = useState<string>(maxCoverPerUser)

  /*************************************************************************************

  Contract functions

  *************************************************************************************/

  const buyPolicy = async () => {
    setForm({
      target: {
        name: 'loading',
        value: true,
      },
    })
    if (!selectedProtocol || !activeWalletConnector) return
    const txType = FunctionName.BUY_POLICY
    try {
      const gasConfig = activeWalletConnector.supportedTxTypes.includes(2)
        ? {
            maxFeePerGas: getGasValue(gasPrices.selected.value),
            type: 2,
          }
        : activeWalletConnector.supportedTxTypes.includes(0) && {
            gasPrice: getGasValue(gasPrices.selected.value),
          }
      const tx = await selectedProtocol.buyPolicy(
        account,
        position.token.address,
        coverAmount,
        NUM_BLOCKS_PER_DAY * parseInt(timePeriod),
        {
          value: parseUnits(quote, currencyDecimals),
          ...gasConfig,
          gasLimit: GAS_LIMIT,
        }
      )
      navigation.next()
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        value: 'Policy',
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
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
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
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

  Local functions

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
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than the max cover per user, do not update
    if (parseFloat(filtered) > parseFloat(maxCoverPerUser)) return

    // if number is greater than the position amount, do not update
    if (parseFloat(filtered) > parseFloat(formatUnits(positionAmount, currencyDecimals))) return

    // if number is empty or less than smallest denomination of currency, do not update
    if (filtered == '' || parseFloat(filtered) < parseFloat(formatUnits(BigNumber.from(1), currencyDecimals))) return

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > currencyDecimals) return

    setInputCoverage(filtered)
    setCoverage(accurateMultiply(filtered, currencyDecimals))
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

  const handleCoverageChange = (coverAmount: string) => {
    setInputCoverage(formatUnits(BigNumber.from(coverAmount), currencyDecimals))
    setCoverage(coverAmount)
  }

  const setMaxCover = () => {
    const adjustedCoverAmount = maxCoverPerUserInWei.gt(positionAmount)
      ? positionAmount.toString()
      : maxCoverPerUserInWei.toString()
    handleCoverageChange(adjustedCoverAmount)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    setMaxCover()
  }, [maxCoverPerUser])

  useEffect(() => {
    setCoveredAssets(formatUnits(BigNumber.from(coverAmount), currencyDecimals))
  }, [coverAmount, currencyDecimals])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <CardContainer cardsPerRow={2}>
      <Card>
        <FormRow mb={15}>
          <FormCol>
            <Heading2>Total Assets</Heading2>
            {position.underlying.symbol !== activeNetwork.nativeCurrency.symbol && (
              <Text3>Denominated from {position.underlying.symbol}</Text3>
            )}
          </FormCol>
          <FormCol>
            <Heading2>{formatUnits(positionAmount, currencyDecimals)}</Heading2>
            <Text3 textAlignRight>{activeNetwork.nativeCurrency.symbol}</Text3>
          </FormCol>
        </FormRow>
        <hr style={{ marginBottom: '10px' }} />
        <FlexCol mb={20} style={{ padding: '10px 30px' }}>
          <div style={{ textAlign: 'center' }}>
            <Heading2>Coverage Amount</Heading2>
            <Text3>How much do you want to cover?</Text3>
            <div>
              <Input
                mt={20}
                mb={5}
                textAlignCenter
                type="text"
                value={inputCoverage}
                onChange={(e) => handleInputCoverage(e.target.value)}
              />
              <Button
                disabled={errors.length > 0}
                ml={10}
                pt={4}
                pb={4}
                pl={8}
                pr={8}
                width={79}
                height={30}
                onClick={() => setMaxCover()}
              >
                MAX
              </Button>
            </div>
            <Slider
              backgroundColor={'#fff'}
              value={coverAmount}
              onChange={(e) => handleCoverageChange(e.target.value)}
              min={1}
              max={positionAmount.toString()}
            />
          </div>
          <br />
          <div style={{ textAlign: 'center' }}>
            <Heading2>Coverage Period</Heading2>
            <Text3>How many days should the coverage last?</Text3>
            <div>
              <Input
                mt={20}
                mb={5}
                textAlignCenter
                type="text"
                pattern="[0-9]+"
                value={timePeriod}
                onChange={(e) => filteredTime(e.target.value)}
                maxLength={3}
              />
              <Slider
                backgroundColor={'#fff'}
                value={timePeriod == '' ? '1' : timePeriod}
                onChange={(e) => setTime(e.target.value)}
                min="1"
                max={DAYS_PER_YEAR}
              />
            </div>
          </div>
        </FlexCol>
        <hr style={{ marginBottom: '20px' }} />
        <FormRow mb={5}>
          <FormCol>
            <Text3>Covered Assets</Text3>
          </FormCol>
          <FormCol>
            <FlexRow>
              <Text3
                bold
                error={
                  parseUnits(coveredAssets, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals)) &&
                  maxCoverPerUser !== '0'
                }
              >
                {coveredAssets} {activeNetwork.nativeCurrency.symbol}
              </Text3>
            </FlexRow>
          </FormCol>
        </FormRow>
        <SmallBox
          transparent
          outlined
          error
          collapse={!parseUnits(coveredAssets, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals))}
          mb={!parseUnits(coveredAssets, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals)) ? 0 : 5}
        >
          <Text3 error autoAlign>
            You can only cover up to {maxCoverPerUser} {activeNetwork.nativeCurrency.symbol}.
          </Text3>
        </SmallBox>
        <FormRow mb={5}>
          <FormCol>
            <Text3>Covered Period</Text3>
          </FormCol>
          <FormCol>
            <Text3>
              <TextSpan nowrap pl={5} pr={5}>
                {getDateStringWithMonthName(new Date(Date.now()))}
              </TextSpan>{' '}
              -{' '}
              <TextSpan pl={5} pr={5}>
                {getDateStringWithMonthName(getDateExtended(parseFloat(timePeriod || '1')))}
              </TextSpan>
            </Text3>
          </FormCol>
        </FormRow>
        <FormRow mb={5}>
          <FormCol>
            <Text3>Quote</Text3>
          </FormCol>
          <FormCol>
            <Text3 bold>
              {quote} {activeNetwork.nativeCurrency.symbol}
            </Text3>
          </FormCol>
        </FormRow>
        <ButtonWrapper>
          {!loading ? (
            <Button
              widthP={100}
              onClick={() => buyPolicy()}
              disabled={
                errors.length > 0 ||
                parseUnits(coveredAssets, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals))
              }
            >
              Buy
            </Button>
          ) : (
            <Loader />
          )}
        </ButtonWrapper>
      </Card>
      <Card transparent>
        <FormRow>
          <Heading2>Terms and conditions</Heading2>
        </FormRow>
        <FormRow mb={0}>
          <FormCol>
            <Text3>
              <b>Events covered:</b>
              <ul>
                <li>Contract bugs</li>
                <li>Economic attacks, including oracle failures</li>
                <li>Governance attacks</li>
              </ul>
              This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace
              protocol and the decentralized governance has the final say on which claims are paid.
            </Text3>
          </FormCol>
        </FormRow>
      </Card>
    </CardContainer>
  )
}
