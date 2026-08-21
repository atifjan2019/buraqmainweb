import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { company, contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `The cookies and similar technologies used on the ${company.tradingAs} website, and how to control them.`,
};

const UPDATED = "21 August 2026";

/**
 * Written from what this site ACTUALLY sets, not from a template.
 *
 * That audit matters more than the page: at the time of writing the site sets
 * exactly one cookie — the enquiry receipt — and it is strictly necessary,
 * which is why there is no consent banner. A policy listing analytics and
 * advertising cookies that are not present would be both untrue and an
 * invitation to add them without thinking.
 *
 * If Google Analytics, a Meta pixel or any advertising tag is ever added, this
 * page must change AND a consent banner becomes legally required under PECR,
 * because those are not strictly necessary.
 */
export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Cookie Policy"
      updated={UPDATED}
      intro={`This page explains the cookies and similar technologies used on the ${company.tradingAs} website, what each one is for, and how to control them.`}
    >
      <h2>1. What cookies are</h2>
      <p>
        A cookie is a small text file that a website asks your browser to store.
        It lets the site remember something between one page and the next — for
        example that you have just submitted an enquiry. Similar technologies,
        such as local storage, do the same job in a slightly different way, and
        this policy covers those too.
      </p>

      <h2>2. What we use, and why</h2>
      <p>
        We do not use advertising cookies, and we do not run analytics or
        tracking scripts on this site. The full list is short:
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>burraq_enquiry</strong>
            </td>
            <td>
              Set only when you submit an enquiry, so the confirmation page can
              show your reference number and which vehicle you asked about. It
              is read by our server, not by scripts in your browser.
            </td>
            <td>When you close your browser</td>
          </tr>
          <tr>
            <td>
              <strong>theme</strong>
            </td>
            <td>
              Not a cookie but local storage. Remembers whether you chose the
              light or dark version of the site so it does not reset on every
              visit. It never leaves your device.
            </td>
            <td>Until you clear your browser data</td>
          </tr>
        </tbody>
      </table>
      <p>
        Both are <strong>strictly necessary</strong>: one delivers a service you
        asked for, the other stores a preference you set yourself. Under the
        Privacy and Electronic Communications Regulations, cookies of this kind
        do not require consent, which is why this site shows no cookie banner.
        If that ever changes, this page will change with it and you will be
        asked before anything non-essential is set.
      </p>

      <h2>3. Third parties</h2>
      <p>
        Two features on this site are provided by other companies. Neither
        loads, and neither can set anything, until you choose to use it:
      </p>
      <ul>
        <li>
          <strong>Codeweavers</strong> supplies the finance calculator on our
          finance pages. When you use it, their script runs in your browser and
          may set cookies of its own, governed by their privacy notice rather
          than ours.
        </li>
        <li>
          <strong>Vimeo</strong> hosts the films on our finance page. They are
          requested with Vimeo&rsquo;s &ldquo;do not track&rdquo; setting
          enabled, and nothing loads from Vimeo until you press play.
        </li>
      </ul>
      <p>
        Our vehicle photographs and manufacturer logos are served from our own
        systems, so browsing stock involves no third party at all.
      </p>

      <h2>4. How to control cookies</h2>
      <p>
        You can delete or block cookies through your browser settings —
        every major browser offers this under Settings, usually within Privacy.
        Blocking the enquiry cookie will not stop you browsing or enquiring; it
        only means the confirmation page cannot show your reference back to you.
      </p>
      <p>
        Clearing your browser&rsquo;s local storage will reset the site to its
        default appearance next time you visit.
      </p>

      <h2>5. Changes to this policy</h2>
      <p>
        If we add anything that sets a cookie, this page is updated before it
        goes live. The date at the top tells you when it last changed.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about this policy can be sent to {contact.email} or to{" "}
        {contact.addressLines.join(", ")}.
      </p>
    </LegalPage>
  );
}
