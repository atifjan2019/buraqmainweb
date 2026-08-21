import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { company, contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.legalName}, trading as ${company.tradingAs}, collects, uses and protects your personal data.`,
};

const UPDATED = "21 August 2026";

/**
 * The dealership supplied the wording for this notice and asked for it to be
 * used as written, with the business details changed to theirs. Company name,
 * registered address, contact email and site URL are therefore rendered from
 * `lib/site.ts` rather than typed in, so they cannot drift from the details
 * shown everywhere else on the site.
 */
export default function PrivacyPage() {
  const address = contact.addressLines.join(", ");

  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      updated={UPDATED}
      intro={`${company.tradingAs} are committed to protecting and respecting your privacy.`}
    >
      <p>
        This policy (together with our Terms of Use and any other documents
        referred to on it) sets out the basis on which any personal data we
        collect from you, or that you provide to us, will be processed by us.
        Please read the following carefully to understand our views and
        practices regarding your personal data and how we will treat it.
      </p>
      <p>
        For the purpose of the Data Protection Act 2018 (the Act), the data
        controller is {company.legalName}, trading as {company.tradingAs}, of{" "}
        {address}.
      </p>

      <h2>Information we collect from you</h2>
      <p>We will collect and process the following data about you:</p>
      <p>
        <strong>Information you give us.</strong> This is information about you
        that you give us by filling in forms on {site.url} (our site) or by
        corresponding with us by phone, e-mail or otherwise. It includes
        information you provide when you register to use our site, subscribe to
        our service, search for a product, place an order on our site,
        participate in discussion boards or other social media functions on our
        site, enter a competition, promotion or survey, and when you report a
        problem with our site. The information you give us may include your
        name, address, e-mail address and phone number, financial and credit
        card information, personal description and photograph, date of birth,
        employment details, and address history.
      </p>
      <p>
        <strong>Information we collect about you.</strong> With regard to each
        of your visits to our site we will automatically collect the following
        information:
      </p>
      <ul>
        <li>
          technical information, including the Internet protocol (IP) address
          used to connect your computer to the Internet, your login information,
          browser type and version, time zone setting, browser plug-in types and
          versions, operating system and platform;
        </li>
        <li>
          information about your visit, including the full Uniform Resource
          Locators (URL), clickstream to, through and from our site (including
          date and time), products you viewed or searched for, page response
          times, download errors, length of visits to certain pages, page
          interaction information (such as scrolling, clicks, and mouse-overs),
          methods used to browse away from the page, and any phone number used
          to call our customer service number.
        </li>
      </ul>
      <p>
        <strong>Information we receive from other sources.</strong> This is
        information we receive about you if you use any of the other websites we
        operate or the other services we provide. In this case we will have
        informed you when we collected that data if we intend to share those
        data internally and combine it with data collected on this site. We will
        also have told you for what purpose we will share and combine your data.
        We are working closely with third parties (including, for example,
        business partners, sub-contractors in technical, payment and delivery
        services, advertising networks, analytics providers, search information
        providers, credit reference agencies). We will notify you when we
        receive information about you from them and the purposes for which we
        intend to use that information.
      </p>

      <h2>Cookies</h2>
      <p>
        Our website uses cookies to distinguish you from other users of our
        website. This helps us to provide you with a good experience when you
        browse our website and also allows us to improve our site. For detailed
        information on the cookies we use and the purposes for which we use them
        see our <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>Uses made of the information</h2>
      <p>We use information held about you in the following ways:</p>
      <p>
        <strong>Information you give to us.</strong> We will use this
        information:
      </p>
      <ul>
        <li>
          to carry out our obligations arising from any contracts entered into
          between you and us and to provide you with the information, products
          and services that you request from us;
        </li>
        <li>
          to provide you with information about other goods and services we
          offer that are similar to those that you have already purchased or
          enquired about;
        </li>
        <li>
          to provide you with information about goods or services we feel may
          interest you. We will only contact you by electronic means (email or
          SMS) if you have consented to this. You may withdraw your consent at
          any time by contacting us directly at {address} or {contact.email}.
        </li>
        <li>to notify you about changes to our service;</li>
        <li>
          to ensure that content from our site is presented in the most
          effective manner for you and for your device.
        </li>
      </ul>
      <p>
        <strong>Information we collect about you.</strong> We will use this
        information:
      </p>
      <ul>
        <li>
          to administer our site and for internal operations, including
          troubleshooting, data analysis, testing, research, statistical and
          survey purposes;
        </li>
        <li>
          to improve our site to ensure that content is presented in the most
          effective manner for you and for your device;
        </li>
        <li>
          to allow you to participate in interactive features of our service,
          when you choose to do so;
        </li>
        <li>as part of our efforts to keep our site safe and secure;</li>
        <li>
          to measure or understand the effectiveness of advertising we serve to
          you and others, and to deliver relevant advertising to you;
        </li>
        <li>
          to make suggestions and recommendations to you and other users of our
          site about goods or services that may interest you or them.
        </li>
      </ul>
      <p>
        <strong>Information we receive from other sources.</strong> We will
        combine this information with information you give to us and information
        we collect about you. We will use this information and the combined
        information for the purposes set out above (depending on the types of
        information we receive).
      </p>

      <h2>Disclosure of your information</h2>
      <p>We may share your personal information with:</p>
      <ul>
        <li>
          Any member of our group, which means our subsidiaries, our ultimate
          holding company and its subsidiaries, as defined in section 1159 of
          the UK Companies Act 2006.
        </li>
        <li>
          Selected third parties including any of our business partners,
          suppliers and sub-contractors where this is necessary for the
          performance of any contract we enter into with you; analytics and
          search engine providers that assist us in the improvement and
          optimisation of our site; credit reference agencies for the purpose of
          assessing your credit score where this is a condition of us or any of
          our business partners, suppliers and sub-contractors entering into a
          contract with you; and finance brokers and lenders for the purpose of
          providing requested finance.
        </li>
      </ul>
      <p>We will disclose your personal information to third parties:</p>
      <ul>
        <li>
          In the event that we sell or buy any business or assets, in which case
          we will disclose your personal data to the prospective seller or buyer
          of such business or assets.
        </li>
        <li>
          If {company.legalName} or substantially all of its assets are acquired
          by a third party, in which case personal data held by it about its
          customers will be one of the transferred assets.
        </li>
        <li>
          If we are under a duty to disclose or share your personal data in
          order to comply with any legal obligation, or in order to enforce or
          apply our Terms of Use or terms and conditions of supply and other
          agreements; or to protect the rights, property, or safety of{" "}
          {company.legalName}, our customers, or others. This includes
          exchanging information with other companies and organisations for the
          purposes of fraud protection and credit risk reduction.
        </li>
      </ul>
      <p>
        We will not disclose your personal information to third parties to
        enable them to contact you for marketing purposes unless we have your
        consent to do so.
      </p>

      <h2>Where we store your personal data</h2>
      <p>
        All information you provide to us is stored on our secure servers. Any
        payment transactions will be encrypted using SSL technology. Where we
        have given you (or where you have chosen) a password which enables you
        to access certain parts of our site, you are responsible for keeping
        this password confidential. We ask you not to share a password with
        anyone.
      </p>
      <p>
        The data that we collect from you may be transferred to, and stored at,
        a destination outside the European Economic Area (&ldquo;EEA&rdquo;) by
        one of our suppliers. It may also be processed by staff operating
        outside the EEA who work for one of our suppliers. This includes staff
        engaged in, among other things, the fulfilment of your order, the
        processing of your payment details and the provision of support
        services. By submitting your personal data, you agree to this transfer,
        storing or processing. {company.tradingAs} will take all steps
        reasonably necessary to ensure that your data is treated securely and in
        accordance with this privacy policy.
      </p>
      <p>
        Unfortunately, the transmission of information via the internet is not
        completely secure. Although we will do our best to protect your personal
        data, we cannot guarantee the security of your data transmitted to our
        site; any transmission is at your own risk. Once we have received your
        information, we will use strict procedures and security features to try
        to prevent unauthorised access.
      </p>

      <h2>For how long do we retain your personal data?</h2>
      <p>
        Unless required to do so by law (eg for the purposes of preventing fraud
        or tax evasion), we do not retain personal data no longer than is
        necessary for the purposes for which we originally collected it.
        Ordinarily, this will be for a period of 7 years if you have purchased a
        vehicle or services or obtained finance through us, or 6 months if you
        have not. If you have not objected to our providing you with information
        about other goods and services we offer that are similar to those that
        you have already purchased or enquired about, or if you have given and
        not withdrawn your consent for us to use your personal data for other
        marketing purposes, we will retain the data for as long as we need it
        for those purposes.
      </p>
      <p>
        We regularly review the personal data we hold, and delete anything we no
        longer need. Information that does not need to be accessed regularly,
        but which still needs to be retained, is safely archived or put offline.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to ask us not to process your personal data for
        marketing purposes. We will ask your consent (before collecting your
        data) if we intend to use your data for such purposes or if we intend to
        disclose your information to any third party for such purposes.
      </p>
      <p>
        You can exercise your right to prevent such processing by not checking
        certain boxes on the forms we use to collect your data. You also have
        the right to have inaccurate or incomplete data corrected and, in some
        cases (such as where it is no longer necessary for us to retain the data
        for the purposes for which it was originally collected/processed, where
        we need your consent and you have withdrawn such consent, or where you
        object to the processing and there is no overriding legitimate interest
        for us to continue with it) to have your personal data removed from our
        systems.
      </p>
      <p>
        Where you have provided your personal data to us and our processing is
        carried out by automated means based on your consent or for the
        performance of a contract, you may ask us to provide you with the data
        in a structured, commonly used and machine readable form or, if this is
        technically feasible with our systems, to transmit the data directly to
        another organisation. Machine readable means that the information is
        structured so that software can extract specific elements of the data.
      </p>
      <p>
        Unless the decision is necessary for entering into or for the
        performance of a contract between us, is authorised by law (eg for the
        purposes of preventing fraud or tax evasion) or you have given your
        explicit consent for us to do so, you have the right to ask us not to
        subject you to any decision which produces a legal effect or a similarly
        significant effect on you on the basis of automated processing.
      </p>
      <p>
        You can exercise any of the above rights at any time by contacting us at{" "}
        {address} or {contact.email}.
      </p>
      <p>
        Our site may, from time to time, contain links to and from the websites
        of our partner networks, advertisers and affiliates. If you follow a
        link to any of these websites, please note that these websites have
        their own privacy policies and that we do not accept any responsibility
        or liability for these policies. Please check these policies before you
        submit any personal data to these websites.
      </p>

      <h2>Access to information</h2>
      <p>
        The Act gives you the right to access information held about you. Your
        right of access can be exercised in accordance with the Act. We will not
        charge you for providing you with details of the information we hold
        about you unless your request is manifestly unfounded or excessive,
        particularly if it is repetitive, when we will charge you a reasonable
        fee, based on the administrative cost of providing the information. We
        may also charge a reasonable fee to comply with multiple requests for
        further copies of the same information.
      </p>

      <h2>Changes to our privacy policy</h2>
      <p>
        Any changes we make to our privacy policy in the future will be posted
        on this page and, where appropriate, notified to you by e-mail. Please
        check back frequently to see any updates or change to our privacy
        policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, comments and requests regarding this privacy policy are
        welcomed and should be addressed to {address} or {contact.email}.
      </p>

      <h2>Complaints</h2>
      <p>
        If you have any complaints about how we process your personal data,
        please contact us at {address} or {contact.email}, and we will do our
        best to resolve them.
      </p>
      <p>
        If you remain dissatisfied, you may contact the Information
        Commissioner&rsquo;s Office by writing to it at Wycliffe House, Water
        Lane, Wilmslow, Cheshire, SK9 5AF, telephoning 0303 123 1113 or 01625
        545745, or by completing the online email message form at{" "}
        <a href="https://ico.org.uk/global/contact-us/">
          ico.org.uk/global/contact-us
        </a>{" "}
        or the online complaints form at{" "}
        <a href="https://ico.org.uk/make-a-complaint/">
          ico.org.uk/make-a-complaint
        </a>
        .
      </p>
    </LegalPage>
  );
}
