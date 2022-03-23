import React from 'react'

import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Content } from '../atoms/Layout'
import { GeneralElementProps } from '../generalInterfaces'

export const TermsText: React.FC<GeneralElementProps> = (props) => (
  <Content {...props}>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        SOLACE TERMS &amp; CONDITIONS
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Thank you for checking out Solace. Below are the details concerning Solace Coverage and the process and
        procedures when a smart contract exploit event occurs. Please read them carefully prior to using the site or
        purchasing coverage, and if you do not agree with these terms and conditions please exit the site. If you have
        any questions please contact us on twitter or discord and we can provide clarity. Solace reserves the right to
        change the terms and conditions at any time.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        TIMING OF COVERAGE
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Solace coverage is based upon a model that allows for users to carry a balance for payment of their premiums.
        This premium balance is then gradually used to secure and protect their positions. As long as there is a balance
        to cover select positions, coverage is secure and active. Cover shall terminate and the previously covered
        position(s) will no longer be active when the prepaid policy premium hits a zero balance.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        At this time we are unable to provide notification when your position is no longer covered or the covered
        position exceeds the selected protection. This could occur if your position increases in value. We suggest that
        in addition to actively managing your coverage, that you select the option to protect 120% of your highest
        position to help mitigate this possibility.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        When your wallet is connected and the coverage process is complete, the timing of the start of coverage will be
        as follows. If the covered protocol is on the same Blockchain where the policy was purchased, the policy will
        take effect in the next block once the policy has been confirmed. If the covered protocol is on a different
        Blockchain from where the policy was purchased, the Cover will take effect 15 minutes after the timestamp of the
        block where the cover is confirmed on the Blockchain.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        We do not guarantee that the website, or any content on it, will always be available or uninterrupted. Access
        may be interrupted, suspended or restricted, including because of a fault, error or unforeseen circumstances
        and/or because of maintenance.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        COVERED EVENTS
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        <b>
          Solace coverage products cover technical risk or smart contract exploits and hacks. These include all of the
          following.
        </b>
        <ul>
          <li>Minting vulnerabilities</li>
          <li>Flash loan attack</li>
          <li>Trojan fake tokens</li>
          <li>Proxy manipulation</li>
          <li>Math error</li>
          <li>Re-entry attack</li>
        </ul>
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        NON-COVERED EVENTS
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        <b>Does not provide for:</b>
        <ul>
          <li>NFT losses</li>
          <li>Losses due to phishing, private key security breaches, malware, exchange transaction hacks</li>
          <li>
            Any other activities where the Designated smart contract continues to act as intended or any activities
            conducted by insured because of personal careless or misunderstanding
          </li>
          <li>Any hacks or pre-defined insured events occurring outside of the blocks when a policy has premium</li>
          <li>Positions that were previously held but not currently protected with coverage</li>
          <li>Any other event that is not listed under coverage events above</li>
        </ul>
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        PAYOUT AMOUNT
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        A claim payout will only cover losses actually incurred where such losses do not exceed the Cover Limit in
        effect at the time of exploit. Calculation of actual loss shall be done by examining the price of the
        cryptocurrency in question at the time of transaction in which loss occurs based on data extracted from
        CoinGecko or any other sources regarded as reliable and fair. Any recovered losses received from the exploited
        protocol as compensation for your losses shall be excluded from the claim payment and not considered part of the
        loss amount.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        AUTOMATED PAYOUT PROCESS
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Following determination that an exploit has occurred, and a subsequent loss, claims are processed proactively
        and require no action from the policyholder. This occurs within seven (7) days after the loss.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Should a policyholder believe they are entitled to a claim that has not been paid out within seven (7) days of
        an exploit, a request can be made to reexamine the matter. Under these circumstances, proof of loss must be
        submitted during the Cover Period or within 15 days after the Cover expires. Proof of loss could include, but is
        not limited to: a snapshot of the impacted wallet address&apos;s balance at blocks before and after any losses
        have been applied; and/or a description of the attack which results in the loss from the covered protocol team
        or security specialist; and/or references to any relevant on-chain transactions showing assets being moved;
        and/or evidence to prove the ownership of the impacted wallet address; and/or supporting materials to determine
        the price of lost assets; and/or other evidence showing a loss occurred.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Upon considering a rejected claim, Solace Claims Assessors will examine any evidence of proof of loss that is
        provided, as well as any additional details that assist in resolving the matter. All Cover is provided on an
        optimistic settlement basis with Solace DAO members having final determination on which reexamined claims are
        within our coverage policy as listed above.
      </Text>
    </Flex>
  </Content>
)
