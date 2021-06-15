import React, { Fragment, useState } from 'react'
import {
  BoxChooseRow,
  BoxChooseCol,
  BoxChooseText,
  BoxChooseDate,
  BoxChooseButton,
} from '../../components/Box/BoxChoose'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { CardBaseComponent, CardContainer } from '../../components/Card'
import { Heading2, Text3 } from '../../components/Text'
import { Input } from '../../components/Input'
import { Slider } from '@rebass/forms'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { useGetQuote } from '../../hooks/usePolicy'
import { NUM_BLOCKS_PER_DAY } from '../../constants'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { TransactionCondition, FunctionName, Unit } from '../../constants/enums'
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { getGasValue } from '../../utils/formatting'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { compProduct } = useContracts()
  const { position, coverageLimit, timePeriod } = formData
  const [inputCoverage, setInputCoverage] = useState<string>('50')
  const quote = useGetQuote(coverageLimit, position.token.address, timePeriod)
  const wallet = useWallet()
  const { addLocalTransactions } = useUserData()
  const { makeTxToast } = useToasts()

  const date = new Date()

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
    if (parseFloat(filtered) <= 365 || filtered == '') {
      setTime(filtered == '' ? '1' : filtered)
    }
  }

  const coveredAssets = formatEther(
    BigNumber.from(position.eth.balance)
      .mul(coverageLimit == '' ? '100' : coverageLimit)
      .div('10000')
  )

  const buyPolicy = async () => {
    if (!compProduct) return
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await compProduct.buyPolicy(
        wallet.account,
        position.token.address,
        coverageLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(timePeriod)),
        {
          value: parseEther(quote).add(parseEther(quote).div('10000')),
          gasPrice: getGasValue(wallet.gasPrices.selected.value),
          gasLimit: 450000,
        }
      )
      navigation.next()
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ETH }
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        console.log('buyPolicy tx', tx)
        console.log('buyPolicy receipt', receipt)
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      wallet.reload()
    }
  }

  return (
    <Fragment>
      <CardContainer cardsPerRow={2}>
        <CardBaseComponent>
          <BoxChooseRow>
            <BoxChooseCol>
              <Heading2>Total Assets</Heading2>
              <Text3>ETH Denominated</Text3>
            </BoxChooseCol>
            <BoxChooseCol>
              <Heading2>{formatEther(position.eth.balance)} ETH</Heading2>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
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
          <BoxChooseRow>
            <BoxChooseCol>
              <BoxChooseText>Covered Assets</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseText bold>{coveredAssets} ETH</BoxChooseText>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
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
                max="365"
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
          <BoxChooseRow>
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
          <BoxChooseButton>
            <Button onClick={() => buyPolicy()}>Buy</Button>
          </BoxChooseButton>
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
