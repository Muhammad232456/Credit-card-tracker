interface Props {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: July 8, 2026</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Overview</h2>
          <p>
            CA Card Tracker ("we", "us", "our") is a free tool to help Canadians track their credit cards,
            rewards points, and spending. We are committed to protecting your privacy. This policy explains
            what data we collect and how we use it.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Your Card Data</h2>
          <p>
            All credit card data you enter — cards, balances, spending, points, and settings — is stored
            exclusively in your browser's <strong>local storage</strong>. This data never leaves your device
            and is never transmitted to our servers. We have no access to it.
          </p>
          <p className="mt-2">
            You can export or delete your data at any time from the Settings page.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Analytics</h2>
          <p>
            We use <strong>PostHog</strong> for anonymous usage analytics (e.g., which features are used most).
            This helps us improve the app. No personally identifiable information is collected. PostHog data
            is aggregated and cannot be linked back to you.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Feedback Form</h2>
          <p>
            If you submit feedback through the app, your message is sent via <strong>Web3Forms</strong> to
            our email. If you choose to include your email address for a reply, it is used solely to respond
            to your message and is not stored or shared.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Cookies</h2>
          <p>
            We do not use tracking cookies. Local storage is used only to persist your app data on your
            own device.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Third-Party Links</h2>
          <p>
            This site may contain links to third-party websites (including affiliate partners). We are not
            responsible for the privacy practices of those sites and encourage you to review their policies.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Children's Privacy</h2>
          <p>
            This service is not directed at anyone under the age of 18. We do not knowingly collect data
            from minors.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last updated" date at the top of this page
            reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Contact</h2>
          <p>
            If you have any questions about this privacy policy, please reach out via the feedback form in
            the app or email us at{' '}
            <a href="mailto:muttaqihemani@gmail.com" className="text-blue-600 underline">
              muttaqihemani@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
