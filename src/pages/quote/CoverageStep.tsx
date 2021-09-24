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
import { Heading2, Heading3, Text4, TextSpan } from '../../components/atoms/Typography'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { FlexCol, FlexRow } from '../../components/atoms/Layout'
import { StyledTooltip } from '../../components/molecules/Tooltip'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerPolicy } from '../../hooks/usePolicy'
import { useGasConfig } from '../../hooks/useFetchGasPrice'

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
      if (cv.type == 'erc20') return pv.add((cv.position as Token).eth.balance)
      if (cv.type == 'liquity') return pv.add((cv.position as LiquityPosition).amount)
    }, ZERO)
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
        encodeAddresses(
          positions.reduce((pv: string[], cv: Token) => {
            pv.push(cv.token.address)
            return pv
          }, [])
        ),
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

    // if number is greater than the max cover per user, do not update
    if (parseFloat(filtered) > parseFloat(maxCoverPerPolicy)) return

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

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    setMaxCover()
  }, [maxCoverPerPolicy])

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
            <Heading2 high_em>
              Total Assets{' '}
              <StyledTooltip
                id={`total-assets`}
                tip={`The sum of amounts from your chosen positions denominated in ${activeNetwork.nativeCurrency.symbol}`}
              />
            </Heading2>
          </FormCol>
          <FormCol>
            <Heading2 high_em textAlignRight>
              {formatUnits(positionAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
            </Heading2>
          </FormCol>
        </FormRow>
        <FormRow mb={15}>
          <FormCol>
            <Heading3 high_em>
              Max Coverage{' '}
              <StyledTooltip
                id={`max-coverage`}
                tip={`Each policy can only cover up to a certain amount based on the size of the capital pool and active cover`}
              />
            </Heading3>
          </FormCol>
          <FormCol>
            <Heading3 high_em textAlignRight>
              {maxCoverPerPolicy} {activeNetwork.nativeCurrency.symbol}
            </Heading3>
          </FormCol>
        </FormRow>
        <hr style={{ marginBottom: '10px' }} />
        <FlexCol mb={20} style={{ padding: '10px 30px' }}>
          <div style={{ textAlign: 'center' }}>
            <Heading3 high_em>Coverage Amount</Heading3>
            <Text4 low_em>How much do you want to cover?</Text4>
            <div style={{ marginBottom: '20px' }}>
              <Input
                mt={20}
                mb={5}
                textAlignCenter
                type="text"
                value={inputCoverage}
                onChange={(e) => handleInputCoverage(filteredAmount(e.target.value, inputCoverage))}
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
            <StyledSlider
              value={coverAmount}
              onChange={(e) => handleCoverageChange(e.target.value)}
              min={1}
              max={maxCoverPerPolicyInWei.toString()}
            />
          </div>
          <br />
          <div style={{ textAlign: 'center' }}>
            <Heading3 high_em>Coverage Period</Heading3>
            <Text4 low_em>How many days should the coverage last?</Text4>
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
            <Text4>Covered Assets</Text4>
          </FormCol>
          <FormCol>
            <FlexRow>
              <Text4 high_em bold>
                {coveredAssets} {activeNetwork.nativeCurrency.symbol}
              </Text4>
            </FlexRow>
          </FormCol>
        </FormRow>
        <FormRow mb={5}>
          <FormCol>
            <Text4>Covered Period</Text4>
          </FormCol>
          <FormCol>
            <Text4 high_em>
              <TextSpan nowrap pl={5} pr={5}>
                {getDateStringWithMonthName(new Date(Date.now()))}
              </TextSpan>{' '}
              -{' '}
              <TextSpan pl={5} pr={5}>
                {getDateStringWithMonthName(getDateExtended(parseFloat(timePeriod || '1')))}
              </TextSpan>
            </Text4>
          </FormCol>
        </FormRow>
        <FormRow mb={5}>
          <FormCol>
            <Text4>Quote</Text4>
          </FormCol>
          <FormCol>
            <Text4 bold high_em>
              {quote} {activeNetwork.nativeCurrency.symbol}
            </Text4>
          </FormCol>
        </FormRow>
        <ButtonWrapper>
          {!loading ? (
            <Button
              widthP={100}
              onClick={() => buyPolicy()}
              disabled={errors.length > 0 || !inputCoverage || inputCoverage == '.'}
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
          <Heading3 high_em>Terms and conditions</Heading3>
        </FormRow>
        <FormRow mb={0}>
          <FormCol>
            <Text4>
              <b>Events covered:</b>
              <ul>
                <li>Contract bugs</li>
                <li>Economic attacks, including oracle failures</li>
                <li>Governance attacks</li>
              </ul>
              This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace
              protocol and the decentralized governance has the final say on which claims are paid.
            </Text4>
          </FormCol>
        </FormRow>
      </Card>
    </CardContainer>
  )
}
