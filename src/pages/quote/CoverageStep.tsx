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
import React, { Fragment, useEffect, useState } from 'react'

/* import packages */
import { Slider } from '@rebass/forms'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

/* import constants */
import { DAYS_PER_YEAR, GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../../constants'
import { TransactionCondition, FunctionName } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'

/* import components */
import { FormRow, FormCol } from '../../components/Input/Form'
import { Button, ButtonWrapper } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Card, CardContainer } from '../../components/Card'
import { Heading2, Text3, TextSpan } from '../../components/Typography'
import { Input } from '../../components/Input'
import { Loader } from '../../components/Loader'
import { SmallBox } from '../../components/Box'
import { FlexRow } from '../../components/Layout'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerUser } from '../../hooks/usePolicy'

/* import utils */
import { getGasValue, getNativeTokenUnit } from '../../utils/formatting'
import { getDateStringWithMonthName, getDateExtended } from '../../utils/time'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { position, coverageLimit, timePeriod, loading } = formData
  const maxCoverPerUser = useGetMaxCoverPerUser() // in eth
  const quote = useGetQuote(coverageLimit, position.token.address, timePeriod)
  const wallet = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [inputCoverage, setInputCoverage] = useState<string>('50')
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
    if (!selectedProtocol) return
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await selectedProtocol.buyPolicy(
        wallet.account,
        position.token.address,
        coverageLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(timePeriod)),
        {
          value: parseEther(quote).add(parseEther(quote).div('10000')),
          gasPrice: getGasValue(gasPrices.selected.value),
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
        unit: getNativeTokenUnit(wallet.chainId),
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
    if (parseFloat(filtered) <= DAYS_PER_YEAR || filtered == '') {
      setTime(filtered)
    }
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than 100, do not update
    if (parseFloat(filtered) > 100) {
      return
    }

    // if number has more than 2 decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) {
      return
    }

    // convert input into BigNumber-compatible data
    const multiplied = filtered == '' ? '100' : Math.round(parseFloat(filtered) * 100).toString()
    setInputCoverage(filtered)
    setCoverage(multiplied)
  }

  const setCoverage = (coverageLimit: string) => {
    setForm({
      target: {
        name: 'coverageLimit',
        value: coverageLimit,
      },
    })
  }

  const handleCoverageChange = (coverageLimit: string) => {
    setInputCoverage((parseInt(coverageLimit) / 100).toString())
    setCoverage(coverageLimit)
  }

  const setMaxCover = () => {
    const maxCoverLimit = parseEther(maxCoverPerUser).mul('10000').div(BigNumber.from(position.eth.balance)).toString()
    const adjustedCoverLimit = BigNumber.from(maxCoverLimit).gt('10000') ? '10000' : maxCoverLimit
    handleCoverageChange(adjustedCoverLimit)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    setMaxCover()
  }, [maxCoverPerUser])

  useEffect(() => {
    setCoveredAssets(
      formatEther(
        BigNumber.from(position.eth.balance)
          .mul(coverageLimit == '' ? '100' : coverageLimit)
          .div('10000')
      )
    )
  }, [coverageLimit])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <CardContainer cardsPerRow={2}>
        <Card>
          <FormRow mb={15}>
            <FormCol>
              <Heading2>Total Assets</Heading2>
              {position.underlying.symbol !== 'ETH' && <Text3>ETH Denominated from {position.underlying.symbol}</Text3>}
            </FormCol>
            <FormCol>
              <Heading2>{formatEther(position.eth.balance)} ETH</Heading2>
            </FormCol>
          </FormRow>
          <FormRow mb={5}>
            <FormCol>
              <Text3>Coverage Limit (1 - 100%)</Text3>
            </FormCol>
            <FormCol>
              <Slider
                width={200}
                backgroundColor={'#fff'}
                value={coverageLimit}
                onChange={(e) => handleCoverageChange(e.target.value)}
                min={100}
                max={10000}
              />
            </FormCol>
            <FormCol>
              <Input
                type="text"
                width={50}
                value={inputCoverage}
                onChange={(e) => handleInputCoverage(e.target.value)}
              />
            </FormCol>
          </FormRow>
          <FormRow mb={5}>
            <FormCol>
              <Text3>Covered Assets</Text3>
            </FormCol>
            <FormCol>
              <FlexRow>
                <Text3
                  autoAlign
                  bold
                  error={parseEther(coveredAssets).gt(parseEther(maxCoverPerUser)) && maxCoverPerUser !== '0.00'}
                >
                  {coveredAssets} ETH
                </Text3>
                <Button
                  disabled={wallet.errors.length > 0}
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
              </FlexRow>
            </FormCol>
          </FormRow>
          <SmallBox
            transparent
            outlined
            error
            collapse={!parseEther(coveredAssets).gt(parseEther(maxCoverPerUser))}
            mb={!parseEther(coveredAssets).gt(parseEther(maxCoverPerUser)) ? 0 : 5}
          >
            <Text3 error autoAlign>
              You can only cover to a maximum amount of {maxCoverPerUser} ETH.
            </Text3>
          </SmallBox>
          <FormRow mb={5}>
            <FormCol>
              <Text3>Time Period (1 - 365 days)</Text3>
            </FormCol>
            <FormCol>
              <Slider
                width={200}
                backgroundColor={'#fff'}
                value={timePeriod == '' ? '1' : timePeriod}
                onChange={(e) => setTime(e.target.value)}
                min="1"
                max={DAYS_PER_YEAR}
              />
            </FormCol>
            <FormCol>
              <Input
                type="text"
                pattern="[0-9]+"
                width={50}
                value={timePeriod}
                onChange={(e) => filteredTime(e.target.value)}
                maxLength={3}
              />
            </FormCol>
          </FormRow>
          <FormRow mb={5}>
            <FormCol>
              <Text3 nowrap>
                Coverage will last from{' '}
                <TextSpan pl={5} pr={5}>
                  {getDateStringWithMonthName(new Date(Date.now()))}
                </TextSpan>{' '}
                to{' '}
                <TextSpan pl={5} pr={5}>
                  {getDateStringWithMonthName(getDateExtended(parseFloat(timePeriod || '1')))}
                </TextSpan>
              </Text3>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>
              <Text3>Quote</Text3>
            </FormCol>
            <FormCol>
              <Text3 bold>{quote} ETH</Text3>
            </FormCol>
          </FormRow>
          <ButtonWrapper>
            {!loading ? (
              <Button
                onClick={() => buyPolicy()}
                disabled={wallet.errors.length > 0 || parseEther(coveredAssets).gt(parseEther(maxCoverPerUser))}
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
          <FormRow>
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
                <b>Important Developer Notes</b>
              </Text3>
              <hr></hr>
              <Heading2>Important Developer Notes</Heading2>
              <Text3 error>
                Do not purchase a policy with a lending protocol for an asset that is locked as collateral. You will not
                be able to submit a claim.
              </Text3>
            </FormCol>
          </FormRow>
        </Card>
      </CardContainer>
    </Fragment>
  )
}
