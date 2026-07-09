interface Props {
  onBack?: () => void;
}

export default function AffiliateDisclosure({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Affiliate Disclosure</h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: July 8, 2026</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Our Commitment to Transparency</h2>
          <p>
            CA Card Tracker may earn a commission when you apply for a credit card or financial product
            through links on this site. This is how we keep the tool free for everyone.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">How Affiliate Links Work</h2>
          <p>
            Some links on this site are affiliate links. If you click one and are approved for a product,
            we may receive a referral fee from the financial institution or affiliate network — at
            <strong> no extra cost to you</strong>. You pay the same rate whether you use our link or go
            directly to the provider.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Editorial Independence</h2>
          <p>
            Affiliate relationships do not influence our card data, benefit values, point valuations, or
            tool recommendations. We do not accept payment to feature or rank cards more favourably.
            All information is researched independently.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Affiliate Partners</h2>
          <p>
            We may work with various affiliate networks and financial institutions. Partnerships may
            change over time as we expand the tool.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Not Financial Advice</h2>
          <p>
            The content on CA Card Tracker is for informational purposes only and does not constitute
            financial, legal, or tax advice. Always review the terms and conditions of any financial
            product before applying. Consider consulting a licensed financial advisor for advice
            specific to your situation.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Questions?</h2>
          <p>
            If you have any questions about our affiliate relationships, please reach out via the
            feedback button on the Dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
