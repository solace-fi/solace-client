import React, { Fragment } from 'react'
import { Box, BoxItem, BoxRow, BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { CardContainer, PositionCardComponent } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { position } = formData

  return (
    <Fragment>
      <BoxRow>
        <Box>
          <BoxItem>
            <Protocol>
              <ProtocolImage>
                <img src="" />
              </ProtocolImage>
              <ProtocolTitle>Aave V2</ProtocolTitle>
            </Protocol>
          </BoxItem>
          <BoxItem>2.60%</BoxItem>
          <BoxItem>43 ETH</BoxItem>
        </Box>
        <Box transparent outlined>
          <BoxItem>Select Position Below</BoxItem>
        </Box>
      </BoxRow>
      <CardContainer cardsPerRow={5}>
        <PositionCardComponent>
          <PositionCardLogo>
            <img src="" />
          </PositionCardLogo>
          <PositionCardName>Gemini Dollar</PositionCardName>
          <PositionCardCount>
            1110<BoxItemUnits style={{ fontSize: '12px' }}>USDC</BoxItemUnits>
          </PositionCardCount>
          <PositionCardButton>
            <Button>Select</Button>
          </PositionCardButton>
        </PositionCardComponent>
      </CardContainer>
      <Button onClick={() => navigation.previous()}>Prev</Button>
      <Button onClick={() => navigation.next()}>Next</Button>
    </Fragment>
  )
}
