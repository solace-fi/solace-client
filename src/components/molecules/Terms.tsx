import React from 'react'

import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { Content } from '../atoms/Layout'
import { GeneralElementProps } from '../generalInterfaces'

export const TermsText: React.FC<GeneralElementProps> = (props) => (
  <Content {...props}>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Terms and conditions
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        By using the Solace protocol you agree that you have read, understand and are bound to the Terms &amp;
        Conditions of Service. If you do not agree please exit and do not use the site.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Additionally, you agree that the use of our site, protocol and products are risky and could result in loss of
        funds and other known and unknown risks. If you choose to use Solace, the protocol, or products you are agreeing
        to be bound by this agreement which is a legally binding contract together with all other agreements and
        policies that are incorporated herein by reference which shall govern your use of the site or products at all
        times. Use at your own risk. You agree to comply with all local laws, any federal and/or international laws
        regarding online conduct and acceptable content.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        You acknowledge that the website and your use of the website contain risks, and that you assume all risks in
        connection with your access and use of the Solace website, the Solace application and Solace smart contracts.
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
        This coverage is not a contract of insurance. Coverage is provided on a discretionary basis with Solace protocol
        and the decentralized governance being the final determinant. In the event of any disagreement with claims that
        are not paid based upon the determination by the Automatic Claim Assessment System your claim can be presented
        to the core team and/or the DAO for review of your claim decision. The DAO shall provide the final decision on
        the legitimacy of any claim under these circumstances.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
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
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        That means you are prevented from making a claim in cases including but not limited to losing private keys,
        using hacked application’s frontend and/or market volatility.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Solace only pays out financial loss (within coverage limit) and not the overall position covered by the end
        user. You can make a claim only during the period you’ve set before buying a policy that provides protection
        during your coverage window.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Solace is designed to provide access to a decentralized, non-custodial, coverage protocol that allows
        blockchain-based assets to transact using smart contracts. To obtain coverage, you must connect your
        cryptocurrency wallet. You are responsible for maintaining the confidentiality of your wallet, password,
        personal information, and account details. You are fully responsible for any and all activities that occur with
        your wallet, password, personal information and/or account. Solace will not be liable for any loss or damage
        arising from the use of your wallet or failure to comply with this paragraph.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Solace reserves the right to make any changes, at any time, to these Terms &amp; Conditions and all policies
        referenced herein. In addition, some services offered through the Site may be subject to additional terms and
        conditions promulgated from time to time. The changes and additional terms and conditions are incorporated into
        this Agreement by reference, and, unless otherwise provided herein or in the applicable policy, they will be
        effective as of the date the revised version is posted on the Site.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        Use of the site or services following any such change or additions constitutes acceptance of the revised Terms
        &amp; Conditions and/or policies. Thus, it is important that the Terms &amp; Conditions and policies be reviewed
        regularly.
      </Text>
    </Flex>
    <Flex stretch between mb={24}>
      <Text t2 bold>
        UNDER NO CIRCUMSTANCES WILL SOLACE, ITS AFFILIATES OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS,
        DAO, COMMUNITY MEMBERS, OFFICERS OR DIRECTORS BE LIABLE FOR DAMAGE OF ANY KIND, ARISING OUT OF OR IN CONNECTION
        WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, ANY WEBSITES LINKED TO IT, INCLUDING ANY DIRECT, INDIRECT,
        SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND
        SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS
        OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR OTHERWISE.
      </Text>
    </Flex>
  </Content>
)
