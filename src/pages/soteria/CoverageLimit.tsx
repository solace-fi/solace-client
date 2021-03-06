import React, { useEffect, useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { QuestionCircle } from '@styled-icons/bootstrap/QuestionCircle'
import { Button } from '../../components/atoms/Button'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { useFunctions } from '../../hooks/policy/useSolaceCoverProduct'
import { useWallet } from '../../context/WalletManager'
import { BigNumber } from 'ethers'
import { LocalTx, ReadToken } from '../../constants/types'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { FunctionName } from '../../constants/enums'
import useDebounce from '@rooks/use-debounce'
import { Text } from '../../components/atoms/Typography'
import { CoverageLimitBasicForm } from './CoverageLimitBasicForm'
import { truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../context/GeneralManager'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'

export function CoverageLimit({
  balances,
  referralChecks,
  minReqAccBal,
  checkingMinReqAccBal,
  currentCoverageLimit,
  newCoverageLimit,
  isEditing,
  portfolio,
  referralCode,
  setNewCoverageLimit,
  setIsEditing,
  setReferralCode,
  canPurchaseNewCover,
  inactive,
  stableCoinData,
}: {
  balances: {
    totalAccountBalance: BigNumber
    personalBalance: BigNumber
    earnedBalance: BigNumber
  }
  referralChecks: {
    codeIsUsable: boolean
    codeIsValid: boolean
    referrerIsActive: boolean
    checkingReferral: boolean
    referrerIsOther: boolean
  }
  minReqAccBal: BigNumber
  checkingMinReqAccBal: boolean
  currentCoverageLimit: BigNumber
  newCoverageLimit: BigNumber
  isEditing: boolean
  portfolio: SolaceRiskScore | undefined
  referralCode: string | undefined
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
  setIsEditing: (isEditing: boolean) => void
  setReferralCode: (referralCode: string | undefined) => void
  canPurchaseNewCover: boolean
  stableCoinData: ReadToken
  inactive?: boolean
}): JSX.Element {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)
  const [doesReachMinReqAccountBal, setDoesReachMinReqAccountBal] = useState(false)

  const { updateCoverLimit } = useFunctions()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const referralValidation = useMemo(
    () =>
      referralChecks.codeIsUsable &&
      referralChecks.codeIsValid &&
      referralChecks.referrerIsActive &&
      !referralChecks.checkingReferral &&
      referralChecks.referrerIsOther,
    [referralChecks]
  )

  const callUpdateCoverLimit = async () => {
    if (!account) return
    await updateCoverLimit(newCoverageLimit, referralValidation && referralCode ? referralCode : [])
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callUpdateCoverLimit', err, FunctionName.SOTERIA_UPDATE_LIMIT))
  }

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    await handleToast(tx, localTx)
    setReferralCode(undefined)
    stopEditing()
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
  }

  const _checkMinReqAccountBal = useDebounce(async () => {
    setDoesReachMinReqAccountBal(balances.personalBalance.gt(minReqAccBal))
  }, 200)

  useEffect(() => {
    _checkMinReqAccountBal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minReqAccBal.toString(), balances.personalBalance.toString()])

  return (
    <Flex
      col
      stretch
      between
      style={{
        flex: '1',
      }}
    >
      <Flex col stretch gap={30} flex1>
        <Flex itemsCenter between>
          <Text t2 bold techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
            Coverage Limit
          </Text>
          <StyledTooltip
            id={'coverage-limit'}
            tip={[
              'Cover limit is the maximum payout in the event of a claim.',
              'You may set your cover limit to the amount of your largest position, or an amount of your choice.',
            ]}
          >
            <QuestionCircle height={20} width={20} color={'#aaa'} />
          </StyledTooltip>
        </Flex>
        <CoverageLimitBasicForm
          currentCoverageLimit={currentCoverageLimit}
          isEditing={isEditing}
          portfolio={portfolio}
          setNewCoverageLimit={setNewCoverageLimit}
        />
      </Flex>
      {!inactive &&
        isEditing &&
        (!canPurchaseNewCover ? (
          <Text autoAlignHorizontal t4 error>
            Cannot purchase new coverage
          </Text>
        ) : !doesReachMinReqAccountBal ? (
          <Text autoAlignHorizontal t4 error>
            This coverage limit requires a higher personal balance (Need at least over:{' '}
            {truncateValue(formatUnits(minReqAccBal, stableCoinData.decimals), 2)})
          </Text>
        ) : null)}
      <Flex justifyCenter={!isEditing} between={isEditing} gap={isEditing ? 20 : undefined} pt={10} pb={10}>
        {inactive ? null : !isEditing ? (
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
            <Button info pt={8} pb={8} style={{ fontWeight: 600, flex: 1, transition: '0s' }} onClick={stopEditing}>
              Discard
            </Button>
            <Button
              info
              secondary
              pt={8}
              pb={8}
              style={{ fontWeight: 600, flex: 1, transition: '0s' }}
              onClick={callUpdateCoverLimit}
              disabled={!doesReachMinReqAccountBal || !canPurchaseNewCover || checkingMinReqAccBal}
            >
              {!checkingMinReqAccBal ? `Save` : `Checking`}
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  )
}
