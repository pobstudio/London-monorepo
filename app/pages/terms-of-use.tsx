import styled from 'styled-components';
import React from 'react';
import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { ContentRowV2, ContentWrapper } from '../components/content';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { HASH_PROD_LINK } from '../constants';
import { BREAKPTS } from '../styles';
import { ROUTES } from '../constants/routes';

const H3 = styled.h3`
  font-family: Helvetica;
  font-style: normal;
  font-weight: 400;
  font-size: 48px;
  line-height: 48px;
  margin: 0;
  text-transform: uppercase;
  padding-left: 0px;
  @media (max-width: ${BREAKPTS.LG}px) {
    font-size: 36px;
    line-height: 36px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
    line-height: 36px;
  }
`;

const TosPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title={'$HASH by POB - Terms of Use'}
        description={`$HASH by POB - Terms of Use`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.TOU}`,
          title: '$HASH by POB - Terms of Use',
          description: '$HASH by POB - Terms of Use',
          site_name: 'POB',
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
      />
      <ContentWrapper>
        <Header />
        <ContentRowV2 style={{ paddingTop: 48 }}>
          <H3>Terms of Use</H3>
          <h4>Proof of Beauty, LLC Terms of Use</h4>
          <h5>Last Updated: April 20, 2021</h5>
          <p>
            Proof of Beauty, LLC Terms of Use Last Updated: April 20, 2021 Your
            Acceptance Welcome to the Terms of Use for the Proof of Beauty, LLC
            website, hash.pob.studio. This is an agreement (“Agreement”) between
            Proof of Beauty, LLC (“POB”), the owner and operator of the
            hash.pob.studio website (the “Site”) and you (“you”, “your” or
            “user(s)”), a user of the Site. Throughout this Agreement, the words
            “POB,” “us,” “we,” and “our,” refer to our company, POB, as is
            appropriate in the context of the use of the words. By clicking “I
            agree” or accessing the Site you agree to be bound by this Agreement
            and the Privacy Policy. We may amend this Agreement at any time and
            may notify you if we do so. Please be aware that there are
            ARBITRATION AND CLASS ACTION PROVISIONS contained in this Agreement.
            Definitions In these Terms; “Applicable Law” means any law, rule,
            statute, subordinate legislation, regulation, by-law order,
            ordinance, protocol, code, guideline, treaty, policy, notice,
            direction or judicial, arbitral, administrative, ministerial or
            departmental judgment, award, decree, treaty, directive, or other
            requirement or guideline published or in force at any time which
            applies to or is otherwise intended to govern or regulate any person
            (including all parties to this Terms), property, transaction,
            activity, event or other matter, including any rule, order,
            judgment, directive or other requirement or guideline issued by any
            governmental or regulatory authority; “ETH” means the cryptocurrency
            Ethereum; “Mint/Minting” means causing a piece of digital art to
            become of the public ledger that is unchangeable and tamper-proof;
            “NFT” means Non-fungible Token; “(The) Protocol” means the process
            that facilitates the Minting of NFTs; and “Undesired Transactions”
            means the failed Minting by a user of our Site. Information
            Submission Portions of the Site may allow you to submit information
            to us. You must fully complete the information submission process by
            providing us with your current, complete, truthful, and accurate
            information as prompted by the applicable form. We do not have “User
            Accounts” as the Site’s users are connected via wallets. Content
            Disclaimer POB Content (defined below) is offered only for
            informational and educational purposes. You assume the monetary risk
            of loss associated with Minting NFTs and that Minting may not be
            successful, either due Undesired Transactions or otherwise. POB does
            not provide financial, investing, tax, or legal advice. Please
            consult your attorneys and accountants with respect to the impact on
            Minting NFTs through our Site. You agree that any POB Content or any
            other information found on the Site may be inaccurate,
            unsubstantiated or possibly even incorrect. You agree to release us
            from any liability that we may incur for making available any POB
            Content. Ownership The Site and any related services provided are
            owned and operated by POB including all text, data, graphics,
            photographs, images, audio, video, trademarks, service marks, trade
            names and other information, visual or other digital material,
            software (including source and object codes) and all other content
            or any description available on the Site or available via a link
            from Site to a page created by POB on another website (collectively,
            the "POB Content"). The POB Content is the sole property of POB
            and/or its licensors. All POB Content is protected by US and
            international copyright, trade-mark, service marks, patents, trade
            secrets and other proprietary rights and laws. Use of the POB
            Content for any purpose not expressly permitted in this Agreement or
            otherwise consented to by POB is prohibited. You may not otherwise
            copy, reproduce, perform, distribute, display or create derivative
            works of the POB Content. NFT Minting Process You can Mint NFTs in
            accordance with the Terms herein. The Protocol that facilities
            Minting of NFTs through our Site is open-sourced and viewable on
            github and etherscan. We own and operate the Protocol. To Mint an
            NFT, follow the instructions on our Site through the completion of
            the checkout process (applicable fees discussed below). Generally,
            users will pay to mint via the sending and Minting of the
            transaction via the blockchain. We do not have user accounts;
            rather, our users are inter-connected via wallets such as Metamask,
            Coinbase wallet, etc. We use the API given to us by the wallet to
            send transactions to the blockchain. Fees By buying and selling
            NFTs, you agree to pay all applicable fees as stipulated on the
            checkout screen at the time of your purchase. The fees will be paid
            to us via ETH. You understand that once the fees are paid, there are
            absolutely no refunds. Resales & Reuse Reselling is conducted on the
            digital platform, OpenSea, not by us. You agree to abide by
            OpenSea’s Terms of Service, Privacy Policy, and any other terms and
            conditions it may have should you abide yourself of its platform.
            For reuse, we adhere to www.nftlicense.org. Please visit that page
            for further information on reuse of NFTs. Privacy Please read POB’s
            Privacy Policy for more information regarding our collection and use
            of your information. The POB Privacy Policy is integrated into this
            Agreement, by reference and you must agree to all provisions of our
            Privacy Policy before using our Site. You may not be required to
            create a user account when you use our Site; however, we may collect
            information from you when you submit an inquiry or comment through
            the Site. Site Availability and Modification Although we attempt to
            provide continuous Site availability to you, we do not guarantee
            that the Site will always be available, work, or be accessible at
            any particular time. Regardless, we do offer a decentralized and
            opensourced gateway to our Site in the event that the Site isn’t
            otherwise available. We reserve the right to alter, modify, update,
            or remove our Site at any time. We may conduct such modifications to
            our Site for security reasons, intellectual property, legal reasons,
            or various other reasons at our discretion; however, nothing in this
            section obligates us to take measures to update the Site for
            security, legal, or other reasons. Third Party Links The Site may
            contain links to third party websites that are not owned or
            controlled by POB. POB has no control over, and assumes no
            responsibility for, the content, privacy policies, or practices of
            any third party websites. In addition, POB will not and cannot
            censor or edit the content of any third-party site. By using the
            Site, you expressly relieve POB from any and all liability arising
            from your use of any third-party website. Your Conduct While Using
            The Site When accessing or using our Site, you are solely
            responsible for your actions and you agree to abide by the following
            rules of conduct: You will not copy, distribute or disclose any part
            of the Site in any medium, including without limitation by any
            automated or non-automated “scraping”; You will not attempt to
            interfere with, compromise the system integrity or security, or
            decipher any transmissions to or from the servers running the Site;
            You will not use any robot, spider, crawler, scraper or other
            automated means or interface not provided by us to access the Site
            or to extract or export data collected through the Site; You will
            not take any action that imposes, or may impose at our sole
            discretion, an unreasonable or disproportionately large load on our
            infrastructure; You agree not to use the Site to stalk, harass,
            bully or harm another individual; You agree that you will not hold
            POB responsible for your use of the Site; You agree not to violate
            any requirements, procedures, policies or regulations of networks
            connected to POB; You agree not to interfere with or disrupt the
            Site; You agree to not violate any US federal laws, state laws, or
            local laws while using the Site; and You agree not to use the Site
            in any way that is: misleading, unlawful, defamatory, obscene,
            invasive, threatening, or harassing. If you are discovered to be
            undertaking any of the aforementioned actions your privileges to use
            our Site may at our discretion be terminated or suspended.
            Generally, we will provide an explanation for any suspension or
            termination of your use of any of our Site, but POB reserves the
            right to suspend or terminate your access at any time without notice
            or explanation. User Content A user’s ability to submit or transmit
            any information through the Site, including but not limited to text,
            information, photos, images or any other information will be
            referred to as “User Content” throughout this Agreement. All User
            Content you submit to the Site is owned by you. When you submit any
            User Content to us, you grant POB, its partners, affiliates, users,
            representatives and assigns a non-exclusive, limited, fully-paid,
            royalty-free, irrevocable, world-wide, universal, transferable,
            assignable license to display, distribute, store, broadcast,
            transmit, reproduce, modify, prepare derivative works, or use and
            reuse, all or any part of your User Content. Please be aware that we
            are not required to host, display, migrate, or distribute any of
            your User Content and we may refuse to accept or transmit any User
            Content. You agree that you are solely responsible for any User
            Content submitted and you release us from any liability associated
            with any User Content submitted. You understand that we cannot
            guarantee the absolute safety and security of any such User Content.
            Any User Content found to be in violation of this Agreement or that
            we determine to be harmful to the Site may be modified, edited, or
            removed at our discretion. POB does not endorse and may not verify,
            monitor, or restrict any of its users or any User Content submitted.
            You agree that any User Content or any other information may be
            inaccurate, unsubstantiated or possibly even incorrect. Limitation
            of Liability; Representations and Warranties USE OF THIS SITE
            INCLUDING ANY POB CONTENT, IS AT YOUR EXCLUSIVE RISK, AND THE RISK
            OF INJURY FROM THE FOREGOING RESTS EXCLUSIVELY WITH YOU. THE SITE
            INCLUDING ANY POB CONTENT ARE PROVIDED "AS IS", “AS AVAILBLE’, “WITH
            ALL FAULTS” AND WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
            IMPLIED, INCLUDING, BUT NOT LIMITED TO ANY WARRANTIES OF
            MERCHANTABILITY, NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR
            PURPOSE.  Specifically, POB does not make any warranty as to the
            reliability, accuracy, timeliness, usefulness, adequacy or
            suitability of any POB Content. POB DOES NOT WARRANT THAT THE SITE
            AND ANY POB CONTENT WILL BE: (1) UNINTERRUPTED OR ERROR FREE; (2)
            FREE FROM DEFECTS OR ERRORS; OR (3) FREE FROM VIRUSES OR OTHER
            HARMFUL COMPONENTS. To the extent permitted by applicable law, we
            (including OUR officers, directors, agents, AFFILIATES and
            employees) are not liable, and you agree not to hold us responsible,
            for any damages or losses (including, but not limited to, loss of
            money, goodwill or reputation, or other intangible losses or any
            special, DIRECT, indirect, or consequential damages) resulting
            directly or indirectly from your use of the Site, WHETHER BASED ON
            WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL
            THEORY, AND WHETHER OR NOT POB HAS BEEN ADVISED OF THE POSSIBILITY
            OF SUCH DAMAGES. Some jurisdictions do not allow the disclaimer of
            warranties or exclusion of damages, so such disclaimers and
            exclusions may not apply to you. In the event that your jurisdiction
            does not allow us to exclude all liability, you agree that our total
            liablity to you will not exceed $100 USD. This limitation of
            liability does not apply to new jersey users, our liability to new
            jersey users is the minimum amount required under new jersey state
            law. Specifically, in those jurisdictions not allowed, we do not
            disclaim liability for: (a) death or personal injury caused by POB’s
            negligence or that of any of its officers, employees or agents; (b)
            fraudulent misrepresentation; or (c) any liability which it is not
            lawful to exclude either now or in the future. Release IF YOU ARE A
            RESIDENT OF A JURISDICTION THAT REQUIRES A SPECIFIC STATEMENT
            REGARDING RELEASE THEN THE FOLLOWING APPLIES. FOR EXAMPLE,
            CALIFORNIA RESIDENTS MUST, AS A CONDITION OF THIS AGREEMENT, WAIVE
            THE APPLICABILITY OF CALIFORNIA CIVIL CODE SECTION 1542, WHICH
            STATES, “A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE
            CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT
            THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST
            HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR." YOU
            HEREBY WAIVE THIS SECTION OF THE CALIFORNIA CIVIL CODE. YOU HEREBY
            WAIVE ANY SIMILAR PROVISION IN LAW, REGULATION, OR CODE THAT HAS THE
            SAME INTENT OR EFFECT AS THE AFOREMENTIONED RELEASE. YOU RELEASE US
            FROM ANY LIABILITY RELATING TO OUR SITE OR POB CONTENT, AND YOU
            RELEASE US, OUR DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AND
            AGENTS FROM ANY CLAIMS AND DAMAGES, KNOWN AND UNKNOWN, ARISING OUT
            OF OR IN ANY WAY CONNECTED WITH ANY CLAIM YOU HAVE AGAINST US. THIS
            RELEASE DOES NOT APPLY TO NEW JERSEY USERS. Indemnity You agree to
            defend, indemnify and hold harmless POB, its officers, directors,
            employees, affiliates, and agents, from and against any and all
            claims, damages, obligations, losses, liabilities, costs or debt,
            and expenses (including but not limited to attorney's fees) arising
            from: your use of any POB Content; your violation of any term of
            this Agreement; and your use of the POB Site. This defense and
            indemnification obligation will survive this Agreement. You also
            agree that you have a duty to defend us against such claims and we
            may require you to pay for an attorney(s) of our choice in such
            cases. You agree that this indemnity extends to requiring you to pay
            for our reasonable attorneys’ fees, court costs, and disbursements.
            In the event of a claim such as one described in this paragraph, we
            may elect to settle with the party/parties making the claim and you
            shall be liable for the damages as though we had proceeded with a
            trial. Taxes You agree that you are solely responsible for
            determining what, if any, taxes apply to your NFT transactions on
            our Site. We are not responsible for determining the taxes that may
            apply to your NFT transactions. Copyrights We take copyright
            infringement very seriously, if you live within the US or own any
            copyrighted material within the US and believe that your copyright
            has been infringed, please send us a message which contains: Your
            name. The name of the party whose copyright has been infringed, if
            different from your name. The name and description of the work that
            is being infringed. The location on our website of the infringing
            copy. A statement that you have a good faith belief that use of the
            copyrighted work described above is not authorized by the copyright
            owner (or by a third party who is legally entitled to do so on
            behalf of the copyright owner) and is not otherwise permitted by
            law. A statement that you swear, under penalty of perjury, that the
            information contained in this notification is accurate and that you
            are the copyright owner or have an exclusive right in law to bring
            infringement proceedings with respect to its use. You must sign this
            notification and send it to our Copyright Agent: Copyright Agent of
            POB, david@pob.studio. Choice of Law This Agreement shall be
            governed by the laws in force in the State of Illinois. The offer
            and acceptance of this contract is deemed to have occurred in the
            State of Illinois. Forum By using this Site, you agree that: (1) any
            claim, dispute, or controversy you may have against us, POB or the
            Site arising out of, relating to, or connected in any way with this
            Agreement or any products purchased shall be resolved exclusively by
            final and binding arbitration administered by the American
            Arbitration Association (“AAA”) and conducted before a single
            arbitrator pursuant to the applicable Consumer Rules and Procedures
            established by AAA (“Rules and Procedures”); (2) the claim or
            dispute must be brought within one (1) year of the first date of the
            event giving rise to such action (does not apply to New Jersey
            users) and the arbitration shall be held in Chicago, Illinois or at
            such other location as may be mutually agreed upon by you and POB;
            (3) the arbitrator shall apply Illinois law consistent with the
            Federal Arbitration Act and applicable statutes of limitations, and
            shall honor claims of privilege recognized at law; (4) there shall
            be no authority for any claims to be arbitrated on a class or
            representative basis; arbitration can decide only your and/or POB ’s
            individual claims; and the arbitrator may not consolidate or join
            the claims of other persons or parties who may be similarly situated
            (this does not apply to New Jersey users); (5) both parties will
            bear their own costs of representation and filing for the dispute;
            (6) where possible and allowed for under the AAA Rules and
            Procedures both parties shall be entitled to appear electronically
            or telephonically for all proceedings; and (7) with the exception of
            subpart (4) above, if any part of this arbitration provision is
            deemed to be invalid, unenforceable or illegal, or otherwise
            conflicts with the Rules and Procedures established by AAA, then the
            balance of this arbitration provision shall remain in effect and
            shall be construed in accordance with its terms as if the invalid,
            unenforceable, illegal or conflicting provision were not contained
            herein. If, however, subpart (4) is found to be invalid,
            unenforceable or illegal, then the entirety of this Arbitration
            Provision shall be null and void, and neither you nor POB shall be
            entitled to arbitrate their dispute. For more information on AAA and
            its Rules and Procedures, users may visit the AAA website at
            http://www.adr.org. In the event that any portion of this
            arbitration provision is found to be unenforceable or void, both
            parties agree to settle any disputes arising out of this Agreement
            in a court of competent jurisdiction located in Cook County,
            Illinois. Class Action Waiver You and POB agree that any proceedings
            to resolve or litigate any dispute whether through a court of law or
            arbitration shall be solely conducted on an individual basis. You
            agree that you will not seek to have any dispute heard as a class
            action, representative action, collective action, or private
            attorney general action. Severability In the event that a provision
            of this Agreement is found to be unlawful, conflicting with another
            provision of the Agreement, or otherwise unenforceable, the
            Agreement will remain in force as though it had been entered into
            without that unenforceable provision being included in it. If two or
            more provisions of this Agreement or any other agreement you may
            have with POB are deemed to conflict with each other’s operation,
            you agree that POB shall have the sole right to elect which
            provision remains in force. Non-Waiver We reserve all rights
            permitted to us under this Agreement as well as under the provisions
            of any Applicable Law. Our non-enforcement of any particular
            provision or provisions of this Agreement or any Applicable Law
            should not be construed as our waiver of the right to enforce that
            same provision under the same or different circumstances at any time
            in the future. Survival All provisions of this Agreement which by
            their nature should survive termination shall survive termination,
            including, without limitation, ownership provisions, warranty
            disclaimers, indemnity, and limitations of liability. You agree that
            we are not required to provide you with access to our Site and may
            terminate our Site or your access to the Site at any time and for
            any reason. Age All users who access the Site must be 18 years of
            age or older. Assignment You may not assign your rights and/or
            obligations under this Agreement to any other party without our
            prior written consent. We may assign our rights and/or obligations
            under this Agreement to any other party at our discretion.
            Amendments We may amend this Agreement from time to time. When we
            amend this Agreement, we will update this page and indicate the date
            that it was last modified or we may email you. You may refuse to
            agree to the amendments, but if you do, you must immediately cease
            using our Site. Electronic Communications The communications between
            you and POB use electronic means, whether you visit the Site or send
            POB e-mails, or whether POB posts notices on the Site or
            communicates with you via e-mail. For contractual purposes, you (1)
            consent to receive communications from POB in an electronic form;
            and (2) agree that all terms, conditions, agreements, notices,
            disclosures, and other communications that POB provides to you
            electronically satisfy any legal requirement that such
            communications would satisfy if it were to be in writing. The
            foregoing does not affect your statutory rights. California Users
            Pursuant to California Civil Code Section 1789.3, any questions
            about pricing, complaints, or inquiries about POB must be sent to
            our agent for notice to: david@pob.studio. Lastly, California users
            are also entitled to the following specific consumer rights notice:
            The Complaint Assistance Unit of the Division of Consumer Services
            of the California Department of Consumer Affairs may be contacted in
            writing at 1625 North Market Blvd., Sacramento, CA 95834, or by
            telephone at (916) 445-1254 or (800) 952-5210.
          </p>
        </ContentRowV2>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(TosPage);
