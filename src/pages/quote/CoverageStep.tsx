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

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol, position, coverageLimit, timePeriod } = formData

  const handleCoverageChange = (coverageLimit: string) => {
    setForm({
      target: {
        name: 'coverageLimit',
        value: coverageLimit,
      },
    })
  }

  const handleTimeChange = (timePeriod: string) => {
    setForm({
      target: {
        name: 'timePeriod',
        value: timePeriod,
      },
    })
  }

  return (
    <Fragment>
      <BoxRow>
        <Box>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={protocol.img} />
              </ProtocolImage>
              <ProtocolTitle>{protocol.name}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>2.60%</BoxItem>
          <BoxItem>43 ETH</BoxItem>
          <BoxItem>
            <Button onClick={() => navigation.go(0)}>Change</Button>
          </BoxItem>
        </Box>
        <Box purple>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src={position.img} />
              </ProtocolImage>
              <ProtocolTitle>{position.name}</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>1110 USDC</BoxItem>
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
              <Heading2>32 ETH</Heading2>
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
                min={1}
                max={100}
              />
            </BoxChooseCol>
            <BoxChooseCol>
              <Input
                type="number"
                width={50}
                value={coverageLimit}
                onChange={(e) => handleCoverageChange(e.target.value)}
                min="1"
                max="100"
              />
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
                value={timePeriod}
                onChange={(e) => handleTimeChange(e.target.value)}
                min="1"
                max="365"
              />
            </BoxChooseCol>
            <BoxChooseCol>
              <Input
                type="number"
                width={50}
                value={timePeriod}
                onChange={(e) => handleTimeChange(e.target.value)}
                min="1"
                max="365"
              />
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseCol>
              <BoxChooseText>Cover Period</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseDate>
                from <Input type="date" /> to <Input type="date" />
              </BoxChooseDate>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseCol>
              <BoxChooseText>Covered Assets</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseText bold>53 ETH</BoxChooseText>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseCol>
              <BoxChooseText>Quote</BoxChooseText>
            </BoxChooseCol>
            <BoxChooseCol>
              <BoxChooseText bold>0.2 ETH</BoxChooseText>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseButton>
            <Button onClick={() => navigation.next()}>Buy</Button>
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
