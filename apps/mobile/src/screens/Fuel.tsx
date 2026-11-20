import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { Screen } from './Screen';
import { ParentStateContent } from './States';
import { Btn, Display, Page } from './v26/kit';
import {
  BarcodeV26, ConfirmV26, FooddayV26, FoodsearchV26, FuelV26, FuelhomeV26, FixwordsV26, LabelscanV26, MealresultV26, MenuscanV26, QuicklogV26,
  SavedmealsV26, SayitV26, SnapV26,
} from './v26/fuel';
import {
  AlcoholV26, CookV26, DescribeexerciseV26, ExerciseaddV26, FoodqualityV26, FuelgoalV26, FuelplanV26, FuelprogressV26, ImportfoodV26, MealplanV26,
  MealtimingV26, NutrientsV26, WeekbudgetV26, WeighinV26,
} from './v26/fuelmore';

/** Fuel's 28 screens, V26 (`v26/fuel.tsx`, `v26/fuelmore.tsx`). Calorie features are for adults only. */
export function FuelScreen({ screen }: { screen: ScreenKey }) {
  const { data } = useSeed(), nav = useNavigation();
  const params = useLocalSearchParams<{ state?: string }>();
  if (data.profile.age < 18) return (
    <Page screen={screen} center footer={<Btn label="Back to Body" onPress={() => nav.replace('body')} />}>
      <Display s="{Food, without the numbers.} Calorie features are for adults only. A varied diet, regular meals and feeling well matter more than a number." />
    </Page>
  );
  if (screen === 'snap' && params.state === 'permdenied') return <Screen screen={screen}><ParentStateContent kind="permdenied" /></Screen>;
  switch (screen) {
    case 'snap': return <SnapV26 />;
    case 'confirm': return <ConfirmV26 />;
    case 'fuel': return <FuelV26 />;
    case 'mealresult': return <MealresultV26 />;
    case 'fuelhome': return <FuelhomeV26 />;
    case 'foodday': return <FooddayV26 />;
    case 'quicklog': return <QuicklogV26 />;
    case 'savedmeals': return <SavedmealsV26 />;
    case 'foodsearch': return <FoodsearchV26 />;
    case 'barcode': return <BarcodeV26 />;
    case 'labelscan': return <LabelscanV26 />;
    case 'menuscan': return <MenuscanV26 />;
    case 'sayit': return <SayitV26 />;
    case 'fixwords': return <FixwordsV26 />;
    case 'cook': return <CookV26 />;
    case 'mealplan': return <MealplanV26 />;
    case 'fuelgoal': return <FuelgoalV26 />;
    case 'fuelplan': return <FuelplanV26 />;
    case 'fuelprogress': return <FuelprogressV26 />;
    case 'exerciseadd': return <ExerciseaddV26 />;
    case 'describeexercise': return <DescribeexerciseV26 />;
    case 'weighin': return <WeighinV26 />;
    case 'nutrients': return <NutrientsV26 />;
    case 'weekbudget': return <WeekbudgetV26 />;
    case 'mealtiming': return <MealtimingV26 />;
    case 'foodquality': return <FoodqualityV26 />;
    case 'alcohol': return <AlcoholV26 />;
    default: return <ImportfoodV26 />;
  }
}
