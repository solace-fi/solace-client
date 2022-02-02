import * as React from 'react'
import Flex from '../stake/atoms/Flex'
import RaisedBox from '../stake/atoms/RaisedBox'
import ShadowDiv from '../stake/atoms/ShadowDiv'
import { Text } from '../../components/atoms/Typography'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
// src/components/atoms/Button/index.ts
import { Button } from '../../components/atoms/Button'
// src/resources/svg/icons/usd.svg
import USD from '../../resources/svg/icons/usd.svg'
import USDC from '../../resources/svg/icons/usdc.svg'
import ToggleSwitch from '../../components/atoms/ToggleSwitch'
import { FixedHeightGrayBox, StyledGrayBox } from '../stake/components/GrayBox'
import { GenericInputSection } from '../stake/sections/InputSection'
import { StyledSlider } from '../../components/atoms/Input'
import commaNumber from '../../utils/commaNumber'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { BKPT_5 } from '../../constants'
import GrayBgDiv from '../stake/atoms/BodyBgCss'

function Card({
  children,
  style,
  thinner,
  bigger,
  normous,
  horiz,
  ...rest
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  thinner?: boolean
  /** it middle card flex 1.2 */ bigger?: boolean
  /*flex: 12*/ normous?: boolean
  horiz?: boolean
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
          <StyledTooltip id={'coverage-limit'} tip={'Coverage Limit tip'}>
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
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
              displayIconOnMobile
            />
          )}
          {/* <div style={{ height: '8px', backgroundColor: 'gray', borderRadius: '9999px', marginTop: '18px' }}> </div> */}
          <StyledSlider
            mt={18}
            min={0}
            max={totalFunds}
            onChange={(e) =>
              isEditing
                ? setUsd(Number(e.target.value))
                : () => {
                    1
                  }
            }
            value={isEditing ? (usd > 0 ? String(usd) : usd > 0 ? String(usd) : '0') : coverageLimit}
          />
          {isEditing && (
            <Flex baseline gap={4} center mt={isEditing ? 28 : 60}>
              <Text t4>{isEditing ? 'Fund to be covered:' : 'Funds covered:'}</Text>
              <Flex mt={2}>
                <Text
                  t3
                  bold
                  style={{
                    fontSize: '18px',
                  }}
                >
                  {/* formula: fund covered * 100 / totalFunds = fundsCovered% */}
                  {(((isEditing ? usd : coverageLimit) * 100) / totalFunds).toFixed(0)}%
                </Text>
                {/* <Text t4 bold>
                USD
              </Text> */}
              </Flex>
            </Flex>
          )}
          <Flex baseline gap={4} center mt={isEditing ? 4 : 59}>
            <Text t4>{'Funds covered:'}</Text>
            <Flex mt={2}>
              <Text
                t3
                bold
                style={{
                  fontSize: '18px',
                }}
              >
                {/* formula: fund covered * 100 / totalFunds = fundsCovered% */}
                {((coverageLimit * 100) / totalFunds).toFixed(0)}%
              </Text>
              {/* <Text t4 bold>
                USD
              </Text> */}
            </Flex>
          </Flex>
          <Flex center mt={4}>
            <Flex baseline gap={4} center>
              <Text t4>Total funds:</Text>
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
              Risk level:{' '}
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
  bigger,
  mediumSized,
}: {
  bigText: string
  smallText: string
  info?: boolean
  bigger?: boolean
  mediumSized?: boolean
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
      <Text t2s={!mediumSized} t2_5s={mediumSized} bold info={info}>
        {bigText}
      </Text>
      <Text t4s={bigger} bold info={info}>
        {smallText}
      </Text>
    </Flex>
  )
}

const ifStringZeroUndefined = (str: string) => (Number(str) === 0 ? undefined : str)

function CoverageBalance() {
  // setters for usd and days
  const [usd, setUsd] = React.useState('0')
  const { ifDesktop } = useWindowDimensions()
  return (
    <Card bigger horiz>
      <Flex
        col
        // between
        stretch
        gap={40}
        style={{
          width: '100%',
          // backgroundColor: 'green',
        }}
      >
        <Flex between itemsCenter>
          <Text t2 bold>
            Policy Balance
          </Text>
          <StyledTooltip id={'coverage-balance'} tip={'Coverage Balance'}>
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        <Flex
          col
          between
          stretch
          gap={30}
          pl={ifDesktop(24)}
          pr={ifDesktop(24)}
          style={{
            // backgroundColor: 'red',
            height: '100%',
          }}
        >
          <Flex col gap={10} stretch>
            <StyledGrayBox>
              {/* <Flex> */}
              <Flex
                col
                itemsCenter
                style={{
                  width: '100%',
                }}
              >
                <ValuePair bigText="1,432,098" smallText="USD" info />
              </Flex>
            </StyledGrayBox>
            <Flex gap={4} baseline justifyCenter>
              <Text t5s>Approximate policy duration:</Text>
              <Text t4s bold>
                185 Days
              </Text>
            </Flex>
          </Flex>
          <Flex col gap={20}>
            <GenericInputSection
              icon={<img src={USDC} height={20} />}
              onChange={(e) => setUsd(e.target.value)}
              text="USDC"
              value={ifStringZeroUndefined(usd)}
              disabled={false}
              displayIconOnMobile
            />
            {/* <GenericInputSection
              icon={<StyledClock height={20} width={20} />}
              onChange={(e) => setDays(e.target.value)}
              text="Days"
              value={ifStringZeroUndefined(days)}
              disabled={false}
              displayIconOnMobile
            /> */}
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
    <Card normous horiz>
      {/* top part / title */}
      {/* <Flex col stretch between> */}
      <Flex
        between
        col
        style={{
          width: '100%',
        }}
        gap={40}
      >
        <Flex between itemsCenter>
          <Text t2 bold>
            Coverage Price*
          </Text>
          <StyledTooltip id={'coverage-price'} tip={'Coverage Price'}>
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        {/* middle has padding l and r 40px, rest is p l and r 24px (comes with Card); vertical justify-between */}
        <Flex col gap={20} pl={40} pr={40}>
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
        <Text t5s textAlignCenter>
          *The price updates continuously according to changes in your portfolio.
        </Text>
      </Flex>
      {/* </Flex> */}
    </Card>
  )
}

// const StyledTable = styled.table`
//   background-color: ${(props) => props.theme.v2.raised};
//   border-collapse: separate;
//   border-spacing: 0 10px;
//   font-size: 14px;
// `
// const StyledTr = styled.tr``

// const StyledTd = styled.td<{
//   first?: boolean
//   last?: boolean
// }>`
//   background-color: ${(props) => props.theme.body.bg_color};
//   padding: 10px 24px;
//   /* first and last ones have border-radius left and right 10px respectively */
//   ${(props) =>
//     props.first &&
//     css`
//       border-top-left-radius: 10px;
//       border-bottom-left-radius: 10px;
//     `}
//   ${(props) =>
//     props.last &&
//     css`
//       border-top-right-radius: 10px;
//       border-bottom-right-radius: 10px;
//     `}
// `

function PortfolioTable() {
  /* table like this:
|protocol|type| positions |amount|risk level|
|:-------|:---|:---------:|:-----:|:--------|
|Uniswap |DEX |ETH,BTC,DAI|42345 USD|Low|
|Nexus Mutual| Derivatives| ETH,DAI|34562 USD|High|
|Aave |Lending |ETH,DAI|12809 USD|Medium|
|Yearn Finance |Assets |BTC|2154 USD|Medium|

  */
  const { width } = useWindowDimensions()
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
    <>
      {/* <StyledTable>
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
      </StyledTable> */}
      {width > BKPT_5 ? (
        <Table>
          <TableHead>
            <TableHeader>Protocol</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Positions</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Risk Level</TableHeader>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableData>{row.protocol}</TableData>
                <TableData>{row.type}</TableData>
                <TableData>{row.positions.join(', ')}</TableData>
                <TableData>{row.amount}</TableData>
                <TableData>{row.riskLevel}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Flex column gap={30}>
          {data.map((row) => (
            <GrayBgDiv
              key={row.id}
              style={{
                borderRadius: '10px',
                padding: '14px 24px',
              }}
            >
              <Flex gap={30} between itemsCenter>
                <Flex col gap={8.5}>
                  <div>{row.protocol}</div>
                  <div>{row.positions.join(', ')}</div>
                </Flex>
                <Flex col gap={8.5}>
                  <div>{row.amount}</div>
                  <div>{row.type}</div>
                  <div>{row.riskLevel}</div>
                </Flex>
              </Flex>
            </GrayBgDiv>
          ))}
        </Flex>
      )}
    </>
  )
}

export default function Soteria(): JSX.Element {
  // set coverage active
  const { width } = useWindowDimensions()
  return (
    <Flex col gap={24} m={width < BKPT_5 ? 20 : undefined}>
      <Flex gap={24} col={width < BKPT_5}>
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
