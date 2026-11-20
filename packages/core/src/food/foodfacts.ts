/**
 * Packaged food and meal photos as diary items (SPEC §3.5, Phase 27).
 *
 * - Barcodes: the GS1 check digit (EAN-13, EAN-8, UPC-A, GTIN-14), so a misread code is caught before any lookup.
 * - Open Food Facts (API v2): a product's name, brand and nutrition per 100 g or 100 ml, read defensively. Missing
 *   figures are missing, never zero. Food facts are © Open Food Facts contributors, under the Open Database Licence,
 *   and every screen that shows them says so.
 * - A label read from a photo becomes the same kind of product, credited to the label.
 * - A meal read from a photo (the `food` job) becomes diary items: grams times the figures per 100 g. An item the model
 *   gave no figures for keeps its name and asks for them.
 * - Energy is checked against what it is made of (Atwater: 4 kcal per g of protein and carbohydrate, 9 of fat, 2 of
 *   fibre), so a reading that claims 100 kcal for 50 g of fat is caught.
 */
import { isNum } from '../math/stats';

export type Basis = 'g' | 'ml';
export interface Per100 { kcal: number; protein: number; carbs: number; fat: number; fibre?: number; sugars?: number; saturatedFat?: number; salt?: number }
export interface FoodProduct {
  code?: string;
  name: string;
  brand?: string;
  basis: Basis;
  per100: Per100;
  /** One serving, in grams or ml, when the pack says. */
  servingAmount?: number;
  /** Three amounts to choose from, smallest first. */
  portions: number[];
  source: 'open-food-facts' | 'label';
}
export type FoodFactsResult = { found: false } | { found: true; name: string | null; product: FoodProduct | null };

export const FOOD_FACTS_ORIGIN = 'https://world.openfoodfacts.org';
export const FOOD_FACTS_CREDIT = 'Food facts from Open Food Facts, under the Open Database Licence.';
const FIELDS = ['code', 'product_name', 'product_name_en', 'brands', 'quantity', 'product_quantity', 'product_quantity_unit', 'serving_size', 'serving_quantity', 'nutrition_data_per', 'nutriments'];
const KJ_PER_KCAL = 4.184;
const SALT_PER_SODIUM = 2.5;

const round = (v: number, places = 2) => { const k = 10 ** places; return Math.round(v * k) / k; };
const round5 = (v: number) => Math.max(5, Math.round(v / 5) * 5);

/* ───────────────────────── Barcodes ───────────────────────── */

/** True for an EAN-8, UPC-A, EAN-13 or GTIN-14 whose GS1 check digit is right. */
export function validBarcode(raw: string): boolean {
  const code = raw.trim();
  if (!/^\d+$/.test(code) || ![8, 12, 13, 14].includes(code.length)) return false;
  const digits = code.split('').map(Number);
  const check = digits.pop() as number;
  const total = digits.reverse().reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (total % 10)) % 10 === check;
}

/** The codes to try, in order: a UPC-A is also stored as the EAN-13 with a leading zero, and the other way round. */
export function barcodeCandidates(raw: string): string[] {
  const code = raw.replace(/\s+/g, '');
  if (/^\d{12}$/.test(code)) return [code, `0${code}`];
  if (/^0\d{12}$/.test(code)) return [code, code.slice(1)];
  return [code];
}

export const foodFactsUrl = (code: string) => `${FOOD_FACTS_ORIGIN}/api/v2/product/${encodeURIComponent(code)}?fields=${FIELDS.join(',')}`;

/* ───────────────────────── Reading a product ───────────────────────── */

const num = (v: unknown): number | undefined => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : undefined;
};
const words = (v: unknown, max = 120): string | undefined => (typeof v === 'string' && v.trim() ? v.trim().replace(/\s+/g, ' ').slice(0, max) : undefined);

function basisOf(p: Record<string, unknown>): Basis {
  const unit = words(p.product_quantity_unit)?.toLowerCase();
  if (unit === 'ml' || unit === 'l' || unit === 'cl') return 'ml';
  if (unit === 'g' || unit === 'kg') return 'g';
  return /\d\s*(ml|cl|l)\b/i.test(words(p.quantity) ?? '') ? 'ml' : 'g';
}

/** Three amounts: around one serving when the pack gives one, otherwise a usual glass or bowl. */
export function portionsFor(basis: Basis, serving?: number): number[] {
  if (isNum(serving) && serving > 0) return [...new Set([round5((serving * 2) / 3), Math.round(serving), round5((serving * 4) / 3)])];
  return basis === 'ml' ? [150, 250, 330] : [50, 100, 150];
}

function per100From(n: Record<string, unknown>): Per100 | null {
  const kj = num(n['energy-kj_100g']) ?? num(n.energy_100g);
  const kcal = num(n['energy-kcal_100g']) ?? (kj !== undefined ? Math.round(kj / KJ_PER_KCAL) : undefined);
  const protein = num(n.proteins_100g), carbs = num(n.carbohydrates_100g), fat = num(n.fat_100g);
  if (kcal === undefined || protein === undefined || carbs === undefined || fat === undefined) return null;
  const sodium = num(n.sodium_100g);
  const salt = num(n.salt_100g) ?? (sodium !== undefined ? round(sodium * SALT_PER_SODIUM, 2) : undefined);
  const extra = { fibre: num(n.fiber_100g), sugars: num(n.sugars_100g), saturatedFat: num(n['saturated-fat_100g']), salt };
  return { kcal, protein, carbs, fat, ...Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined)) };
}

/** Open Food Facts' answer for one code. Anything unexpected is "not found", never a product with zeros. */
export function readFoodFacts(json: unknown, code: string): FoodFactsResult {
  if (!json || typeof json !== 'object') return { found: false };
  const body = json as Record<string, unknown>;
  const product = body.product && typeof body.product === 'object' ? (body.product as Record<string, unknown>) : null;
  const ok = body.status === 1 || body.status === 'success' || body.status === 'success_with_warnings';
  if (!product || !ok) return { found: false };
  const name = words(product.product_name) ?? words(product.product_name_en) ?? null;
  const nutriments = product.nutriments && typeof product.nutriments === 'object' ? (product.nutriments as Record<string, unknown>) : {};
  const per100 = per100From(nutriments);
  if (!name || !per100) return { found: true, name, product: null };
  const basis = basisOf(product);
  const servingAmount = num(product.serving_quantity);
  const brand = words(product.brands)?.split(',')[0]?.trim() || undefined;
  return {
    found: true, name,
    product: { code: words(body.code) ?? code, name, ...(brand ? { brand } : {}), basis, per100, ...(servingAmount ? { servingAmount } : {}), portions: portionsFor(basis, servingAmount), source: 'open-food-facts' },
  };
}

/** A label read from a photo, as a product. */
export function labelProduct(label: { name?: string; basis: Basis; per100: Per100; servingAmount?: number }): FoodProduct {
  return { name: label.name?.trim() || 'Food from the label', basis: label.basis, per100: label.per100, ...(label.servingAmount ? { servingAmount: label.servingAmount } : {}), portions: portionsFor(label.basis, label.servingAmount), source: 'label' };
}

/** The figures for an amount of a food, from its figures per 100. Unknown fibre counts as none. */
export function portionNutrition(per100: Per100, amount: number) {
  const k = amount / 100;
  return { grams: amount, kcal: round(per100.kcal * k), protein: round(per100.protein * k), carbs: round(per100.carbs * k), fat: round(per100.fat * k), fibre: round((per100.fibre ?? 0) * k) };
}

/* ───────────────────────── A meal from a photo ───────────────────────── */

/** True when the energy is within `tolerance` (a share) of what its protein, carbohydrate, fat and fibre give. */
export function energyMatches(p: Pick<Per100, 'kcal' | 'protein' | 'carbs' | 'fat' | 'fibre'>, tolerance = 0.25): boolean {
  const built = 4 * p.protein + 4 * p.carbs + 9 * p.fat + 2 * (p.fibre ?? 0);
  return Math.abs(built - p.kcal) <= Math.max(30, tolerance * Math.max(p.kcal, built));
}

export interface ReadItem { name: string; portion?: string; grams?: number; confidence: number; per100g?: Per100 }
export interface MealItemReading { name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number; fibre: number; confidence: number; needsFigures?: true }
/** The amount assumed for an item the photo gave no weight for, so its slider has somewhere to start. */
export const DEFAULT_ITEM_GRAMS = 100;

/** The `food` job's items as diary items, for the person to confirm and adjust. */
export function itemsFromReading(items: readonly ReadItem[]): MealItemReading[] {
  return items.map(item => {
    const grams = isNum(item.grams) && item.grams > 0 ? Math.round(item.grams) : DEFAULT_ITEM_GRAMS;
    if (!item.per100g) return { name: item.name, grams, kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, confidence: item.confidence, needsFigures: true };
    const { grams: _g, ...figures } = portionNutrition(item.per100g, grams);
    return { name: item.name, grams, ...figures, confidence: item.confidence };
  });
}
