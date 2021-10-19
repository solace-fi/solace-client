/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    CoverageStep
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import react */
import React, { useEffect, useMemo, useState } from 'react'

/* import packages */
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { useLocation } from 'react-router'

/* import constants */
import { BKPT_4, DAYS_PER_YEAR, GAS_LIMIT, NUM_BLOCKS_PER_DAY, ZERO } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PositionType } from '../../constants/enums'
import { LiquityPosition, LocalTx, Position, Token } from '../../constants/types'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { FormRow, FormCol } from '../../components/atoms/Form'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { formProps } from './MultiStepForm'
import { Card, CardContainer } from '../../components/atoms/Card'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { FlexCol, FlexRow, HorizRule } from '../../components/atoms/Layout'
import { StyledTooltip } from '../../components/molecules/Tooltip'

/* import hooks */
import { useGetQuote, useGetMaxCoverPerPolicy } from '../../hooks/usePolicy'
import { useGasConfig } from '../../hooks/useGas'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { accurateMultiply, encodeAddresses, filteredAmount } from '../../utils/formatting'
import { getDateStringWithMonthName, getDateExtended } from '../../utils/time'

export const CoverageStep: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { positions, coverAmount, timePeriod, loading } = formData
  const maxCoverPerPolicy = useGetMaxCoverPerPolicy() // in eth
  const quote = useGetQuote(coverAmount, timePeriod)
  const { account } = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
  const maxCoverPerPolicyInWei = useMemo(() => {
    return parseUnits(maxCoverPerPolicy, currencyDecimals)
  }, [maxCoverPerPolicy, currencyDecimals])
  const { width } = useWindowDimensions()

  // positionAmount: BigNumber = wei but displayable, position.eth.balance: BigNumber = wei
  const positionAmount: BigNumber = useMemo(() => {
    const totalBalance = positions.reduce((pv: BigNumber, cv: Position) => {
      switch (cv.type) {
        case PositionType.TOKEN:
          return pv.add((cv.position as Token).eth.balance)
        case PositionType.LQTY:
          return pv.add((cv.position as LiquityPosition).nativeAmount)
        case PositionType.OTHER:
        default:
          ZERO
      }
    }, ZERO)
    if (totalBalance.eq(ZERO)) return ZERO
    return BigNumber.from(accurateMultiply(formatUnits(totalBalance, currencyDecimals), currencyDecimals))
  }, [positions, currencyDecimals])

  const [inputCoverage, setInputCoverage] = useState<string>('')
  const [coveredAssets, setCoveredAssets] = useState<string>(maxCoverPerPolicy)

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const buyPolicy = async () => {
    setForm({
      target: {
        name: 'loading',
        value: true,
      },
    })
    if (!selectedProtocol) return
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await selectedProtocol.buyPolicy(
        account,
        coverAmount,
        NUM_BLOCKS_PER_DAY * parseInt(timePeriod),
        encodeAddresses(
          positions.reduce((pv: string[], cv: Position) => {
            switch (cv.type) {
              case PositionType.TOKEN:
                pv.push((cv.position as Token).token.address)
                break
              case PositionType.LQTY:
                pv.push((cv.position as LiquityPosition).positionAddress)
                break
              case PositionType.OTHER:
              default:
            }
            return pv
          }, [])
        ),
        {
          value: parseUnits(quote, currencyDecimals),
          ...gasConfig,
          gasLimit: GAS_LIMIT,
        }
      )
      navigation.next()
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        value: 'Policy',
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('buyPolicy', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setForm({
        target: {
          name: 'loading',
          value: false,
        },
      })
      reload()
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

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
    if ((parseFloat(filtered) <= DAYS_PER_YEAR && parseFloat(filtered) > 0) || filtered == '') {
      setTime(filtered)
    }
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = filtered == '0.' || filtered == '.' || filtered == '' ? '0.0' : filtered

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > currencyDecimals) return

    // if number is greater than the max cover per user, do not update
    if (parseUnits(formatted, currencyDecimals).gt(maxCoverPerPolicyInWei)) return

    setInputCoverage(filtered)
    setCoverage(accurateMultiply(formatted, currencyDecimals))
  }

  // coverAmount in wei
  const setCoverage = (coverAmount: string) => {
    setForm({
      target: {
        name: 'coverAmount',
        value: coverAmount,
      },
    })
  }

  const handleCoverageChange = (coverAmount: string, convertFromSciNota = true) => {
    setInputCoverage(
      formatUnits(BigNumber.from(`${convertFromSciNota ? +coverAmount : coverAmount}`), currencyDecimals)
    )
    setCoverage(`${convertFromSciNota ? +coverAmount : coverAmount}`)
  }

  const setMaxCover = () => {
    const adjustedCoverAmount = maxCoverPerPolicyInWei.toString()
    handleCoverageChange(adjustedCoverAmount, false)
  }

  const setPositionCover = () => {
    if (positionAmount.lte(maxCoverPerPolicyInWei)) {
      handleCoverageChange(positionAmount.toString())
    } else {
      setMaxCover()
    }
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    setPositionCover()
  }, [maxCoverPerPolicyInWei])

  useEffect(() => {
    setCoveredAssets(formatUnits(BigNumber.from(coverAmount), currencyDecimals))
  }, [coverAmount, currencyDecimals])

  const TermsCard = () => (
    <Card transparent>
      <FormRow>
        <Text t2 bold>
          Terms and conditions
        </Text>
      </FormRow>
      <FormRow>
        <Text t3 bold>
          By using the Solace protocol you agree that you have read, understand and are bound to the Terms &amp;
          Conditions of Service. If you do not agree please exit and do not use the site.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3 bold>
          Additionally, you agree that the use of our site, protocol and products are risky and could result in loss of
          funds and other known and unknown risks. If you choose to use Solace, the protocol, or products you are
          agreeing to be bound by this agreement which is a legally binding contract together with all other agreements
          and policies that are incorporated herein by reference which shall govern your use of the site or products at
          all times. Use at your own risk. You agree to comply with all local laws, any federal and/or international
          laws regarding online conduct and acceptable content.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          You acknowledge that the website and your use of the website contain risks, and that you assume all risks in
          connection with your access and use of the Solace website, the Solace application and Solace smart contracts.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          We do not guarantee that the website, or any content on it, will always be available or uninterrupted. Access
          may be interrupted, suspended or restricted, including because of a fault, error or unforeseen circumstances
          and/or because of maintenance.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace
          protocol and the decentralized governance being the final determinant. In the event of any disagreement with
          claims that are not paid based upon the determination by the Automatic Claim Assessment System your claim can
          be presented to the core team and/or the DAO for review of your claim decision. The DAO shall provide the
          final decision on the legitimacy of any claim under these circumstances.
        </Text>
      </FormRow>
      <FormRow>
        <Text t4>
          <b>Solace provides coverage policies across following exploits types:</b>
          <ul>
            <li>Minting vulnerability</li>
            <li>Flash loan attack</li>
            <li>Trojan fake token</li>
            <li>Proxy manipulation</li>
            <li>Math error</li>
            <li>Re-entry attack</li>
          </ul>
          <b>Does not provide for:</b>
          <ul>
            <li>Price arbitrage</li>
            <li>Compromised private keys</li>
            <li>Phishing attack</li>
          </ul>
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          That means you are prevented from making a claim in cases including but not limited to losing private keys,
          using hacked application’s frontend and/or market volatility.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3 bold>
          Solace only pays out financial loss (within coverage limit) and not the overall position covered by the end
          user. You can make a claim only during the period you’ve set before buying a policy that provides protection
          during your coverage window.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          Solace is designed to provide access to a decentralized, non-custodial, coverage protocol that allows
          blockchain-based assets to transact using smart contracts. To obtain coverage, you must connect your
          cryptocurrency wallet. You are responsible for maintaining the confidentiality of your wallet, password,
          personal information, and account details. You are fully responsible for any and all activities that occur
          with your wallet, password, personal information and/or account. Solace will not be liable for any loss or
          damage arising from the use of your wallet or failure to comply with this paragraph.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          Solace reserves the right to make any changes, at any time, to these Terms &amp; Conditions and all policies
          referenced herein. In addition, some services offered through the Site may be subject to additional terms and
          conditions promulgated from time to time. The changes and additional terms and conditions are incorporated
          into this Agreement by reference, and, unless otherwise provided herein or in the applicable policy, they will
          be effective as of the date the revised version is posted on the Site.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          Use of the site or services following any such change or additions constitutes acceptance of the revised Terms
          &amp; Conditions and/or policies. Thus, it is important that the Terms &amp; Conditions and policies be
          reviewed regularly.
        </Text>
      </FormRow>
      <FormRow>
        <Text t3>
          UNDER NO CIRCUMSTANCES WILL SOLACE, ITS AFFILIATES OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS,
          DAO, COMMUNITY MEMBERS, OFFICERS OR DIRECTORS BE LIABLE FOR DAMAGE OF ANY KIND, ARISING OUT OF OR IN
          CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, ANY WEBSITES LINKED TO IT, INCLUDING ANY DIRECT,
          INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL
          INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR
          ANTICIPATED SAVINGS, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR
          OTHERWISE.
        </Text>
      </FormRow>
    </Card>
  )

  return (
    <CardContainer cardsPerRow={2}>
      {width <= BKPT_4 && <TermsCard />}
      <Card style={{ height: 'fit-content' }}>
        <FormRow mb={5}>
          <FormCol>
            <Text bold t2>
              Total Assets
              {/* {' '}
              <StyledTooltip
                id={`total-assets`}
                tip={`The sum of amounts from your chosen positions denominated in ${activeNetwork.nativeCurrency.symbol}`}
              /> */}
            </Text>
          </FormCol>
          <FormCol>
            <Text bold t2 textAlignRight info>
              {formatUnits(positionAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={15}>
          <FormCol>
            <Text t3>
              Max Coverage
              {/* {' '}
              <StyledTooltip
                id={`max-coverage`}
                tip={`Each policy can only cover up to a certain amount based on the size of the capital pool and active cover`}
              /> */}
            </Text>
          </FormCol>
          <FormCol>
            <Text t3 textAlignRight info>
              {maxCoverPerPolicy} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FormCol>
        </FormRow>
        <HorizRule style={{ marginBottom: '10px' }} />
        <FlexCol mb={20} style={{ padding: '10px 30px' }}>
          <div style={{ textAlign: 'center' }}>
            <Text t3>Coverage Amount</Text>
            <Text t4>How much do you want to cover?</Text>
            <div style={{ marginBottom: '20px' }}>
              <Input
                mt={20}
                mb={5}
                textAlignCenter
                type="text"
                value={inputCoverage}
                onChange={(e) => handleInputCoverage(filteredAmount(e.target.value, inputCoverage))}
                info
              />
              {maxCoverPerPolicyInWei.gt(positionAmount) && (
                <Button
                  disabled={haveErrors}
                  ml={10}
                  pt={4}
                  pb={4}
                  pl={2}
                  pr={2}
                  width={120}
                  height={30}
                  onClick={() => setPositionCover()}
                  info
                >
                  Cover to position
                </Button>
              )}
              <Button
                disabled={haveErrors}
                ml={10}
                pt={4}
                pb={4}
                pl={8}
                pr={8}
                width={70}
                height={30}
                onClick={() => setMaxCover()}
                info
              >
                MAX
              </Button>
            </div>
            <StyledSlider
              value={coverAmount}
              onChange={(e) => handleCoverageChange(e.target.value)}
              min={1}
              max={maxCoverPerPolicyInWei.toString()}
            />
          </div>
          <br />
          <div style={{ textAlign: 'center' }}>
            <Text t3>Coverage Period</Text>
            <Text t4>How many days should the coverage last?</Text>
            <div style={{ marginBottom: '20px' }}>
              <Input
                mt={20}
                mb={5}
                textAlignCenter
                type="text"
                pattern="[0-9]+"
                value={timePeriod}
                onChange={(e) => filteredTime(e.target.value)}
                maxLength={3}
                info
              />
            </div>
            <StyledSlider
              value={timePeriod == '' ? '1' : timePeriod}
              onChange={(e) => setTime(e.target.value)}
              min="1"
              max={DAYS_PER_YEAR}
            />
          </div>
        </FlexCol>
        <HorizRule style={{ marginBottom: '20px' }} />
        <FormRow mb={5}>
          <FormCol>
            <Text t4>Covered Assets</Text>
          </FormCol>
          <FormCol>
            <FlexRow>
              <Text t4 bold info>
                {coveredAssets} {activeNetwork.nativeCurrency.symbol}
              </Text>
            </FlexRow>
          </FormCol>
        </FormRow>
        <FormRow mb={5}>
          <FormCol>
            <Text t4>Covered Period</Text>
          </FormCol>
          <FormCol>
            <Text t4>
              <TextSpan nowrap pl={5} pr={5} info>
                {getDateStringWithMonthName(new Date(Date.now()))}
              </TextSpan>{' '}
              <TextSpan info>-</TextSpan>{' '}
              <TextSpan pl={5} pr={5} info>
                {getDateStringWithMonthName(getDateExtended(parseFloat(timePeriod || '1')))}
              </TextSpan>
            </Text>
          </FormCol>
        </FormRow>
        <FormRow mb={5}>
          <FormCol>
            <Text t2>Premium</Text>
          </FormCol>
          <FormCol>
            <Text t2 bold info>
              {quote} {activeNetwork.nativeCurrency.symbol}
            </Text>
          </FormCol>
        </FormRow>
        <ButtonWrapper>
          {!loading ? (
            <Button widthP={100} onClick={() => buyPolicy()} disabled={haveErrors || coveredAssets == '0.0'} info>
              Buy
            </Button>
          ) : (
            <Loader />
          )}
        </ButtonWrapper>
      </Card>
      {width > BKPT_4 && <TermsCard />}
    </CardContainer>
  )
}
