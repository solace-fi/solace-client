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
      variables
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
import { TransactionConditions, FunctionNames, Units } from '../../constants/enums'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'

/* import components */
import { BoxChooseRow, BoxChooseCol, BoxChooseText, BoxChooseDate } from '../../components/Box/BoxChoose'
import { Button, ButtonWrapper } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardBaseComponent, CardContainer } from '../../components/Card'
import { Heading2, Text3 } from '../../components/Text'
import { Input } from '../../components/Input'
import { Loader } from '../../components/Loader'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerUser } from '../../hooks/usePolicy'

/* import utils */
import { getGasValue } from '../../utils/formatting'
import { SmallBox } from '../../components/Box'
import { FlexRow } from '../../components/Layout'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { position, coverageLimit, timePeriod, loading } = formData
  const maxCoverPerUser = useGetMaxCoverPerUser() // in eth
  const quote = useGetQuote(coverageLimit, position.token.address, timePeriod)
  const wallet = useWallet()
  const { addLocalTransactions } = useUserData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [inputCoverage, setInputCoverage] = useState<string>('50')
  const [coveredAssets, setCoveredAssets] = useState<string>(maxCoverPerUser)

  /*************************************************************************************

  variables

  *************************************************************************************/

  const date = new Date()

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
    const txType = FunctionNames.BUY_POLICY
    try {
      const tx = await selectedProtocol.buyPolicy(
        wallet.account,
        position.token.address,
        coverageLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(timePeriod)),
        {
          value: parseEther(quote).add(parseEther(quote).div('10000')),
          gasPrice: getGasValue(wallet.gasPrices.selected.value),
          gasLimit: GAS_LIMIT,
        }
      )
      navigation.next()
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: 'Policy',
        status: TransactionConditions.PENDING,
        unit: Units.ETH,
      }
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionConditions.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionConditions.SUCCESS : TransactionConditions.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionConditions.CANCELLED)
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      wallet.reload()
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

  const handleCoverageChange = (coverageLimit: string) => {
    setInputCoverage((parseInt(coverageLimit) / 100).toString())
    setCoverage(coverageLimit)
  }

  const setCoverage = (coverageLimit: string) => {
    setForm({
      target: {
        name: 'coverageLimit',
        value: coverageLimit,
      },
    })
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
        <CardBaseComponent>
          <BoxChooseRow mb={15}>
            <BoxChooseCol>
              <Heading2>Total Assets</Heading2>
              {position.underlying.symbol !== 'ETH' && <Text3>ETH Denominated from {position.underlying.symbol}</Text3>}
            </BoxChooseCol>
            <BoxChooseCol>
              <Heading2>{formatEther(position.eth.balance)} ETH</Heading2>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow mb={5}>
            <BoxChooseCol>
              <BoxChooseText>Coverage Limit (1 - 100%)</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <Slider
                width={200}
                backgroundColor={'#fff'}
                value={coverageLimit}
                onChange={(e) => handleCoverageChange(e.target.value)}
                min={100}
                max={10000}
              />
            </BoxChooseCol>
            <BoxChooseCol>
              <Input
                type="text"
                width={50}
                value={inputCoverage}
                onChange={(e) => handleInputCoverage(e.target.value)}
              />
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow mb={5}>
            <BoxChooseCol>
              <BoxChooseText>Covered Assets</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <FlexRow>
                <BoxChooseText
                  autoAlign
                  bold
                  error={parseEther(coveredAssets).gt(parseEther(maxCoverPerUser)) && maxCoverPerUser !== '0.00'}
                >
                  {coveredAssets} ETH
                </BoxChooseText>
                <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={79} height={30} onClick={() => setMaxCover()}>
                  MAX
                </Button>
              </FlexRow>
            </BoxChooseCol>
          </BoxChooseRow>
          <SmallBox
            outlined
            error
            collapse={!parseEther(coveredAssets).gt(parseEther(maxCoverPerUser))}
            mb={!parseEther(coveredAssets).gt(parseEther(maxCoverPerUser)) ? 0 : 5}
          >
            <Text3 error autoAlign>
              You can only cover to a maximum amount of {maxCoverPerUser} ETH.
            </Text3>
          </SmallBox>
          <BoxChooseRow mb={5}>
            <BoxChooseCol>
              <BoxChooseText>Time Period (1 - 365 days)</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <Slider
                width={200}
                backgroundColor={'#fff'}
                value={timePeriod == '' ? '1' : timePeriod}
                onChange={(e) => setTime(e.target.value)}
                min="1"
                max={DAYS_PER_YEAR}
              />
            </BoxChooseCol>
            <BoxChooseCol>
              <Input
                type="text"
                pattern="[0-9]+"
                width={50}
                value={timePeriod}
                onChange={(e) => filteredTime(e.target.value)}
                maxLength={3}
              />
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow mb={5}>
            <BoxChooseCol>
              <BoxChooseText>Covered Period</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseDate>
                from <Input readOnly type="date" value={`${date.toISOString().substr(0, 10)}`} /> to{' '}
                <Input
                  readOnly
                  type="date"
                  value={`${new Date(date.setDate(date.getDate() + parseFloat(timePeriod || '1')))
                    .toISOString()
                    .substr(0, 10)}`}
                />
              </BoxChooseDate>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseCol>
              <BoxChooseText>Quote</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseText bold>{quote} ETH</BoxChooseText>
            </BoxChooseCol>
          </BoxChooseRow>
          <ButtonWrapper>
            {!loading ? (
              <Button onClick={() => buyPolicy()} disabled={parseEther(coveredAssets).gt(parseEther(maxCoverPerUser))}>
                Buy
              </Button>
            ) : (
              <Loader />
            )}
          </ButtonWrapper>
        </CardBaseComponent>
        <CardBaseComponent transparent>
          <BoxChooseRow>
            <Heading2>Terms and conditions</Heading2>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseText>
              <b>Events covered:</b>
              <ul>
                <li>Contract bugs</li>
                <li>Economic attacks, including oracle failures</li>
                <li>Governance attacks</li>
              </ul>
              This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace
              protocol and the decentralized governance has the final say on which claims are paid.
            </BoxChooseText>
          </BoxChooseRow>
        </CardBaseComponent>
      </CardContainer>
    </Fragment>
  )
}
