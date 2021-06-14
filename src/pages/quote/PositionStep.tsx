import React, { Fragment } from 'react'
import { Box, BoxItem, BoxRow, BoxItemUnits } from '../../components/Box'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { CardContainer, PositionCardComponent } from '../../components/Card'
import { PositionCardButton, PositionCardCount, PositionCardLogo, PositionCardName } from '../../components/Position'
import { POSITIONS_LIST } from '../../constants/positions'

export const PositionStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol } = formData

  const handleChange = (position: any) => {
    setForm({
      target: {
        name: 'position',
        value: position,
      },
    })
    navigation.next()
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
        <Box transparent outlined>
          <BoxItem>Select Position Below</BoxItem>
        </Box>
      </BoxRow>
      <CardContainer cardsPerRow={5}>
        {POSITIONS_LIST.map((position) => {
          return (
            <PositionCardComponent key={position.name}>
              <PositionCardLogo>
                <img src={position.img} />
              </PositionCardLogo>
              <PositionCardName>{position.name}</PositionCardName>
              <PositionCardCount>
                1110<BoxItemUnits style={{ fontSize: '12px' }}>USDC</BoxItemUnits>
              </PositionCardCount>
              <PositionCardButton>
                <Button onClick={() => handleChange(position)}>Select</Button>
              </PositionCardButton>
            </PositionCardComponent>
          )
        })}
      </CardContainer>
    </Fragment>
  )
}
