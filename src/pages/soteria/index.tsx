import * as React from 'react'
import Flex from '../stake/atoms/Flex'
import RaisedBox from '../stake/atoms/RaisedBox'
import ShadowDiv from '../stake/atoms/ShadowDiv'
import { Text } from '../../components/atoms/Typography'
import { StyledClock } from '../../components/atoms/Icon'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import USD from '../../resources/svg/icons/usd.svg'
import USDC from '../../resources/svg/icons/usdc.svg'
import ToggleSwitch from '../../components/atoms/ToggleSwitch'
import { FixedHeightGrayBox, StyledGrayBox } from '../stake/components/GrayBox'
import { VerticalSeparator } from '../stake/components/VerticalSeparator'
import InputSection, { GenericInputSection } from '../stake/sections/InputSection'
import CardRange from '../stake/components/CardRange'
import styled, { css } from 'styled-components'
import { FunSlider, StyledSlider } from '../../components/atoms/Input'
import { Slider } from '@rebass/forms'
import commaNumber from '../../utils/commaNumber'

function Card({
  children,
  style,
  thinner,
  bigger,
  normous,
  horiz,
  between,
  ...rest
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  thinner?: boolean
  /** it middle card flex 1.2 */ bigger?: boolean
  /*flex: 12*/ normous?: boolean
  horiz?: boolean
  between?: boolean
}) {
  const defaultStyle = style ?? {}
  // thinner is 0.8, bigger is 1.2
  const customStyle = {
    display: 'flex',
    flex: (() => {
      if (thinner) return 0.8
      if (bigger) return 1
      if (normous) return 12
    })(),
    // alignItems: 'stretch',
    // justifyContent: between ? 'space-between' : 'flex-start',
  }
  const combinedStyle = { ...defaultStyle, ...customStyle }

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'stretch',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  }
  return (
    <ShadowDiv stretch style={combinedStyle} {...rest}>
      <RaisedBox style={horiz ? rowStyle : colStyle}>
        <Flex
          p={24}
          column={!horiz}
          stretch
          flex1
          // style={{
          //   backgroundColor: 'green',
          // }}
        >
          {children}
        </Flex>
      </RaisedBox>
    </ShadowDiv>
  )
}

// second line is an svg circle with a text inside
// third line is a text below the circle
// fourth line is 1 submit and 1 cancel button

function CoverageLimit() {
  const [isEditing, setIsEditing] = React.useState(false)
  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)
  const [usd, setUsd] = React.useState<number>(0)
  const totalFunds = 23325156
  const coverageLimit = 15325156
  React.useEffect(() => {
    if (15325156) {
      setUsd(15325156)
    }
  }, [])
  return (
    <Card thinner>
      <Flex
        between
        col
        stretch
        style={{
          flex: '2',
        }}
      >
        <Flex
          itemsCenter
          // style={{
          //   // just between
          //   justifyContent: 'space-between',
          // }}
          between
        >
          <Text t2 bold>
            Coverage Limit
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
        <div>
          {!isEditing ? (
            <FixedHeightGrayBox
              h={66}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '40px',
              }}
            >
              <Flex baseline center gap={4}>
                <Text techygradient t2 bold>
                  {commaNumber(coverageLimit)}
                </Text>
                <Text techygradient t4 bold>
                  USD
                </Text>
              </Flex>
            </FixedHeightGrayBox>
          ) : (
            <GenericInputSection
              icon={<img src={USD} height={20} />}
              onChange={(e) => setUsd(Number(e.target.value))}
              text="USD"
              value={usd > 0 ? String(usd) : ''}
              disabled={false}
              w={300}
              style={{
                marginTop: '40px',
              }}
            />
          )}
          {/* <div style={{ height: '8px', backgroundColor: 'gray', borderRadius: '9999px', marginTop: '18px' }}> </div> */}
          <StyledSlider
            mt={18}
            min={0}
            max={totalFunds}
            onChange={(e) => setUsd(Number(e.target.value))}
            value={usd > 0 ? String(usd) : usd > 0 ? String(usd) : '0'}
          />
          <Flex center mt={60}>
            <Flex baseline gap={4} center>
              <Text t4 bold>
                Total funds:
              </Text>
              <Flex gap={4} baseline mt={2}>
                <Text
                  t3
                  bold
                  style={{
                    fontSize: '18px',
                  }}
                >
                  {totalFunds}
                </Text>
                <Text t4 bold>
                  USD
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex center mt={6.5}>
            <Text t4>
              Risk value:{' '}
              <Text
                t3
                warning
                bold
                style={{
                  display: 'inline',
                }}
              >
                Medium
              </Text>
            </Text>
          </Flex>
        </div>
        <Flex mt={40} justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined}>
          {!isEditing ? (
            <Button
              info
              secondary
              pl={46.75}
              pr={46.75}
              pt={8}
              pb={8}
              style={{
                fontWeight: 600,
              }}
              onClick={startEditing}
            >
              Edit Limit
            </Button>
          ) : (
            <>
              <Button info secondary pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }}>
                Set Limit
              </Button>
              <Button info pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }} onClick={stopEditing}>
                Cancel
              </Button>
            </>
          )}
        </Flex>
      </Flex>
      {/* <Button info>Cancel</Button> */}
    </Card>
  )
}

// 18px 14px value pair
function ValuePair({
  bigText, // 18px
  smallText, // 14px
  info,
}: {
  bigText: string
  smallText: string
  info?: boolean
}) {
  return (
    <Flex
      gap={4}
      baseline
      style={
        {
          // justifyContent: 'space-between',
        }
      }
    >
      <Text t2_5 bold info={info}>
        {bigText}
      </Text>
      <Text t4 bold info={info}>
        {smallText}
      </Text>
    </Flex>
  )
}

const ifStringZeroUndefined = (str: string) => (Number(str) === 0 ? undefined : str)

function CoverageBalance() {
  // setters for usd and days
  const [usd, setUsd] = React.useState('0')
  const [days, setDays] = React.useState('0')
  return (
    <Card bigger horiz>
      <Flex
        col
        // between
        stretch
        gap={40}
        style={
          {
            // backgroundColor: 'green',
          }
        }
      >
        <Flex between itemsCenter>
          <Text t2 bold>
            Coverage Balance
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
        <Flex
          col
          between
          stretch
          gap={30}
          pl={24}
          pr={24}
          style={{
            // backgroundColor: 'red',
            height: '100%',
          }}
        >
          <StyledGrayBox>
            <Flex stretch between gap={24}>
              <Flex gap={6} itemsCenter>
                <img src={USD} height={20} />
                <ValuePair bigText="1,432,098" smallText="USD" />
              </Flex>
              <VerticalSeparator />
              <Flex gap={6} itemsCenter>
                <Text
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <StyledClock height={20} width={20} />
                </Text>
                <ValuePair bigText="185" smallText="Days" />
              </Flex>
            </Flex>
          </StyledGrayBox>
          <Flex col gap={20}>
            <GenericInputSection
              icon={<img src={USDC} height={20} />}
              onChange={(e) => setUsd(e.target.value)}
              text="USDC"
              value={ifStringZeroUndefined(usd)}
              disabled={false}
            />
            <GenericInputSection
              icon={<StyledClock height={20} width={20} />}
              onChange={(e) => setDays(e.target.value)}
              text="Days"
              value={ifStringZeroUndefined(days)}
              disabled={false}
            />
            <StyledSlider />
          </Flex>
          <Flex gap={20}>
            <Button
              info
              secondary
              pl={46.75}
              pr={46.75}
              pt={8}
              pb={8}
              style={{
                fontWeight: 600,
                flex: 1,
              }}
            >
              Deposit
            </Button>
            <Button
              info
              pl={46.75}
              pr={46.75}
              pt={8}
              pb={8}
              style={{
                fontWeight: 600,
                flex: 1,
              }}
            >
              Withdraw
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}

function CoverageActive() {
  const [coverageActive, setCoverageActive] = React.useState<boolean>(false)
  return (
    <Card>
      <Flex between itemsCenter>
        <Flex stretch gap={7}>
          <Text t2 bold>
            Coverage
          </Text>
          <Text t2 bold info={coverageActive} warning={!coverageActive}>
            {coverageActive ? 'Active' : 'Inactive'}
          </Text>
        </Flex>
        <Flex between itemsCenter>
          <ToggleSwitch
            id="bird"
            toggled={coverageActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverageActive(e.target.checked)}
          />
        </Flex>
      </Flex>
    </Card>
  )
}

function CoveragePrice() {
  return (
    <Card normous={true} horiz>
      {/* top part / title */}
      {/* <Flex col stretch between> */}
      <Flex between col>
        <Flex between itemsCenter>
          <Text t2 bold>
            Coverage Price*
          </Text>
          <QuestionCircle height={20} width={20} color={'#aaa'} />
        </Flex>
        {/* middle has padding l and r 40px, rest is p l and r 24px (comes with Card); vertical justify-between */}
        <Flex col gap={30} pl={40} pr={40}>
          <Flex between itemsCenter>
            <ValuePair bigText="0.00184" smallText="USD" info />
            <Text t5s>/ Day</Text>
          </Flex>
          <Flex between itemsCenter>
            <ValuePair bigText="0.0552" smallText="USD" info />
            <Text t5s>/ Month</Text>
          </Flex>
          <Flex between itemsCenter>
            <ValuePair bigText="0.6716" smallText="USD" info />
            <Text t5s>/ Year</Text>
          </Flex>
        </Flex>
        <Text t5s>*The price updates continuously according to changes in your portfolio.</Text>
      </Flex>
      {/* </Flex> */}
    </Card>
  )
}

const StyledTable = styled.table`
  background-color: ${(props) => props.theme.v2.raised};
  border-collapse: separate;
  border-spacing: 0 10px;
  font-size: 14px;
`
const StyledTr = styled.tr``

const StyledTd = styled.td<{
  first?: boolean
  last?: boolean
}>`
  background-color: ${(props) => props.theme.body.bg_color};
  padding: 10px 24px;
  /* first and last ones have border-radius left and right 10px respectively */
  ${(props) =>
    props.first &&
    css`
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    `}
  ${(props) =>
    props.last &&
    css`
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    `}
`

function PortfolioTable() {
  /* table like this:
|protocol|type| positions |amount|risk level|
|:-------|:---|:---------:|:-----:|:--------|
|Uniswap |DEX |ETH,BTC,DAI|42345 USD|Low|
|Nexus Mutual| Derivatives| ETH,DAI|34562 USD|High|
|Aave |Lending |ETH,DAI|12809 USD|Medium|
|Yearn Finance |Assets |BTC|2154 USD|Medium|

  */
  const data = [
    {
      id: '_a',
      protocol: 'Uniswap',
      type: 'DEX',
      positions: ['ETH', 'BTC', 'DAI'],
      amount: '42345 USD',
      riskLevel: 'Low',
    },
    {
      id: '_b',
      protocol: 'Nexus Mutual',
      type: 'Derivatives',
      positions: ['ETH', 'DAI'],
      amount: '34562 USD',
      riskLevel: 'High',
    },
    {
      id: '_c',
      protocol: 'Aave',
      type: 'Lending',
      positions: ['ETH', 'DAI'],
      amount: '12809 USD',
      riskLevel: 'Medium',
    },
    {
      id: '_d',
      protocol: 'Yearn Finance',
      type: 'Assets',
      positions: ['BTC'],
      amount: '2154 USD',
      riskLevel: 'Medium',
    },
  ]
  return (
    <StyledTable>
      <thead>
        <tr style={{}}>
          <th style={{ textAlign: 'start', padding: '10px 24px' }}>Protocol</th>
          <th style={{ textAlign: 'start', padding: '10px 24px' }}>Type</th>
          <th style={{ textAlign: 'start', padding: '10px 24px' }}>Positions</th>
          <th style={{ textAlign: 'start', padding: '10px 24px' }}>Amount</th>
          <th style={{ textAlign: 'start', padding: '10px 24px' }}>Risk Level</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <StyledTr
            key={row.id}
            style={{
              marginTop: '10px',
            }}
          >
            <StyledTd first>{row.protocol}</StyledTd>
            <StyledTd>{row.type}</StyledTd>
            <StyledTd>{row.positions.join(', ')}</StyledTd>
            <StyledTd>{row.amount}</StyledTd>
            <StyledTd last>{row.riskLevel}</StyledTd>
          </StyledTr>
        ))}
      </tbody>
    </StyledTable>
  )
}

export default function Soteria(): JSX.Element {
  // set coverage active
  return (
    <Flex col gap={24}>
      <Flex gap={24}>
        <CoverageLimit />
        <CoverageBalance />
        <Flex
          col
          stretch
          gap={24}
          style={{
            flex: '0.8',
          }}
        >
          <CoverageActive />
          <CoveragePrice />
        </Flex>
      </Flex>
      <Card>
        <Text t2 bold>
          Portfolio Details
        </Text>
        <PortfolioTable />
      </Card>
    </Flex>
  )
}
