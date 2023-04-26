import React, { useCallback, useMemo, useState } from 'react'
import { Content, Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'
import { getDateStringWithMonthName } from '../../utils/time'
import { BribeList } from './components/BribesList'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useBribeController } from '../../hooks/bribe/useBribeController'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useNetwork } from '../../context/NetworkManager'
import { useBribeContext } from './BribeContext'
import { Card } from '../../components/atoms/Card'
import { StyledInfo } from '../../components/atoms/Icon'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../vote/VoteContext'
import { useWeb3React } from '@web3-react/core'
import { Modal } from '../../components/molecules/Modal'
import { BalanceDropdownOptions } from '../../components/organisms/Dropdown'

export default function Bribe(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const canBribe = useMemo(() => activeNetwork.config.generalFeatures.native, [
    activeNetwork.config.generalFeatures.native,
  ])
  return (
    <>
      {canBribe ? (
        <BribeContent />
      ) : (
        <Content>
          <Card error pt={10} pb={10} pl={15} pr={15}>
            <Flex>
              <TextSpan light textAlignLeft>
                <StyledInfo size={30} />
              </TextSpan>
              <Text light bold autoAlign>
                Bribes are not available on this network.
              </Text>
            </Flex>
          </Card>
        </Content>
      )}
    </>
  )
}

export function BribeContent(): JSX.Element {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const { claimBribes, removeVotesForMultipleBribes } = useBribeController()
  const { isSmallerMobile } = useWindowDimensions()
  const { bribes } = useBribeContext()
  const { claimableBribes, bribeTokens, userAvailableVotePowerBPS, userVotes } = bribes
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, epochEnd } = voteGeneral
  const { remainingTime, epochEndTimestamp } = epochEnd
  const { votesData } = voteOwner

  const [isBribeChaser, setIsBribeChaser] = useState<boolean>(true)
  const [showClaimableTokens, setShowClaimableTokens] = useState<boolean>(false)

  const claimableInfo = useMemo(() => {
    let totalUSD = 0
    const tokens = []
    for (let i = 0; i < claimableBribes.length; i++) {
      const bribe = claimableBribes[i]
      const token = bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
      if (token) {
        tokens.push({ ...token, bribeAmount: bribe.bribeAmount })
        totalUSD += token.price * parseFloat(formatUnits(bribe.bribeAmount, token.decimals))
      }
    }
    return { claimableUSD: totalUSD, claimableTokens: tokens }
  }, [bribeTokens, claimableBribes])

  const callRemoveVotes = useCallback(async () => {
    if (!account) return
    const votesToRemove = userVotes.filter((vote) => !vote.votePowerBPS.isZero())
    if (votesToRemove.length == 0) return
    const gaugeIds = votesToRemove.map((vote) => vote.gaugeID)
    await removeVotesForMultipleBribes(account, gaugeIds)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVotes', err, FunctionName.BRIBE_REMOVE_VOTES_MULTIPLE_BRIBES))
  }, [account, userVotes, removeVotesForMultipleBribes])

  const callClaim = useCallback(async () => {
    await claimBribes()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callClaim', err, FunctionName.BRIBE_CLAIM))
  }, [claimBribes])

  const handleShowClaimableTokens = useCallback((toggle: boolean) => {
    setShowClaimableTokens(toggle)
  }, [])

  return (
    <Flex col gap={16}>
      <Modal
        isOpen={showClaimableTokens}
        handleClose={() => handleShowClaimableTokens(false)}
        modalTitle={'Reward Details'}
      >
        <BalanceDropdownOptions
          searchedList={claimableInfo.claimableTokens.map((token) => {
            return { ...token, balance: token.bribeAmount }
          })}
          isOpen={true}
          noneText={'No rewards available'}
        />
      </Modal>
      <Flex
        bgSecondary
        style={{
          gridTemplateColumns: '1fr 1fr',
          display: 'grid',
          position: 'relative',
          borderRadius: '16px',
          padding: '8px',
          gap: '8px',
        }}
      >
        <TileCard
          padding={8}
          noShadow
          onClick={() => setIsBribeChaser(true)}
          style={{
            cursor: 'pointer',
            borderRadius: '12px',
          }}
          bgSecondary={!isBribeChaser}
          bgTechy={isBribeChaser && appTheme == 'light'}
          bgWarm={isBribeChaser && appTheme == 'dark'}
        >
          <Text textAlignCenter t5s bold light={isBribeChaser}>
            Chase Bribe
          </Text>
        </TileCard>
        <TileCard
          padding={8}
          noShadow
          onClick={() => setIsBribeChaser(false)}
          style={{
            cursor: 'pointer',
            borderRadius: '12px',
          }}
          bgSecondary={isBribeChaser}
          bgTechy={!isBribeChaser && appTheme == 'light'}
          bgWarm={!isBribeChaser && appTheme == 'dark'}
        >
          <Text textAlignCenter t5s bold light={!isBribeChaser}>
            Provide Bribe
          </Text>
        </TileCard>
      </Flex>
      <Flex col={isSmallerMobile} gap={16}>
        <Flex gap={16}>
          <TileCard bgSecondary style={{ width: isSmallerMobile ? '100%' : undefined }}>
            <Flex col gap={25}>
              <Flex gap={25} around>
                <Flex col itemsCenter gap={8}>
                  <Text bold t6s textAlignCenter>
                    Total Vote Points
                  </Text>
                  <Text t2 bold>
                    {truncateValue(formatUnits(votesData.votePower, 18), 2)}
                  </Text>
                </Flex>
                <Flex col itemsCenter gap={8}>
                  <Text bold t6s textAlignCenter>
                    Total Used Percentage
                  </Text>
                  <Text t2 info>
                    {(10000 - userAvailableVotePowerBPS.toNumber()) / 100}%
                  </Text>
                </Flex>
              </Flex>
              <Button disabled={userAvailableVotePowerBPS.toNumber() == 10000} onClick={callRemoveVotes}>
                Remove all Votes from Bribes
              </Button>
            </Flex>
          </TileCard>
          <TileCard bgSecondary style={{ width: isSmallerMobile ? '100%' : undefined }}>
            <Flex col gap={25}>
              <Flex col itemsCenter gap={8}>
                <Text bold t6s>
                  Total Rewards
                </Text>
                <Text t2>${truncateValue(claimableInfo.claimableUSD, 2)}</Text>
              </Flex>
              <Flex center col={isSmallerMobile}>
                <Button
                  widthP={100}
                  onClick={() => handleShowClaimableTokens(true)}
                  disabled={claimableInfo.claimableUSD == 0}
                >
                  Details
                </Button>
                <Button widthP={100} info onClick={callClaim} disabled={claimableInfo.claimableUSD == 0}>
                  Claim
                </Button>
              </Flex>
            </Flex>
          </TileCard>
        </Flex>
        <TileCard bgSecondary>
          <Flex col itemsCenter gap={16}>
            {epochEndTimestamp && (
              <Text bold t6s>
                Epoch ends{' '}
                {<TextSpan info>{getDateStringWithMonthName(new Date(epochEndTimestamp.toNumber() * 1000))}</TextSpan>}
              </Text>
            )}
            <Flex gap={8}>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.days}
                </Text>
                <Text t7s textAlignCenter>
                  Days
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.hours}
                </Text>
                <Text t7s textAlignCenter>
                  Hrs
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.minutes}
                </Text>
                <Text t7s textAlignCenter>
                  Mins
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.seconds}
                </Text>
                <Text t7s textAlignCenter>
                  Secs
                </Text>
              </TileCard>
            </Flex>
            <Text success={isVotingOpen} error={!isVotingOpen} t5s bold>
              {isVotingOpen ? 'Bribes Open' : 'Bribes Closed'}
            </Text>
          </Flex>
        </TileCard>
      </Flex>
      <BribeList isBribeChaser={isBribeChaser} />
    </Flex>
  )
}
