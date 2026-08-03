import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { company, contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.legalName}, trading as ${company.tradingAs}, collects, uses and protects your personal data under UK GDPR.`,
};

const UPDATED = "4 August 2026";

export default function PrivacyPage() {
  const address = [...contact.addressLines].join(", ");

  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      updated={UPDATED}
      intro={`This notice explains what personal data ${company.legalName} (trading as ${company.tradingAs}) collects when you use this website or enquire about a vehicle, why we collect it, and what rights you have over it.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {company.legalName}, trading as {company.tradingAs}, is the data
        controller responsible for the personal data described in this notice.
      </p>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Registered company</strong>
            </td>
            <td>
              {company.legalName}
              {company.companyNumber
                ? ` (company number ${company.companyNumber})`
                : ""}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Trading name</strong>
            </td>
            <td>{company.tradingAs}</td>
          </tr>
          <tr>
            <td>
              <strong>Address</strong>
            </td>
            <td>{address}</td>
          </tr>
          <tr>
            <td>
              <strong>Email</strong>
            </td>
            <td>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Telephone</strong>
            </td>
            <td>
              <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a>
            </td>
          </tr>
          {company.icoNumber ? (
            <tr>
              <td>
                <strong>ICO registration</strong>
              </td>
              <td>{company.icoNumber}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <p>
        If you have any question about this notice or about how we handle your
        data, contact us at{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. The data we collect</h2>
      <h3>Information you give us</h3>
      <p>
        When you make an enquiry — through a form on this site, by email, by
        telephone or over WhatsApp — we collect the details you choose to send
        us. That typically means your name, email address, telephone number and
        the content of your message, including which vehicle you are interested
        in.
      </p>
      <h3>Finance enquiries</h3>
      <p>
        If you use our finance calculator or ask us to look into finance,
        additional information is involved. The calculator itself is provided by
        Codeweavers Limited and, in its standalone form, produces illustrative
        Hire Purchase figures from the vehicle price, deposit and term you
        enter. Those figures are indicative only and are not an offer of
        finance.
      </p>
      <p>
        If you decide to proceed with an application, you will be asked for
        further details such as your address history, employment and income.
        That information is used to approach lenders on your behalf and will be
        shared with them and with credit reference agencies. We will tell you
        before that happens.
      </p>
      <h3>Information collected automatically</h3>
      <p>
        Our web server records standard technical information when you visit,
        including your IP address, browser type and the pages you view. This is
        used to keep the site running and secure.
      </p>
      <p>
        We do not currently run advertising or analytics tracking on this
        website.
      </p>

      <h2>3. Why we use it, and our lawful basis</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Responding to your enquiry about a vehicle</td>
            <td>
              Steps taken at your request prior to entering a contract, and our
              legitimate interest in answering enquiries
            </td>
          </tr>
          <tr>
            <td>Arranging a sale, part exchange or delivery</td>
            <td>Performance of a contract with you</td>
          </tr>
          <tr>
            <td>Introducing you to finance lenders at your request</td>
            <td>
              Steps taken at your request prior to entering a contract, and
              compliance with our regulatory obligations
            </td>
          </tr>
          <tr>
            <td>Keeping records of sales, invoices and warranties</td>
            <td>Legal obligation, and our legitimate interest</td>
          </tr>
          <tr>
            <td>Keeping the website secure and available</td>
            <td>Our legitimate interest in protecting our systems</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not sell your personal data, and we do not use it for automated
        decision-making that produces a legal effect on you. Lenders you are
        introduced to may carry out automated credit decisions of their own —
        they will explain that in their own privacy notices.
      </p>

      <h2>4. Who we share it with</h2>
      <ul>
        <li>
          <strong>Codeweavers Limited</strong> — supplies the finance
          calculator and finance application journey used on this site.
        </li>
        <li>
          <strong>Finance lenders and brokers</strong> — only where you have
          asked us to explore finance for you.
        </li>
        <li>
          <strong>Vimeo</strong> — hosts the explainer films on our finance
          page. These load only when you choose to play them.
        </li>
        <li>
          <strong>Our hosting and email providers</strong> — who process data on
          our instructions in order to run the site and deliver our email.
        </li>
        <li>
          <strong>Professional advisers and authorities</strong> — where we are
          required to share information by law.
        </li>
      </ul>
      <p>
        {company.tradingAs} is a credit broker, not a lender. Where we introduce
        you to a lender, that lender becomes a data controller in its own right
        and will handle your data under its own privacy notice.
      </p>

      <h2>5. Cookies and similar technologies</h2>
      <p>
        This website does not set advertising or analytics cookies. Cookies may
        be set by third-party services when — and only when — you actively use
        them:
      </p>
      <ul>
        <li>
          The <strong>finance calculator</strong> may set cookies necessary for
          it to function once you run a quote.
        </li>
        <li>
          <strong>Vimeo</strong> may set cookies once you click to play a video.
          Videos are not loaded until you do, so no request reaches Vimeo before
          then.
        </li>
      </ul>
      <p>
        You can block or delete cookies in your browser settings. Doing so may
        stop the finance calculator working.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        Enquiries that do not lead to a purchase are kept for up to two years so
        we can pick up the conversation if you come back to us. Records relating
        to a completed sale, including invoices and finance documentation, are
        kept for at least six years to meet our tax, warranty and regulatory
        obligations. After that, data is deleted or anonymised.
      </p>

      <h2>7. Where your data is held</h2>
      <p>
        Your data is stored on servers within the United Kingdom or the European
        Economic Area. If any provider we use transfers data outside that area,
        we require appropriate safeguards such as the UK International Data
        Transfer Agreement or Addendum to be in place.
      </p>

      <h2>8. Your rights</h2>
      <p>Under UK data protection law you have the right to:</p>
      <ul>
        <li>ask for a copy of the personal data we hold about you;</li>
        <li>ask us to correct data that is inaccurate or incomplete;</li>
        <li>ask us to delete data where we no longer have a reason to keep it;</li>
        <li>ask us to restrict how we use your data;</li>
        <li>object to processing carried out on the basis of legitimate interests;</li>
        <li>ask us to transfer your data to another provider; and</li>
        <li>withdraw consent at any time, where we relied on consent.</li>
      </ul>
      <p>
        To exercise any of these, email{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>. We will respond
        within one month. There is normally no charge.
      </p>

      <h2>9. Complaints</h2>
      <p>
        If you are unhappy with how we have handled your data, please contact us
        first so we can put it right. You also have the right to complain to the
        Information Commissioner&rsquo;s Office at{" "}
        <a
          href="https://ico.org.uk/make-a-complaint/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>
        , or by calling 0303 123 1113.
      </p>

      <h2>10. Changes to this notice</h2>
      <p>
        We may update this notice from time to time. The date at the top shows
        when it was last changed. This notice applies to {site.url} and to
        enquiries made through it.
      </p>
    </LegalPage>
  );
}
