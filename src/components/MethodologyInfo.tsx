/**
 * MethodologyInfo — Explains the caffeine calculation method, cites research,
 * and links to James Hoffmann's video.
 */

const SCIENTIFIC_REFERENCES: { author: string; year: number; title: string; doi?: string; link?: string }[] = [
  {
    author: 'Spiro, M. & Selwood, R.M.',
    year: 1984,
    title: 'Kinetics and mechanism of caffeine infusion from coffee',
    doi: '10.1002/jsfa.2740350810',
  },
  {
    author: 'Bell, L.N. et al.',
    year: 1996,
    title: 'Caffeine content in coffee as influenced by grind and brew technique',
    doi: '10.1016/S0963-9969(96)00061-0',
  },
  {
    author: 'McCusker, R.R. et al.',
    year: 2003,
    title: 'Specialty coffee: Caffeine content variability',
    doi: '10.1093/jat/27.7.520',
  },
  {
    author: 'McCusker, R.R. et al.',
    year: 2006,
    title: 'Caffeine content of decaffeinated coffee',
    doi: '10.1093/jat/30.8.611',
  },
  {
    author: 'Hečimović, I. et al.',
    year: 2011,
    title: 'Comparative study of polyphenols and caffeine in different coffee varieties affected by the degree of roasting',
    doi: '10.1016/j.foodchem.2011.05.059',
  },
  {
    author: 'Severini, C. et al.',
    year: 2017,
    title: 'The Question of Caffeine: A comprehensive review of extraction variables',
    doi: '10.5772/intechopen.69002',
  },
  {
    author: 'Fuller, M. & Rao, N.Z.',
    year: 2017,
    title: 'The effect of time, roasting temperature, and grind size on caffeine in cold brew coffee',
    doi: '10.1038/s41598-017-18247-4',
  },
  {
    author: 'Olechno, E. et al.',
    year: 2021,
    title: 'Coffee brews: Are they a source of macroelements in human nutrition? — A systematic review',
    doi: '10.3390/foods10061208',
  },
  {
    author: 'Ahmed, S. et al.',
    year: 2021,
    title: 'Climate change and coffee quality: Systematic review on effects of environmental and management factors',
    doi: '10.3389/fpls.2021.708013',
  },
  {
    author: 'Lindsey, Z.R. et al.',
    year: 2024,
    title: 'Caffeine content in filter coffee brews as a function of degree of roast and extraction yield',
    doi: '10.1038/s41598-024-80385-3',
  },
  {
    author: 'Duke, B.W. et al.',
    year: 2025,
    title: 'Effects of roasting degree and grinding size on caffeine content and sensorial quality of coffee',
    doi: '10.1155/jfq/2405668',
  },
];

export default function MethodologyInfo() {
  return (
    <div className="space-y-8 max-w-none md:max-w-prose">
      {/* Section 1: How We Calculate Caffeine */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          📐 How We Calculate Caffeine
        </h2>
        <div className="bg-coffee-50 dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 rounded-xl p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Our calculator uses a <strong>multiplicative model</strong> grounded in peer-reviewed
            coffee science. Here&apos;s how it works:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-coffee-700 dark:text-coffee-100">
            <li>
              <strong>Start with species caffeine content.</strong>{' '}
              Arabica beans contain ~12 mg/g of caffeine; Robusta beans contain ~20 mg/g.
              For blends, we use a weighted average based on your blend ratio.
            </li>
            <li>
              <strong>Adjust for roast level.</strong>{' '}
              Light roasts retain ~5% more caffeine per gram (less thermal degradation);
              dark roasts lose ~10% due to sublimation at high temperatures.
            </li>
            <li>
              <strong>Adjust for processing method, altitude, and other factors.</strong>{' '}
              Natural (dry) processing may concentrate caffeine slightly; higher-altitude
              beans tend to have marginally less caffeine (inverse pest-defense relationship).
              These are small effects (&lt;5% each).
            </li>
            <li>
              <strong>Multiply by extraction efficiency.</strong>{' '}
              Each brew method has a different base efficiency (e.g., pour-over ~90%,
              espresso ~80%). We then adjust for grind size (finer = faster extraction)
              and water temperature (hotter = more efficient, up to a point).
            </li>
            <li>
              <strong>Result = your estimated caffeine per cup.</strong>{' '}
              The final number is compared to the FDA/EFSA daily safe limit of 400 mg.
            </li>
          </ol>
        </div>
      </section>

      {/* Section 2: James Hoffmann's Research */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          🎥 James Hoffmann&apos;s Caffeine Research
        </h2>
        <div className="bg-coffee-50 dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 rounded-xl p-5 space-y-3 text-sm leading-relaxed">
          <p className="text-coffee-700 dark:text-coffee-100">
            In his 2023 video{' '}
            <a
              href="https://www.youtube.com/watch?v=etnMr8oUSDo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee-600 dark:text-coffee-200 underline hover:text-coffee-800 dark:hover:text-coffee-200"
            >
              &ldquo;I Did Caffeine Analysis: Some Unexpected Results!&rdquo;
            </a>
            , James Hoffmann used a{' '}
            <strong>Lighttells CA-700 caffeine analyzer</strong> to measure caffeine
            across brew methods with the same 18 g dose of coffee.
          </p>

          <div className="border-l-4 border-coffee-400 dark:border-coffee-500 pl-4 py-2 my-3 bg-white dark:bg-coffee-800/50 rounded-r-lg">
            <p className="font-semibold text-coffee-800 dark:text-coffee-100">
              🔑 Key Finding:
            </p>
            <p className="text-coffee-700 dark:text-coffee-100">
              <strong>Filter/pour-over coffee delivers ~50% more caffeine than espresso</strong>{' '}
              from the same coffee dose (170 mg vs. 110 mg from 18 g). This contradicts the
              common belief that espresso is the stronger caffeine source — in reality,
              longer contact time with water extracts more caffeine.
            </p>
          </div>

          <p className="text-coffee-600 dark:text-coffee-200 text-xs italic">
            Note: Hoffmann&apos;s specific coffee gave extraction efficiencies of ~41% (espresso)
            and ~63% (pour-over). Our model uses literature-average values (75–95%) from 35+
            papers, since a single bean/roast doesn&apos;t represent all coffee. Users should
            expect ±20% variability per McCusker et al. (2003).
          </p>
        </div>
      </section>

      {/* Section 3: Brew Methods &amp; Extraction Efficiency */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          ☕ Brew Methods &amp; Extraction Efficiency
        </h2>
        <div className="bg-coffee-50 dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 rounded-xl p-5 space-y-3 text-sm leading-relaxed">
          <p className="text-coffee-700 dark:text-coffee-100">
            Each brew method has a different base extraction efficiency (η) based on
            how water interacts with coffee grounds. These values represent the
            fraction of available caffeine extracted into the cup under standard
            conditions.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Brew method efficiencies">
              <thead>
                <tr className="border-b border-coffee-200 dark:border-coffee-700">
                  <th scope="col" className="text-left py-2 pr-4 font-semibold text-coffee-800 dark:text-coffee-200">Method</th>
                  <th scope="col" className="text-left py-2 pr-4 font-semibold text-coffee-800 dark:text-coffee-200">Type</th>
                  <th scope="col" className="text-right py-2 font-semibold text-coffee-800 dark:text-coffee-200">Efficiency (η)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100 dark:divide-coffee-800">
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Espresso</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Percolation (pressure)</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.80</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Pour-Over</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Percolation</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.90</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">French Press</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Immersion</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.92</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">AeroPress</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Immersion (pressure-assisted)</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.87</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Moka Pot</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Percolation (steam pressure)</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.85</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Cold Brew</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Immersion (cold)</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.90</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Turkish</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Immersion (boiled)</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">0.92</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-coffee-700 dark:text-coffee-200">Instant</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Dissolution</td>
                  <td className="py-2 text-right tabular-nums text-coffee-700 dark:text-coffee-200">1.00</td>
                </tr>
                <tr className="bg-coffee-100/50 dark:bg-coffee-700/50">
                  <td className="py-2 pr-4 font-medium text-coffee-800 dark:text-coffee-100">Filter Immersion</td>
                  <td className="py-2 pr-4 text-coffee-500 dark:text-coffee-300">Immersion + paper filtration</td>
                  <td className="py-2 text-right tabular-nums font-medium text-coffee-800 dark:text-coffee-100">0.91</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-l-4 border-coffee-400 dark:border-coffee-500 pl-4 py-2 bg-white dark:bg-coffee-800/50 rounded-r-lg">
            <p className="font-semibold text-coffee-800 dark:text-coffee-100">
              🆕 Paper-Filtered Immersion (Filter Immersion)
            </p>
            <p className="text-coffee-700 dark:text-coffee-100">
              This method combines <strong>full immersion steeping</strong> (like French press)
              with <strong>paper filtration</strong> (like pour-over). The coffee grounds steep
              fully immersed in water for high extraction efficiency, then pass through a paper
              filter that removes fine sediment and oils. The result is a clean, sediment-free
              cup with the high extraction yield of immersion brewing — placing its efficiency
              (0.91) between French press (0.92) and pour-over (0.90).
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Scientific References */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          📚 Scientific References
        </h2>
        <div className="bg-coffee-50 dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 rounded-xl overflow-hidden">
          <ul className="divide-y divide-coffee-200 dark:divide-coffee-700 text-sm">
            {SCIENTIFIC_REFERENCES.map((ref) => (
              <li key={`${ref.author}-${ref.year}`} className="px-5 py-3">
                <p className="text-coffee-800 dark:text-coffee-100 font-medium">
                  {ref.author} ({ref.year})
                </p>
                <p className="text-coffee-600 dark:text-coffee-200">
                  {ref.title}
                </p>
                {ref.doi && (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-coffee-500 dark:text-coffee-200 underline
                               hover:text-coffee-700 dark:hover:text-coffee-200
                               transition-colors break-all"
                  >
                    doi.org/{ref.doi}
                  </a>
                )}
                {ref.link && !ref.doi && (
                  <a
                    href={ref.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-coffee-500 dark:text-coffee-200 underline
                               hover:text-coffee-700 dark:hover:text-coffee-200
                               transition-colors"
                  >
                    Read online
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 5: Accuracy */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          🎯 Accuracy
        </h2>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-sm leading-relaxed">
          <p className="text-amber-800 dark:text-amber-200">
            Our estimates aim for <strong>±20% accuracy</strong> based on the
            variability found in specialty coffee by McCusker et al. (2003).
            Actual caffeine content depends on many variables including specific
            coffee origin, exact brewing technique, and individual bean characteristics.
          </p>
          <p className="text-amber-700 dark:text-amber-300 mt-2">
            This calculator is an <strong>estimation tool</strong>, not a medical
            device. For precise caffeine measurement, laboratory analysis is required.
          </p>
        </div>
      </section>

      {/* Section 6: Caveats & Limitations */}
      <section>
        <h2 className="text-xl font-bold text-coffee-800 dark:text-coffee-300 mb-3">
          ⚠️ Caveats &amp; Limitations
        </h2>
        <div className="bg-coffee-50 dark:bg-coffee-800 border border-coffee-200 dark:border-coffee-700 rounded-xl p-5 space-y-2 text-sm leading-relaxed text-coffee-700 dark:text-coffee-100">
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong>Varietal differences</strong> can shift caffeine content by ~±10%.
              Ethiopian landrace varieties can range from 0.6%–1.6% caffeine vs. the
              typical 1.0%–1.4% of cultivated Arabica. We do not model individual varieties
              because no comprehensive peer-reviewed varietal comparison exists.
            </li>
            <li>
              <strong>Altitude effects</strong> are modest (±5%) and can be reversed by
              other environmental factors like shade, soil, and rainfall. Our altitude
              modifier is a best-estimate from the preponderance of evidence (3 of 4 studies).
            </li>
            <li>
              <strong>Region/origin is not modeled separately.</strong> Research shows
              geographic effects on caffeine are almost entirely driven by altitude,
              temperature, and soil — not an independent &ldquo;terroir&rdquo; effect.
              Adding region as a parameter would be redundant and potentially misleading.
            </li>
            <li>
              <strong>Caffeine per bean does not change significantly during roasting</strong>{' '}
              (it survives roasting well), but bean mass decreases, so caffeine-per-gram
              changes slightly. Our roast multipliers account for this.
            </li>
            <li>
              <strong>Decaf coffee still contains residual caffeine</strong> (3–16 mg per cup).
              We use a conservative 3 mg estimate for generic decaf.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
