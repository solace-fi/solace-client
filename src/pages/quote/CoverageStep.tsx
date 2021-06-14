import React, { Fragment, useState } from 'react'
import { Box, BoxItem, BoxRow } from '../../components/Box'
import {
  BoxChooseRow,
  BoxChooseCol,
  BoxChooseText,
  BoxChooseDate,
  BoxChooseButton,
} from '../../components/Box/BoxChoose'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { CardBaseComponent, CardContainer } from '../../components/Card'
import { Heading2, Text3 } from '../../components/Text'
import { Input } from '../../components/Input'
import { Slider } from '@rebass/forms'
import { fixedPositionBalance } from '../../utils/formatting'
import { formatEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { useBuyPolicy, useGetQuote } from '../../hooks/usePolicy'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, position, coverageLimit, timePeriod } = formData
  const [inputCoverage, setInputCoverage] = useState<string>('50')
  const quote = useGetQuote(coverageLimit, position.token.address, timePeriod)
  const [buyPolicy, goNextStep] = useBuyPolicy(coverageLimit, position.token.address, timePeriod)

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

  const handleBuy = async () => {
    setForm({
      target: {
        name: 'loading',
        value: true,
      },
    })
    await buyPolicy()
    setForm({
      target: {
        name: 'loading',
        value: false,
      },
    })
    goNextStep && navigation.next()
  }

  return (
    <Fragment>
      <BoxRow>
        <Box>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={`https://assets.solace.fi/${protocol.toLowerCase()}.svg`} />
              </ProtocolImage>
              <ProtocolTitle>{protocol}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>2.60%</BoxItem>
          <BoxItem>4003 ETH</BoxItem>
          <BoxItem>
            <Button onClick={() => navigation.go(0)}>Change</Button>
          </BoxItem>
        </Box>
        <Box purple>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={`https://assets.solace.fi/${position.underlying.address.toLowerCase()}.svg`} />
              </ProtocolImage>
              <ProtocolTitle>{position.underlying.name}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>
            {fixedPositionBalance(position.underlying)} {position.underlying.symbol}
          </BoxItem>
          <BoxItem>
            <Button onClick={() => navigation.go(1)}>Change</Button>
          </BoxItem>
        </Box>
      </BoxRow>
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
            <Button onClick={() => handleBuy()}>Buy</Button>
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
