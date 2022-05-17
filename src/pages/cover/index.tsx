import React, { useMemo } from 'react'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledClock, StyledOptions } from '../../components/atoms/Icon'
import { InputSectionWrapper, StyledInput } from '../../components/atoms/Input'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { BKPT_2, BKPT_NAVBAR } from '../../constants'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

export const DropdownInputSection = ({
  icon,
  text,
  isOpen,
  value,
  onChange,
  disabled,
  w,
  style,
  inputWidth,
  placeholder,
}: {
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: JSX.Element
  text?: string
  isOpen?: boolean
  disabled?: boolean
  w?: number
  style?: React.CSSProperties
  inputWidth?: number
  placeholder?: string
}): JSX.Element => {
  const { appTheme } = useGeneral()

  const rawStyle = {
    ...style,
    width: w ? w : '100%',
    height: '56px',
    borderRadius: '12px',
    alignItems: 'center',
  }

  const gradientTextStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )
  return (
    <InputSectionWrapper style={rawStyle}>
      {icon && text && (
        <Button
          nohover
          noborder
          p={8}
          mt={12}
          ml={12}
          mb={12}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Text>{icon}</Text>
            <Text t4 {...gradientTextStyle}>
              {text}
            </Text>
            <Text
              {...gradientTextStyle}
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '10px' }}
            >
              &#11206;
            </Text>
          </div>
        </Button>
      )}
      <StyledInput
        key="mainInput"
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl lg:border-0 lg:rounded-none"
        placeholder={placeholder ?? '0'}
        value={value}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', color: 'inherit', borderRadius: 'inherit', width: inputWidth ?? '100%' }}
        disabled={disabled}
      />
    </InputSectionWrapper>
  )
}

function Cover(): JSX.Element {
  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const navbarThreshold = useMemo(() => width >= (rightSidebar ? BKPT_2 : BKPT_NAVBAR), [rightSidebar, width])
  const [enteredDays, setEnteredDays] = React.useState<string | undefined>(undefined)
  const [enteredAmount, setEnteredAmount] = React.useState<string | undefined>(undefined)

  const bigButtonStyle = useMemo(() => {
    return {
      pt: 16,
      pb: 16,
      widthP: 100,
    }
  }, [])

  const gradientTextStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )

  return (
    <Content>
      <Flex col gap={24}>
        <Flex col>
          <Text mont {...gradientTextStyle} t2 textAlignCenter>
            Ready to protect your portfolio?
          </Text>
          <Text mont t3 textAlignCenter pt={8}>
            Here is the best policy price based on your portfolio and optimal coverage limit.
          </Text>
        </Flex>
        <Flex center>
          <div
            style={{
              width: navbarThreshold ? '50%' : '100%',
              gridTemplateColumns: '1fr 1fr',
              display: 'grid',
              position: 'relative',
              gap: '15px',
            }}
          >
            <TileCard bigger padding={16}>
              <Flex between style={{ alignItems: 'center' }}>
                <Text bold>My Portfolio</Text>
                <Text info>
                  <StyledOptions size={20} />
                </Text>
              </Flex>
              <Text t3s bold {...gradientTextStyle} pt={8}>
                $1
              </Text>
              <Flex pt={16}>??</Flex>
            </TileCard>
            <TileCard bigger padding={16}>
              <Flex between style={{ alignItems: 'center' }}>
                <Text bold>My Billing</Text>
                <Text info>
                  <StyledOptions size={20} />
                </Text>
              </Flex>
              <Text pt={8}>
                <TextSpan t3s bold {...gradientTextStyle}>
                  $1
                </TextSpan>
                <TextSpan t6 bold pl={5}>
                  / Day
                </TextSpan>
              </Text>
              <Flex col pt={16}>
                <Text t7 bold>
                  Coverage Limit:
                </Text>
                <Text t6>Highest Position + 20%</Text>
              </Flex>
            </TileCard>
          </div>
        </Flex>
        <TileCard style={{ margin: 'auto' }}>
          <Flex stretch between center pb={24}>
            <Flex col>
              <Text bold t4>
                My Balance
              </Text>
              <Text textAlignCenter bold t3 {...gradientTextStyle}>
                $69
              </Text>
            </Flex>
            <VerticalSeparator />
            <Flex col>
              <Text bold t4>
                Policy Status
              </Text>
              <Text textAlignCenter bold t3 success>
                Active
              </Text>
            </Flex>
            <VerticalSeparator />
            <Flex col>
              <Text bold t4>
                Est. Days
              </Text>
              <Text textAlignCenter bold t3 {...gradientTextStyle}>
                365
              </Text>
            </Flex>
          </Flex>
          <Flex col gap={12}>
            <Flex col>
              <Text mont t4s textAlignCenter>
                Enter the number of days or the amount of funds.
              </Text>
              <Text mont info t5s textAlignCenter italics underline pt={4}>
                Paid daily. Cancel and withdraw any time.
              </Text>
            </Flex>
            <DropdownInputSection
              placeholder={'Enter days'}
              icon={<StyledClock size={16} />}
              text={'Days'}
              value={enteredDays}
              onChange={(e) => setEnteredDays(e.target.value)}
            />
            <DropdownInputSection
              placeholder={'Enter amount'}
              icon={<img src={`https://assets.solace.fi/zapperLogos/frax`} height={16} />}
              text={'FRAX'}
              value={enteredAmount}
              onChange={(e) => setEnteredAmount(e.target.value)}
            />
            <ButtonWrapper isColumn p={0}>
              <Button {...gradientTextStyle} {...bigButtonStyle} secondary noborder>
                <Text bold t4s>
                  Purchase Policy
                </Text>
              </Button>
              <Button secondary matchBg {...bigButtonStyle} noborder>
                <Text bold t4s>
                  Withdraw Funds
                </Text>
              </Button>
            </ButtonWrapper>
          </Flex>
        </TileCard>
      </Flex>
    </Content>
  )
}

export default Cover
