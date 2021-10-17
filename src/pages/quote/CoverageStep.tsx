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
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

/* import constants */
import { DAYS_PER_YEAR, GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../../constants'
import { TransactionCondition, FunctionName, Unit } from '../../constants/enums'
import { LiquityPosition, LocalTx, Position, Token } from '../../constants/types'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Card, CardContainer } from '../../components/atoms/Card'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { FlexCol, FlexRow } from '../../components/atoms/Layout'
import { StyledTooltip } from '../../components/molecules/Tooltip'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerPolicy } from '../../hooks/usePolicy'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import { accurateMultiply, encodeAddresses, filteredAmount } from '../../utils/formatting'
import { getDateStringWithMonthName, getDateExtended } from '../../utils/time'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { errors } = useGeneral()
  const { positions, coverAmount, timePeriod, loading } = formData
  const maxCoverPerPolicy = useGetMaxCoverPerPolicy() // in eth
  const quote = useGetQuote(coverAmount, timePeriod)
  const { account } = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
  const maxCoverPerPolicyInWei = useMemo(() => {
    return parseUnits(maxCoverPerPolicy, currencyDecimals)
  }, [maxCoverPerPolicy, currencyDecimals])

  // positionAmount: BigNumber = wei but displayable, position.eth.balance: BigNumber = wei
  const positionAmount: BigNumber = useMemo(() => {
    const totalBalance = positions.reduce((pv: BigNumber, cv: Position) => {
      switch (cv.type) {
        case 'erc20':
          return pv.add((cv.position as Token).eth.balance)
        case 'liquity':
          return pv.add((cv.position as LiquityPosition).nativeAmount)
        case 'other':
        default:
          ZERO
      }
    }, ZERO)
    if (totalBalance.eq(ZERO)) return ZERO
    return BigNumber.from(accurateMultiply(formatUnits(totalBalance, currencyDecimals), currencyDecimals))
  }, [positions, currencyDecimals])

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [inputCoverage, setInputCoverage] = useState<string>('')
  const [coveredAssets, setCoveredAssets] = useState<string>(maxCoverPerPolicy)

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
    if (!selectedProtocol) return
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await selectedProtocol.buyPolicy(
        account,
        coverAmount,
        NUM_BLOCKS_PER_DAY * parseInt(timePeriod),
        encodeAddresses(
          positions.reduce((pv: string[], cv: Position) => {
            switch (cv.type) {
              case 'erc20':
                pv.push((cv.position as Token).token.address)
                break
              case 'liquity':
                pv.push((cv.position as LiquityPosition).positionAddress)
                break
              case 'other':
              default:
            }
            return pv
          }, [])
        ),
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

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = filtered == '0.' || filtered == '.' || filtered == '' ? '0.0' : filtered

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
      formatUnits(BigNumber.from(`${convertFromSciNota ? +coverAmount : coverAmount}`), currencyDecimals)
    )
    setCoverage(`${convertFromSciNota ? +coverAmount : coverAmount}`)
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

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <CardContainer cardsPerRow={2}>
      <Card>
        <FormRow mb={5}>
          <FormCol>
            <Text bold t2>
              Total Assets{' '}
              <StyledTooltip
                id={`total-assets`}
                tip={`The sum of amounts from your chosen positions denominated in ${activeNetwork.nativeCurrency.symbol}`}
              />
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
            <Text t3>
              Max Coverage{' '}
              <StyledTooltip
                id={`max-coverage`}
                tip={`Each policy can only cover up to a certain amount based on the size of the capital pool and active cover`}
              />
            </Text>
          </FormCol>
          <FormCol>
            <Text t3 textAlignRight info>
              {maxCoverPerPolicy} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FormCol>
        </FormRow>
        <hr style={{ marginBottom: '10px' }} />
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
                onChange={(e) => handleInputCoverage(filteredAmount(e.target.value, inputCoverage))}
                info
              />
              {maxCoverPerPolicyInWei.gt(positionAmount) && (
                <Button
                  disabled={errors.length > 0}
                  ml={10}
                  pt={4}
                  pb={4}
                  pl={2}
                  pr={2}
                  width={120}
                  height={30}
                  onClick={() => setPositionCover()}
                  info
                >
                  Cover to position
                </Button>
              )}
              <Button
                disabled={errors.length > 0}
                ml={10}
                pt={4}
                pb={4}
                pl={8}
                pr={8}
                width={70}
                height={30}
                onClick={() => setMaxCover()}
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
        <hr style={{ marginBottom: '20px' }} />
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
            <Text t4>Quote</Text>
          </FormCol>
          <FormCol>
            <Text t4 bold info>
              {quote} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FormCol>
        </FormRow>
        <ButtonWrapper>
          {!loading ? (
            <Button
              widthP={100}
              onClick={() => buyPolicy()}
              disabled={errors.length > 0 || coveredAssets == '0.0'}
              info
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
          <Text t3 bold>
            Terms and conditions
          </Text>
        </FormRow>
        <FormRow mb={0}>
          <FormCol>
            <Text t4>
              <b>Events covered:</b>
              <ul>
                <li>Contract bugs</li>
                <li>Economic attacks, including oracle failures</li>
                <li>Governance attacks</li>
              </ul>
              This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace
              protocol and the decentralized governance has the final say on which claims are paid.
            </Text>
          </FormCol>
        </FormRow>
      </Card>
    </CardContainer>
  )
}
