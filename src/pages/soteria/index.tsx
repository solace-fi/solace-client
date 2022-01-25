import * as React from 'react'
import Flex from '../stake/atoms/Flex'
import RaisedBox from '../stake/atoms/RaisedBox'
import ShadowDiv from '../stake/atoms/ShadowDiv'
import { Text, TTTest } from '../../components/atoms/Typography'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
import CardSectionValue from '../stake/components/CardSectionValue'
import { Button } from '../../components/atoms/Button'
// need a box like this:
// first line is title top left - interrogation sign top right

function Boxo({ children, title, helpText }: { children: React.ReactNode; title: string; helpText: string }) {
  const [showHelp, setShowHelp] = React.useState(false)

  return (
    <ShadowDiv stretch>
      <RaisedBox>
        {/* title and question mark */}
        <Flex between>
          <Text t2>{title}</Text>
          <Flex
            center
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            style={{
              cursor: 'pointer',
              backgroundColor: 'skyblue',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              marginRight: '10px',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            ?
          </Flex>
        </Flex>
        {/* help text */}
        {showHelp && (
          <div
            style={{
              marginTop: '10px',
              position: 'absolute',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              width: '200px',
              maxWidth: '200px',
              maxHeight: '200px',
              overflow: 'auto',
              top: '-100px',
              left: '50px',
            }}
          >
            <div>{helpText}</div>
          </div>
        )}
        {/* children */}
        {children}
      </RaisedBox>
    </ShadowDiv>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <ShadowDiv stretch>
      <RaisedBox>
        <Flex p={24} column>
          {children}
        </Flex>
      </RaisedBox>
    </ShadowDiv>
  )
}

// second line is an svg circle with a text inside
// third line is a text below the circle
// fourth line is 1 submit and 1 cancel button

export default function Soteria(): JSX.Element {
  return (
    <Flex gap={24}>
      <Card>
        <Flex
          center
          style={{
            // just between
            justifyContent: 'space-between',
          }}
        >
          <Text t2 bold>
            Coverage Limit
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
        <Flex center mt={40}>
          <Text techygradient t2 bold>
            1,000,000
          </Text>
          <Text techygradient t4 bold>
            USD
          </Text>
        </Flex>
        <Flex center mt={20}>
          <Flex
            center
            style={{
              height: '200px',
              width: '200px',
              borderRadius: '100%',
              border: '11px solid #aaa',
            }}
          >
            Total funds: big
          </Flex>
        </Flex>
        <Flex center mt={20}>
          <Text t4>
            Risk value:{' '}
            <Text
              t3
              warning
              style={{
                display: 'inline',
              }}
            >
              Medium
            </Text>
          </Text>
        </Flex>
        <Flex
          // center
          mt={40}
          // gap={24}
          style={{
            justifyContent: 'space-between',
          }}
        >
          <Button info secondary>
            Submit
          </Button>
          <Button info>Cancel</Button>
        </Flex>
      </Card>
      <Card>
        <Flex between center>
          <Text t2 bold>
            Coverage Limit
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
      </Card>
      <Card>
        <Flex between center>
          <Text t2 bold>
            Coverage Limit
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
      </Card>
    </Flex>
  )
}
