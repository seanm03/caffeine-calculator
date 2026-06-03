import { useMemo } from 'react';
import type {
  BrewingParameters,
} from '../types';
import { calculateCaffeine } from '../engine/caffeineCalculator';
import { useCalculatorState } from '../hooks/useCalculatorState';
import BrewMethodSelector from './BrewMethodSelector';
import CoffeeInputs from './CoffeeInputs';
import AdvancedOptions from './AdvancedOptions';
import ResultsDisplay from './ResultsDisplay';

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

      <ResultsDisplay result={result} coffeeWeightG={coffeeWeightG} waterVolumeMl={waterVolumeMl} />
    </div>
  );
}
