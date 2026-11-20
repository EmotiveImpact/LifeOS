import { describe, expect, test } from 'bun:test';
import { barcodeCandidates, energyMatches, foodFactsUrl, itemsFromReading, labelProduct, portionNutrition, portionsFor, readFoodFacts, validBarcode } from '../../packages/core/src/food/foodfacts';

/** Shaped like Open Food Facts' API v2 answer for a carton of oat milk (the board's barcode screen). */
const oatMilk = {
  code: '7394376616228', status: 1, status_verbose: 'product found',
  product: {
    product_name: 'Oat drink barista edition', brands: 'Oatly, Oatly AB', quantity: '1 l', product_quantity: 1000, product_quantity_unit: 'ml',
    nutrition_data_per: '100g',
    nutriments: { 'energy-kcal_100g': 59, 'energy-kj_100g': 247, fat_100g: 3, 'saturated-fat_100g': 0.3, carbohydrates_100g: 6.6, sugars_100g: 3.4, fiber_100g: 0.8, proteins_100g: 1, salt_100g: 0.1 },
  },
};
/** A granola box with a serving size, and energy only in kJ. */
const granola = {
  code: '5010029000023', status: 1,
  product: {
    product_name_en: 'Crunchy granola', brands: 'Morning Co', quantity: '500 g', serving_size: '45 g', serving_quantity: 45,
    nutriments: { 'energy-kj_100g': 1724, fat_100g: 16, 'saturated-fat_100g': 3.1, carbohydrates_100g: 52, sugars_100g: 21, fiber_100g: 4, proteins_100g: 11, sodium_100g: 0.16 },
  },
};

describe('barcodes', () => {
  test('EAN-13, EAN-8 and UPC-A with a correct check digit', () => {
    expect(['4006381333931', '73513537', '036000291452', '7394376616228'].map(validBarcode)).toEqual([true, true, true, true]);
  });
  test('a wrong check digit, letters or the wrong length are refused', () => {
    expect(['4006381333932', '40063813339a1', '12345', ''].map(validBarcode)).toEqual([false, false, false, false]);
  });
  test('UPC-A is tried as itself and as the EAN-13 it is inside', () => {
    expect(barcodeCandidates(' 036000291452 ')).toEqual(['036000291452', '0036000291452']);
    expect(barcodeCandidates('0036000291452')).toEqual(['0036000291452', '036000291452']);
    expect(barcodeCandidates('4006381333931')).toEqual(['4006381333931']);
  });
  test('the lookup asks Open Food Facts for only the fields life reads', () => {
    const url = new URL(foodFactsUrl('4006381333931'));
    expect(url.origin).toBe('https://world.openfoodfacts.org');
    expect(url.pathname).toBe('/api/v2/product/4006381333931');
    expect(url.searchParams.get('fields')).toContain('nutriments');
  });
});

describe('reading an Open Food Facts product', () => {
  test('a drink: name, brand, per 100 ml and the portions a glass would be', () => {
    const read = readFoodFacts(oatMilk, oatMilk.code);
    if (!read.found || !read.product) throw new Error('expected a product');
    expect(read.product).toMatchObject({ code: '7394376616228', name: 'Oat drink barista edition', brand: 'Oatly', basis: 'ml', source: 'open-food-facts' });
    expect(read.product.per100).toEqual({ kcal: 59, protein: 1, carbs: 6.6, fat: 3, fibre: 0.8, sugars: 3.4, saturatedFat: 0.3, salt: 0.1 });
    expect(read.product.portions).toEqual([150, 250, 330]);
  });
  test('kJ only becomes kcal, sodium becomes salt, and the serving sets the portions', () => {
    const read = readFoodFacts(granola, granola.code);
    if (!read.found || !read.product) throw new Error('expected a product');
    expect(read.product.per100.kcal).toBe(412);
    expect(read.product.per100.salt).toBe(0.4);
    expect(read.product).toMatchObject({ name: 'Crunchy granola', basis: 'g', servingAmount: 45 });
    expect(read.product.portions).toEqual([30, 45, 60]);
  });
  test('not in the database', () => {
    expect(readFoodFacts({ code: '4006381333931', status: 0, status_verbose: 'product not found' }, '4006381333931')).toEqual({ found: false });
  });
  test('found, but without its nutrition: the label has to be read instead', () => {
    expect(readFoodFacts({ code: '4006381333931', status: 1, product: { product_name: 'Mystery bar', nutriments: {} } }, '4006381333931')).toEqual({ found: true, name: 'Mystery bar', product: null });
  });
  test('garbage is treated as not found, never as zero calories', () => {
    expect(readFoodFacts(null, '4006381333931')).toEqual({ found: false });
    expect(readFoodFacts({ status: 1, product: { nutriments: { 'energy-kcal_100g': 'lots' } } }, '4006381333931')).toEqual({ found: true, name: null, product: null });
  });
});

describe('portions', () => {
  test('a portion is the per-100 figures scaled to the amount', () => {
    const read = readFoodFacts(granola, granola.code);
    if (!read.found || !read.product) throw new Error('expected a product');
    expect(portionNutrition(read.product.per100, 45)).toEqual({ grams: 45, kcal: 185.4, protein: 4.95, carbs: 23.4, fat: 7.2, fibre: 1.8 });
  });
  test('without a serving: 50, 100 and 150 g, or 150, 250 and 330 ml', () => {
    expect(portionsFor('g')).toEqual([50, 100, 150]);
    expect(portionsFor('ml')).toEqual([150, 250, 330]);
    expect(portionsFor('g', 30)).toEqual([20, 30, 40]);
  });
});

describe('a label read from a photo', () => {
  test('becomes a product like any other, credited to the label', () => {
    const p = labelProduct({ name: 'Granola', basis: 'g', per100: { kcal: 412, protein: 11, carbs: 52, fat: 16, fibre: 4, sugars: 21, saturatedFat: 3.1, salt: 0.4 }, servingAmount: 45 });
    expect(p).toMatchObject({ name: 'Granola', basis: 'g', source: 'label', portions: [30, 45, 60] });
  });
});

describe('a meal read from a photo', () => {
  test('items with an amount and figures per 100 g become diary items', () => {
    const items = itemsFromReading([
      { name: 'Salmon', portion: 'one fillet', grams: 120, confidence: 0.9, per100g: { kcal: 206, protein: 22, carbs: 0, fat: 13, fibre: 0 } },
      { name: 'Rice', grams: 150, confidence: 0.8, per100g: { kcal: 130, protein: 2.7, carbs: 28.6, fat: 0.3, fibre: 0.4 } },
    ]);
    expect(items[0]).toEqual({ name: 'Salmon', grams: 120, kcal: 247.2, protein: 26.4, carbs: 0, fat: 15.6, fibre: 0, confidence: 0.9 });
    expect(items[1].kcal).toBe(195);
  });
  test('an item without figures keeps its amount and says it needs them', () => {
    const [item] = itemsFromReading([{ name: 'Mystery sauce', confidence: 0.4 }]);
    expect(item).toMatchObject({ name: 'Mystery sauce', grams: 100, kcal: 0, needsFigures: true });
  });
  test('the energy has to match the protein, carbohydrate and fat it claims', () => {
    expect(energyMatches({ kcal: 206, protein: 22, carbs: 0, fat: 13, fibre: 0 })).toBe(true);
    expect(energyMatches({ kcal: 100, protein: 50, carbs: 50, fat: 50 })).toBe(false);
    expect(energyMatches({ kcal: 412, protein: 11, carbs: 52, fat: 16, fibre: 4 }, 0.35)).toBe(true);
  });
});
