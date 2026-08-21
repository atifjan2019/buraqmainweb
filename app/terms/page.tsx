import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { company, contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using the ${company.tradingAs} website, including reserving a vehicle and booking a test drive.`,
};

const UPDATED = "21 August 2026";

/**
 * The dealership supplied this wording and asked for it to be used as written,
 * with the business details changed to theirs. Name, address, phone and email
 * render from `lib/site.ts` so they cannot drift from the rest of the site.
 *
 * The company and VAT numbers are the one thing NOT carried over from the
 * source text: those identify a different registered company, and printing
 * someone else's registration on this site would be a false statement about
 * who the visitor is contracting with. They render only once `company`
 * carries real values — see the note beside the registration paragraph.
 */
export default function TermsPage() {
  const address = contact.addressLines.join(", ");

  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Terms of Use"
      updated={UPDATED}
      intro="Please read these terms of use carefully before using this site."
    >
      <h2>What&rsquo;s in these terms?</h2>
      <p>
        These terms tell you the rules for using our website {site.url} (our
        site), including to reserve a vehicle and/or book a test drive. You are
        responsible for ensuring that all persons who access our site through
        your internet connection are aware of, and comply with these terms of
        use and other applicable terms and conditions.
      </p>
      <p>
        We amend these terms from time to time. Every time you wish to use our
        site, please check these terms to ensure you understand the terms that
        apply at that time. These terms were most recently updated on {UPDATED}.
      </p>
      <p>
        Our site is made available free of charge. We do not guarantee that it,
        or any content on it, will always be available or be uninterrupted. We
        may update and change our site from time to time to reflect changes to
        our products, our users&rsquo; needs and our business priorities, and we
        may suspend or withdraw or restrict the availability of all or any part
        of it at any time for business or operational reasons.
      </p>
      <p>
        Please note that these terms do not apply to any contract for the
        purchase of the vehicle itself, nor to any contract for the provision of
        financial credit.
      </p>

      <h2>Who we are and how to contact us</h2>
      <p>
        {site.url} is a site operated by {company.legalName}, trading as{" "}
        {company.tradingAs}. We are a limited company registered in England and
        Wales
        {company.companyNumber ? ` under company number ${company.companyNumber}` : ""}
        {company.companyNumber ? "" : ""} and have our registered office at{" "}
        {address}. Our main trading address is {address}.
        {company.vatNumber
          ? ` We are registered for VAT and our VAT number is ${company.vatNumber}.`
          : ""}
      </p>
      <p>
        To contact us, please email {contact.email}, telephone our customer
        service line on {contact.phone}, or write to us at {address}.
      </p>

      <h2>By using our site you accept these terms</h2>
      <p>
        By using our site to locate or reserve a vehicle or obtain finance
        quotes, you confirm that you accept these terms of use and that you
        agree to comply with them. They apply to the exclusion of any other
        terms that you seek to impose or incorporate, or which are implied by
        trade, custom, practice or course of dealing.
      </p>
      <p>If you do not agree to these terms, you must not use our site.</p>
      <p>
        These terms apply to any contract which may be concluded between us for
        the reservation and/or test drive of a vehicle you have found on this
        site. They are intended to represent the entire agreement between you
        and us in relation to its subject matter. If you are a business customer
        these terms constitute the entire agreement between us in relation to
        your purchase, and you acknowledge that you have not relied on any
        statement, promise, representation, assurance or warranty made or given
        by or on behalf of us which is not set out in these terms. If you are a
        consumer and believe you have relied on any statement, promise or
        representation or assurance or warranty that is not set out in these
        terms, please contact us to clarify the position.
      </p>
      <p>
        We recommend that you print a copy of these terms for future reference.
      </p>

      <h2>There are other terms that may apply to you</h2>
      <p>
        These terms of use refer to the following additional terms, which also
        apply to your use of our site:
      </p>
      <ul>
        <li>
          Our terms and conditions of sale (available from {company.tradingAs}),
          which set out the terms of any contract for the purchase of a vehicle.
        </li>
        <li>
          Our <a href="/privacy">Privacy Policy</a>, which sets out the terms on
          which we process any personal data we collect from you, or that you
          provide to us. By using our site, you consent to such processing and
          you warrant that all data provided by you is accurate.
        </li>
        <li>
          Our <a href="/cookies">Cookie Policy</a>, which gives you
          information about the cookies on our site.
        </li>
      </ul>

      <h2>Information on this site</h2>
      <ul>
        <li>
          The content on our site is provided for general information only. It
          is not intended to amount to advice on which you should rely. You must
          obtain professional or specialist advice before taking, or refraining
          from, any action on the basis of the content on our site.
        </li>
        <li>
          Although we make reasonable efforts to update the information on our
          site, we make no representations, warranties or guarantees, whether
          express or implied, that the content on our site is accurate, complete
          or up to date.
        </li>
        <li>
          Any descriptions or illustrations on our site are for illustrative
          purposes only, and are published for the sole purpose of giving an
          approximate idea of the vehicles described in them. They will not form
          part of any contract or have any contractual force. We have made every
          effort to display the colours accurately, but we cannot guarantee that
          a device&rsquo;s display of the colours accurately reflects the colour
          of the vehicles.
        </li>
        <li>
          Any part exchange valuations obtained on this site are only estimates,
          based on the information you have submitted. The actual valuation will
          be agreed after we have appraised the part exchange vehicle.
        </li>
        <li>
          Any finance quotes obtained on this site are illustrative examples,
          based on the vehicle and the numbers you have submitted. Your
          application for finance will be processed by the finance company, not
          by us, and will take into account your personal credit rating so the
          actual finance quote may be different.
        </li>
        <li>
          We reserve the right to amend the specification of any vehicle
          described on this site if required to do so by any applicable
          statutory or regulatory requirement, to implement minor technical
          adjustments and improvements, or if the amendment will not materially
          affect its nature or quality.
        </li>
      </ul>

      <h2>Our site is only for users in the UK</h2>
      <p>
        Our site is directed to people residing in the United Kingdom. We do not
        represent that content available on or through our site is appropriate
        for use or available in other locations. You may use this site to
        reserve a vehicle or test drive from an address outside the United
        Kingdom, but we do not deliver vehicles outside the United Kingdom, and
        any test drives must take place at the address in the United Kingdom
        which we specify. Finance quotes are not applicable to persons residing
        outside the United Kingdom.
      </p>

      <h2>Reserving a vehicle or booking a test drive</h2>
      <p>
        Please follow the onscreen prompts to reserve your vehicle or book a
        test drive.
      </p>
      <p>
        You must co-operate with us in all matters relating to the booking, and
        provide us with such information as we may reasonably require in order
        to fulfil the booking, and ensure that such information is complete and
        accurate in all material respects, and you hold a full UK driving
        licence on the date booked for the test drive.
      </p>
      <p>
        After you submit the booking, you will receive an email from us
        acknowledging that we have received it, but please note that this does
        not mean that it has been accepted. Our acceptance will take place when
        we send an email to you.
      </p>
      <p>
        If we are unable to reserve the vehicle or offer you a test drive on the
        specified date, we will inform you of this by email. This might be
        because the vehicle has already been sold, because of unexpected limits
        on our resources which we could not reasonably plan for, because a
        credit reference we have obtained for you does not meet our minimum
        requirements, because we have identified an error in the price or
        description of the vehicle or because we are unable to meet an agreed
        deadline.
      </p>
      <p>
        We will use all reasonable endeavours to meet any dates specified in the
        Confirmation, but any such dates are not guaranteed and, whilst we will
        use all reasonable endeavours to notify you in advance if we are unable
        to ensure a vehicle is available for a test drive on the specified date
        and to agree a mutually convenient alternative date, you will have no
        rights or remedies against us if we fail to ensure a vehicle is so
        available.
      </p>
      <p>
        If we are not satisfied you hold a full UK driving licence and are
        legally fit to drive the vehicle on the date booked for the test drive,
        we will be entitled to cancel the Order and require you to rearrange an
        alternative date for the test drive.
      </p>
      <p>
        If you wish to make a change to a date you have booked for a test drive,
        please contact us as soon as possible to book an alternative date. We
        may not be able to guarantee that the vehicle will still be available.
      </p>

      <h2>Events outside our control</h2>
      <p>
        We will not be liable or responsible for any failure to perform, or
        delay in performance of, any of our obligations under the Contract that
        is caused by any act or event beyond our reasonable control (Event
        Outside Our Control).
      </p>
      <p>
        If an Event Outside Our Control takes place that affects the performance
        of our obligations under the Contract, we will contact you as soon as
        possible to let you know and we will take steps to minimise the effect
        of the delay. We will arrange a new date for the test drive after the
        Event Outside Our Control is over. Provided we do this we will not be
        liable for delays caused by the event, but if the Event Outside Our
        Control has continued, or seems likely to continue, for more than 30
        days, you may contact us to cancel the Order and receive a refund of any
        reservation or booking fee you have paid.
      </p>

      <h2>How you may use material on our site</h2>
      <p>
        We are the owner or the licensee of all intellectual property rights in
        our site, and in the material published on it. Those works are protected
        by copyright laws and treaties around the world. All such rights are
        reserved.
      </p>
      <p>
        You may print off one copy, and may download extracts, of any page(s)
        from our site for your personal use and you may draw the attention of
        others within your organisation to content posted on our site.
      </p>
      <p>
        You must not modify the paper or digital copies of any materials you
        have printed off or downloaded in any way, and you must not use any
        illustrations, photographs, video or audio sequences or any graphics
        separately from any accompanying text.
      </p>
      <p>
        Our status (and that of any identified contributors) as the authors of
        content on our site must always be acknowledged.
      </p>
      <p>
        You must not use any part of the content on our site for commercial
        purposes without obtaining a licence to do so from us or our licensors.
      </p>
      <p>
        If you print off, copy or download any part of our site in breach of
        these terms of use, your right to use our site will cease immediately
        and you must, at our option, return or destroy any copies of the
        materials you have made.
      </p>

      <h2>We are not responsible for websites we link to</h2>
      <p>
        Where our site contains links to other sites and resources provided by
        third parties, these links are provided for your information only. Such
        links should not be interpreted as approval by us of those linked
        websites or information you may obtain from them.
      </p>
      <p>We have no control over the contents of those sites or resources.</p>

      <h2>Our responsibility for loss or damage suffered by you</h2>
      <p>
        <strong>Whether you are a consumer or a business user:</strong>
      </p>
      <ul>
        <li>
          We do not exclude or limit in any way our liability to you where it
          would be unlawful to do so. This includes liability for death or
          personal injury caused by our negligence or the negligence of our
          employees, agents or subcontractors and for fraud or fraudulent
          misrepresentation.
        </li>
        <li>
          Different limitations and exclusions of liability will apply to
          liability arising as a result of the supply of any products to you,
          which will be set out in our Terms and conditions.
        </li>
        <li>
          Nothing in these terms limits or affects the exclusions and
          limitations set out in our Terms and Conditions of Sale (available
          from {company.tradingAs}).
        </li>
        <li>
          This section will survive the termination of any contract between us.
        </li>
      </ul>
      <p>
        <strong>Only if you are a business user:</strong>
      </p>
      <ul>
        <li>
          We exclude all implied conditions, warranties, representations or
          other terms that may apply to our site or any content on it. Any
          representation, condition or warranty which might be implied or
          incorporated into these terms by statute, including without limitation
          the terms which might be implied in any contract for the sale of a
          vehicle by sections 3 to 5 of the Supply of Goods and Services Act
          1982, by common law or otherwise are, to the fullest extent permitted
          by law, excluded from any contract between us.
        </li>
        <li>
          We will not be liable to you for any loss or damage, whether in
          contract, tort (including negligence), breach of statutory duty, or
          otherwise, even if foreseeable, arising under or in connection with
          use of, or inability to use, our site or use of or reliance on any
          content displayed on our site.
        </li>
        <li>
          In particular, we will not be liable for loss of profits, sales,
          business, or revenue; business interruption; loss of anticipated
          savings; loss of business opportunity, goodwill or reputation; or any
          indirect or consequential loss or damage.
        </li>
        <li>
          Subject to the previous paragraphs of this section, our total
          liability to you arising under or in connection with any contract
          between us, whether in contract, tort (including negligence), breach
          of statutory duty, or otherwise, will be limited to the total amount
          payable by you under the contract.
        </li>
      </ul>

      <h2>We are not responsible for viruses and you must not introduce them</h2>
      <p>
        We do not guarantee that our site will be secure or free from bugs or
        viruses.
      </p>
      <p>
        You are responsible for configuring your information technology,
        computer programmes and platform to access our site. You should use your
        own virus protection software.
      </p>
      <p>
        You must not misuse our site by knowingly introducing viruses, trojans,
        worms, logic bombs or other material that is malicious or
        technologically harmful. You must not attempt to gain unauthorised
        access to our site, the server on which our site is stored or any
        server, computer or database connected to our site. You must not attack
        our site via a denial-of-service attack or a distributed
        denial-of-service attack. By breaching this provision, you would commit
        a criminal offence under the Computer Misuse Act 1990. We will report
        any such breach to the relevant law enforcement authorities and we will
        co-operate with those authorities by disclosing your identity to them.
        In the event of such a breach, your right to use our site will cease
        immediately.
      </p>

      <h2>Rules about linking to our site</h2>
      <p>
        You may link to our home page, provided you do so in a way that is fair
        and legal and does not damage our reputation or take advantage of it.
      </p>
      <p>
        You must not establish a link in such a way as to suggest any form of
        association, approval or endorsement on our part where none exists.
      </p>
      <p>
        You must not establish a link to our site in any website that is not
        owned by you.
      </p>
      <p>
        Our site must not be framed on any other site, nor may you create a link
        to any part of our site other than the home page.
      </p>
      <p>We reserve the right to withdraw linking permission without notice.</p>
      <p>
        If you wish to link to or make any use of content on our site other than
        that set out above, please contact {contact.email}.
      </p>

      <h2>General provisions</h2>
      <p>
        <strong>Assignment and transfer:</strong> We may assign or transfer our
        rights and obligations under the Contract to another entity but will
        always notify you in writing or by posting on this webpage if this
        happens. You may only assign or transfer your rights or your obligations
        under the Contract to another person if we agree in writing.
      </p>
      <p>
        <strong>Waiver:</strong> If we do not insist that you perform any of
        your obligations under the Contract, or if we do not enforce our rights
        against you, or if we delay in doing so, that will not mean that we have
        waived our rights against you or that you do not have to comply with
        those obligations. If we do waive any rights, we will only do so in
        writing, and that will not mean that we will automatically waive any
        right related to any later default by you.
      </p>
      <p>
        <strong>Severance:</strong> Each paragraph of these Terms operates
        separately. If any court or relevant authority decides that any of them
        is unlawful or unenforceable, the remaining paragraphs will remain in
        full force and effect.
      </p>
      <p>
        <strong>Third party rights:</strong> The Contract is between you and us.
        No other person has any rights to enforce any of its terms.
      </p>
      <p>
        <strong>Complaints:</strong> If a problem arises or you are dissatisfied
        with the Services, we have a comprehensive complaints policy (available
        from {company.tradingAs}).
      </p>
      <p>
        <strong>Alternative dispute resolution:</strong> Alternative dispute
        resolution is a process where an independent body considers the facts of
        a dispute and seeks to resolve it, without you having to go to court. If
        you are a consumer and are not happy with how we have handled any
        complaint, you may want to contact the alternative dispute resolution
        provider we use. You can submit a complaint to Trading Standards. You
        can find your local branch via their website.
      </p>

      <h2>Which country&rsquo;s laws apply to any disputes?</h2>
      <p>
        If you are a consumer, please note that these terms of use, their
        subject matter and their formation, are governed by English law. You and
        we both agree that the courts of England and Wales will have exclusive
        jurisdiction except that, if you are a resident of Northern Ireland you
        may also bring proceedings in Northern Ireland and, if you are resident
        of Scotland, you may also bring proceedings in Scotland.
      </p>
      <p>
        If you are a business, these terms of use, their subject matter and
        their formation (and any non-contractual disputes or claims) are
        governed by English law. We both agree to the exclusive jurisdiction of
        the courts of England and Wales.
      </p>
    </LegalPage>
  );
}
