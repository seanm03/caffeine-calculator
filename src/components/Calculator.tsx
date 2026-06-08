import { useMemo, useState } from 'react';
import type {
  BrewingParameters,
} from '../types';
import { calculateCaffeine } from '../engine/caffeineCalculator';
import { useCalculatorState } from '../hooks/useCalculatorState';
import BrewMethodSelector from './BrewMethodSelector';
import CoffeeInputs from './CoffeeInputs';
import AdvancedOptions from './AdvancedOptions';
import ResultsDisplay from './ResultsDisplay';
import SensitivityCharts from './SensitivityCharts';

type ResultView = 'result' | 'sensitivity';

export default function Calculator() {
  const {
    brewMethod, setBrewMethod,
    coffeeWeightG, setCoffeeWeightG,
    waterVolumeMl, setWaterVolumeMl,
    species, setSpecies,
    robustaPercent, setRobustaPercent,
    roastLevel, setRoastLevel,
    grindSize, setGrindSize,
    waterTemperatureC, setWaterTemperatureC,
    processingMethod, setProcessingMethod,
    altitude, setAltitude,
  } = useCalculatorState();

  const params: BrewingParameters = useMemo(
    () => ({
      brewMethod,
      coffeeWeightG,
      waterVolumeMl,
      species,
      robustaPercent: species === 'blend' ? robustaPercent : undefined,
      roastLevel,
      grindSize,
      waterTemperatureC,
      processingMethod,
      altitude,
    }),
    [
      brewMethod,
      coffeeWeightG,
      waterVolumeMl,
      species,
      robustaPercent,
      roastLevel,
      grindSize,
      waterTemperatureC,
      processingMethod,
      altitude,
    ],
  );

  const result = useMemo(() => calculateCaffeine(params), [params]);
  const [resultView, setResultView] = useState<ResultView>('result');

  return (
    <div className="card max-w-2xl mx-auto space-y-8">
      <BrewMethodSelector value={brewMethod} onChange={setBrewMethod} />

      <hr className="border-coffee-200 dark:border-coffee-700" />

      <CoffeeInputs
        coffeeWeightG={coffeeWeightG}
        onCoffeeWeightChange={setCoffeeWeightG}
        waterVolumeMl={waterVolumeMl}
        onWaterVolumeChange={setWaterVolumeMl}
        species={species}
        onSpeciesChange={setSpecies}
        robustaPercent={robustaPercent}
        onRobustaPercentChange={setRobustaPercent}
      />

      <hr className="border-coffee-200 dark:border-coffee-700" />

      <AdvancedOptions
        roastLevel={roastLevel}
        onRoastLevelChange={setRoastLevel}
        grindSize={grindSize}
        onGrindSizeChange={setGrindSize}
        waterTemperatureC={waterTemperatureC}
        onWaterTemperatureChange={setWaterTemperatureC}
        processingMethod={processingMethod}
        onProcessingMethodChange={setProcessingMethod}
        altitude={altitude}
        onAltitudeChange={setAltitude}
      />

      <hr className="border-coffee-200 dark:border-coffee-700" />

      {/* ── Result / Sensitivity toggle ──────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-coffee-200 dark:border-coffee-700 pb-3">
        <button
          type="button"
          onClick={() => setResultView('result')}
          className={`
            text-sm font-medium px-4 py-1.5 rounded-full transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400
            ${resultView === 'result'
              ? 'bg-coffee-600 text-white'
              : 'text-coffee-500 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-200'
            }
          `}
        >
          Result
        </button>
        <button
          type="button"
          onClick={() => setResultView('sensitivity')}
          className={`
            text-sm font-medium px-4 py-1.5 rounded-full transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400
            ${resultView === 'sensitivity'
              ? 'bg-coffee-600 text-white'
              : 'text-coffee-500 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-200'
            }
          `}
        >
          Sensitivity
        </button>
      </div>

      {resultView === 'result' ? (
        <ResultsDisplay result={result} coffeeWeightG={coffeeWeightG} waterVolumeMl={waterVolumeMl} brewMethod={brewMethod} />
      ) : (
        <SensitivityCharts currentParams={params} />
      )}
    </div>
  );
}
