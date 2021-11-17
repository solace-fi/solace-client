import React, { useState } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { Input } from '../../components/atoms/Input'
import { Content, FlexCol, HorizRule } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text } from '../../components/atoms/Typography'

function Stake(): any {
  const [isStaking, setIsStaking] = useState<boolean>(true)

  return (
    <Content>
      <FlexCol>
        <Card style={{ justifyContent: 'center', margin: 'auto' }}>
          <div style={{ justifyContent: 'space-around', display: 'flex', position: 'relative' }}>
            <ModalCell pt={5} pb={10} onClick={() => setIsStaking(true)} style={{ cursor: 'pointer' }}>
              <Text t1 info={isStaking}>
                Stake
              </Text>
            </ModalCell>
            <ModalCell pt={5} pb={10} onClick={() => setIsStaking(false)} style={{ cursor: 'pointer' }}>
              <Text t1 info={!isStaking}>
                Unstake
              </Text>
            </ModalCell>
          </div>
          <HorizRule />
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <Input
                width={240}
                mt={20}
                mb={5}
                minLength={1}
                maxLength={79}
                autoComplete="off"
                autoCorrect="off"
                inputMode="decimal"
                placeholder="0.0"
                textAlignCenter
                type="text"
              />
              <Button ml={10} pt={4} pb={4} pl={8} pr={8} width={70} height={30}>
                MAX
              </Button>
            </div>
          </div>
          <FormRow mb={10}>
            <FormCol>
              <Text>Unstaked Balance</Text>
            </FormCol>
            <FormCol>
              <Text info>0.01 SOLACE</Text>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text>Staked Balance</Text>
            </FormCol>
            <FormCol>
              <Text info nowrap>
                0.01 xSOLACE
              </Text>
            </FormCol>
          </FormRow>
          <HorizRule />
          <FormRow>
            <FormCol>
              <Text bold>Next Reward Amount</Text>
            </FormCol>
            <FormCol>
              <Text bold info nowrap>
                0.02 xSOLACE
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>
              <Text bold>Next Reward Yield</Text>
            </FormCol>
            <FormCol>
              <Text bold info nowrap>
                35%
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>
              <Text bold>ROI (5-Day Rate)</Text>
            </FormCol>
            <FormCol>
              <Text bold info nowrap>
                75%
              </Text>
            </FormCol>
          </FormRow>
          <ButtonWrapper>
            <Button widthP={100} info>
              {isStaking ? 'Stake' : 'Unstake'}
            </Button>
          </ButtonWrapper>
        </Card>
      </FlexCol>
    </Content>
  )
}

export default Stake
