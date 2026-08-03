import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { company, contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of use for the ${company.tradingAs} website.`,
};

const UPDATED = "4 August 2026";

export default function TermsPage() {
  const address = [...contact.addressLines].join(", ");

  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Terms & Conditions"
      updated={UPDATED}
      intro={`These terms govern your use of this website. They do not replace the sales documentation you receive when you buy a vehicle from ${company.tradingAs}.`}
    >
      <h2>1. About us</h2>
      <p>
        This website is operated by {company.legalName}, trading as{" "}
        {company.tradingAs}
        {company.companyNumber
          ? `, a company registered in England and Wales under number ${company.companyNumber}`
          : ""}
        , of {address}. You can reach us at{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> or{" "}
        <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a>.
      </p>

      <h2>2. Using this website</h2>
      <p>
        By using {site.url} you accept these terms. If you do not accept them,
        please do not use the site. You agree not to misuse the site, attempt to
        gain unauthorised access to it, or use it in any way that is unlawful or
        could damage its availability.
      </p>

      <h2>3. Vehicle listings</h2>
      <p>
        We take care to describe our vehicles accurately, and photographs are of
        the actual vehicle unless stated otherwise. Even so, listings are an
        invitation to enquire rather than a contractual offer. Specification,
        mileage, price and availability can change, and errors can occur.
      </p>
      <p>
        A vehicle is only reserved once we have confirmed it with you and taken
        any agreed deposit. Nothing on this site forms a binding contract of
        sale. Please satisfy yourself as to a vehicle&rsquo;s condition and
        specification before purchase.
      </p>

      <h2>4. Pricing</h2>
      <p>
        Prices shown are in pounds sterling for the vehicle only. Unless we
        state otherwise in writing, they exclude delivery, road fund licence and
        any optional products. We reserve the right to correct pricing errors
        before a sale is concluded.
      </p>

      <h2>5. Finance illustrations</h2>
      <p>
        The finance calculator on this site is provided by Codeweavers Limited
        and produces <strong>illustrative figures only</strong>. It does not
        constitute an offer of finance, a quotation, or advice. Figures depend
        on the information entered and on lender criteria at the time.
      </p>
      <p>
        Finance is subject to status, affordability and lender approval. Terms
        and conditions apply. Written quotations are available on request.{" "}
        {company.tradingAs} is a credit broker, not a lender, and may receive a
        commission from lenders for introducing you to them. You can ask us for
        details of any commission arrangement.
      </p>
      <p>
        You must be 18 or over and a UK resident to apply for finance.
      </p>

      <h2>6. Your legal rights</h2>
      <p>
        Nothing in these terms affects your statutory rights, including your
        rights under the Consumer Rights Act 2015 in relation to goods that are
        of satisfactory quality, fit for purpose and as described. Any warranty
        we supply is in addition to those rights, not instead of them.
      </p>

      <h2>7. Third-party content</h2>
      <p>
        This site contains embedded content and links from third parties,
        including the Codeweavers finance calculator and films hosted by Vimeo.
        We are not responsible for the content or privacy practices of those
        third parties. Their own terms and privacy notices will apply.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The content of this site, including text, photography, the{" "}
        {company.tradingAs} name and logo, belongs to us or our licensors. You
        may view and print pages for your own use, but you may not reproduce or
        republish them commercially without our written permission.
      </p>

      <h2>9. Liability</h2>
      <p>
        We provide this website on an &ldquo;as is&rdquo; basis and do not
        guarantee it will always be available or error free. To the extent
        permitted by law, we are not liable for any loss arising from your use
        of the site. We do not exclude or limit liability for death or personal
        injury caused by our negligence, for fraud, or for anything else that
        cannot lawfully be excluded.
      </p>

      <h2>10. Complaints</h2>
      <p>
        If something has gone wrong, please contact us at{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> so we can try to
        resolve it. Complaints relating to a regulated finance introduction may
        ultimately be referred to the Financial Ombudsman Service.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts
        of England and Wales have jurisdiction over any dispute.
      </p>

      <h2>12. Privacy</h2>
      <p>
        How we handle your personal data is set out in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
  );
}
