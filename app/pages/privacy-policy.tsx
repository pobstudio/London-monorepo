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

const PrivacyPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title={'$HASH by POB - Privacy Policy'}
        description={`$HASH by POB - Privacy Policy`}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.TOU}`,
          title: '$HASH by POB - Privacy Policy',
          description: '$HASH by POB - Privacy Policy',
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
          <H3>Privacy Policy</H3>
          <h4>Proof of Beauty, LLC Privacy Policy</h4>
          <h5>Last Updated: April 20, 2021</h5>
          <p>
            Introduction Proof of Beauty, LLC (“POB”) is dedicated to protecting
            your personal information and informing you about how we use your
            information. This privacy policy applies to your use of the
            hash.pob.studio website and all other related services (collectively
            “Site”). This Privacy Policy should be read in conjunction with the
            Terms of Use and is integrated into the Terms of Use. All
            capitalized proper nouns not defined in this Agreement will have the
            same definitions and meanings as defined by the Terms of Use. Please
            review this Privacy Policy periodically as we may revise it from
            time to time. If you do not agree with or accept our Privacy Policy
            in it’s entirety, you must not access or use the Site. If you use
            the Site following a change to the terms of this Privacy Policy you
            agree to accept the revised policies. Information Collected At POB,
            we collect personally identifiable information (“PII”) and
            non-personally identifiable information (“Non-PII”) from you.
            Personally identifiable information is information that can be used
            to identify you personally. Non-personally identifiable information
            is information that must be combined with other information to
            identify you personally. Personally Identifiable Information
            Collected You will not be required to provide us any information
            when you visit our Site. However, if you wish to contact us or if
            you wish to submit any User Content you may be required to submit
            your name, email or additional contact information. Non-Identifying
            Information Whenever you use our website, we may collect Non-PII
            from you, such as your IP address, zip code, gender, browsing
            history, search history, and registration history, interactions with
            the Site, usage information, location, referring URL, browser,
            operating system, data usage, data transferred, and Internet service
            provider. We may also collect information including but not limited
            to postings you make on the public areas of our website, messages
            you send to us, and correspondence we receive from other members or
            third parties about your activities or postings. Use of Your
            Information Some of your information will be visible to us or other
            users of the Site to facilitate communication. We will never sell
            your information without your permission; however you agree that we
            may use your information in the following ways: To provide any
            services offered and to operate the POB Site. To enhance or improve
            our users’ experiences. To to contact you via email or other
            electronic communications where you have an inquiry. To notify you
            of additional POB updates. To share your information with third
            party partners or third parties hired by us to perform functions and
            provide services to us subject to the obligations consistent with
            this Privacy Policy and on the condition that the third parties use
            your information only on our behalf and pursuant to our
            instructions. Accessing, Editing, and Removing Your Information If
            you have any questions or wish to review, change, or access any of
            your information collected by us, please contact us at
            david@pob.studio. Additionally, if you wish to opt out of our data
            collection practices or would like us to remove any of your
            information from our databases, please contact us. After you have
            cancelled your account please be aware that we may keep inaccessible
            copies of your PII and non-PII subject to our data retention
            policies. Cookies and Tracking We do not currently use cookies on
            our Site, in the event that we decidee to employ cookies or other
            website tracking this section of the Privacy Policy shall be
            updated. Third Party Access to Your Information Although you are
            entering into an Agreement with POB to disclose your information to
            us, we do use third party individuals and organizations to assist
            us, including contractors, web hosts, and others to allow you to
            access the Site. Throughout the course of our provision of our
            services to you, we may delegate our authority to collect, access,
            use, and disseminate your information. It is therefore necessary
            that you grant the third parties we may use in the course of our
            business the same rights that you afford us under this Privacy
            Policy. For this reason, you hereby agree that for every
            authorization which you grant to us in this Privacy Policy, you also
            grant to any third party that we may hire, contract, or otherwise
            retain the services of for the purpose of operating, maintaining,
            repairing, or otherwise improving or preserving our website or its
            underlying files or systems. You agree not to hold us liable for the
            actions of any of these third parties, even if we would normally be
            held vicariously liable for their actions, and that you must take
            legal action against them directly should they commit any tort or
            other actionable wrong against you. Law Enforcement You agree that
            we may disclose your information to authorities if compelled to by a
            court order. Additionally, you agree that we may disclose your
            information if we reasonably believe that you have violated US laws,
            the terms of our Terms of Use or our Privacy Policy, or if we
            believe that a third party is at risk of bodily or economic harm. In
            the event that we receive a subpoena affecting your privacy, we may
            elect to notify you to give you an opportunity to file a motion to
            quash the subpoena, or we may attempt to quash it ourselves, but we
            are not obligated to do either. We may also proactively report you
            and release your information without receiving any request to third
            parties where we believe that it is proper to do so for legal
            reasons, where your actions violate any US laws or any other country
            having jurisdiction over us, our Site, or our Terms of Use. You
            release us from any damages that may arise from or relate to the
            release of your information to a request from law enforcement
            agencies or private litigants. We may release your information under
            the conditions listed in this paragraph whether it is to individuals
            or entities and to any state or federal authorities, as required.
            Opt Out of Commercial, Non-Commercial Communications and Do Not
            Track If you decide to provide us with your contact information, you
            agree that we may send you communications via text and emails.
            However, you may unsubscribe from certain communications by
            notifying POB that you no longer wish to receive these
            communications and we will endeavour to promptly remove you from our
            mailing list or communications once we have received that request.
            We currently do not offer functionality for you to opt out through
            “do not track” listings. If you wish to opt out of certain
            communications or information collection, please contact us at
            david@pob.studio. Third Parties POB or other users may post links to
            third party websites on Site, which may include information that we
            have no control over. When accessing a third party site through our
            Site, you acknowledge that you are aware that these third party
            websites are not screened for privacy or security issues by us.
            Please be aware that this Privacy Policy, and any other policies in
            place, in addition to any amendments, does not create rights
            enforceable by third parties. POB bears no responsibility for the
            information collected or used by any advertiser or third party
            website. You must review their electronic agreements and privacy
            policies to understand how their information collection practices
            work. Security Measures We make reasonable attempts to protect your
            information by using physical and electronic safeguards. However, as
            this is the Internet, we can make no guarantees as to the security
            or privacy of your information. For this reason, we recommend that
            you use anti-virus software, routine credit checks, firewalls, and
            other precautions to protect yourself from security and privacy
            threats. Your California Privacy Rights POB permits residents of the
            State of California to use its Site, and complies with the
            California Business and Professions Code §§ 22575-22579. If you are
            a California resident you may request certain information regarding
            our disclosure of personal information to any third parties for
            their direct marketing purposes. Various provisions throughout this
            Privacy Policy address requirements of the Californian privacy
            statutes. Although we do not disseminate your information to third
            parties without permission, you must presume that we collect
            electronic information from all visitors. You may contact us at
            david@pob.studio with any questions. Age Compliance We intend to
            fully comply with American and international laws respecting
            children’s privacy including COPPA. Therefore, we do not collect or
            process any information for any persons under the age of 18. If you
            are under 18 and using our Site, please stop immediately and do not
            submit any information to us. In the event that you become aware
            that we have inadvertently collected any information from users
            under the age of 18, please contact us immediately. International
            Transfer Your information may be transferred to - and maintained on
            - computers located outside of your state, province, country, or
            other governmental jurisdiction where the privacy laws may not be as
            protective as those in your jurisdiction. Your consent to this
            Privacy Policy followed by your submission of such information
            represents your agreement to that transfer. PII and Non-PII that is
            submitted to POB will be collected, processed, stored, disclosed and
            disposed of in accordance with applicable U.S. law and this policy.
            If you are a non-U.S. user, you acknowledge and agree that POB may
            collect and use your Information and disclose it to other entities
            outside your resident jurisdiction. In addition, such information
            may be stored on servers located outside your resident jurisdiction.
            U.S. law may not provide the degree of protection for information
            that is available in other countries. Merger and Acquisition In the
            event that POB is involved in a bankruptcy, merger, acquisition,
            reorganization or sale of assets, your information may be sold or
            transferred as part of that transaction. Please be aware that once
            the information is transferred your privacy rights may change.
            Amendments Like our Terms of Use, we may amend this Privacy Policy
            from time to time. When we amend this Privacy Policy, we will modify
            the date listed on this Agreement or we may contact you. You must
            agree to the amendments as a condition of your continued use of our
            Site. If you do not agree, you must immediately cease using our Site
            and notify us of your refusal to agree by e-mailing us at
            david@pob.studio. Information If you have any questions or require
            additional information related to our information collection
            practices, please contact us at david@pob.studio.
          </p>
        </ContentRowV2>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(PrivacyPage);
