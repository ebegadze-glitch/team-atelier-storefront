import i18n from './index'

/** Localize API presentation values; never change persisted/API filter values or product titles. */
const englishLabels: Record<string, string> = {
  'ტიპი': 'Type', 'მასალა': 'Material',
  'ზომები (ს×ს×ს)': 'Dimensions (W×D×H)',
  'ზომები (სხსხს)': 'Dimensions (W×D×H)',
  'ზომები': 'Dimensions', 'წონა': 'Weight',
  'მაქს. დატვირთვა': 'Max. load', 'აწყობა': 'Assembly',
  'კარკასი': 'Frame', 'ფერი': 'Color', 'გარანტია': 'Warranty',
  'ბრენდი': 'Brand', 'ავეჯის ტიპი': 'Furniture type',
  'ავეჯი': 'Furniture', 'დივანი': 'Sofa', 'სავარძელი': 'Armchair',
  'მაგიდა': 'Table', 'სკამი': 'Chair', 'კარადა': 'Wardrobe',
  'საწოლი': 'Bed', 'თარო': 'Shelf',
  'მინა': 'Glass', 'ხე': 'Wood', 'ლითონი': 'Metal',
  'ქსოვილი': 'Fabric', 'ტექსტილი': 'Textile',
  'ეკო-ტყავი': 'Faux leather', 'მუხა': 'Oak', 'წიფელი': 'Beech',
  'ფოლადის კარკასი': 'Steel frame',
  'მასიური ხე': 'Solid wood',
  'ლამინირებული MDF': 'Laminated MDF',
  'ნაწილობრივ აწყობილი': 'Partially assembled',
  'სრულად აწყობილი': 'Fully assembled',
  'საჭიროებს აწყობას': 'Assembly required',
  'საჭიროა აწყობა': 'Assembly required',
  'საჭიროა': 'Assembly required',
  'არ საჭიროებს': 'No assembly required',
  'არ საჭიროებს აწყობას': 'No assembly required',
  'აწყობილია': 'Assembled',
  'ნატურალური': 'Natural', 'თეთრი': 'White', 'შავი': 'Black',
  'ნაცრისფერი': 'Grey', 'ყავისფერი': 'Brown', 'ლურჯი': 'Blue',
  'მწვანე': 'Green', 'წითელი': 'Red', 'ბეჟი': 'Beige',
}

const englishUnits: Record<string, string> = {
  'სმ': 'cm', 'კგ': 'kg', 'თვე': 'months', 'ცალი': 'pcs',
}

export function localizedProductField(value: string | number | boolean): string {
  if (typeof value === 'boolean') return i18n.language === 'en'
    ? (value ? 'Yes' : 'No') : (value ? 'დიახ' : 'არა')

  const text = String(value)
  if (!i18n.language.startsWith('en')) return text

  const original = text.trim()
  if (englishLabels[original]) return englishLabels[original]

  const numberAndUnit = original.match(/^([\d.,×xX\s]+)\s*(სმ|კგ|თვე|ცალი)$/)
  if (numberAndUnit) {
    return `${numberAndUnit[1].trim()} ${englishUnits[numberAndUnit[2]]}`
  }
  return text
}

/** Translate recurring server-generated product description patterns.
 * Product names are never translated; unknown/free-form content is left unchanged.
 */
export function localizedProductDescription(description: string): string {
  if (!i18n.language.startsWith('en')) return description

  let result = description
  // Recognized labels and categorical values, longest first to avoid partial matches.
  for (const [georgian, english] of Object.entries(englishLabels).sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(georgian, english)
  }

  result = result
    .replace(/\b(\d+)\s*სმ\b/g, '$1 cm')
    .replace(/\b(\d+)[-–]თვიანი გარანტია/g, '$1-month warranty')
    .replace(/\b(\d+)\s*თვე/g, '$1 months')
    .replace(/მოყვება\s+(\d+)[-–]month warranty/gi, 'Includes a $1-month warranty')
    .replace(/მოყვება\s+(\d+)[-–]თვიანი გარანტია/g, 'Includes a $1-month warranty')
    .replace(/ორიგინალი პროდუქცია ოფიციალური იმპორტიორისგან\.?/g, 'Genuine product from an authorized importer.')
    .replace(/დაბრუნების შესაძლებლობა\s+(\d+)\s+დღის განმავლობაში\.?/g, 'Returns available within $1 days.')
    .replace(/ავეჯი,\s*/g, 'Furniture by ')
    .replace(/ზომები\s*\(W×D×H\)/g, 'Dimensions (W×D×H)')
    .replace(/ზომები\s*\(სხსხს\)/g, 'Dimensions (W×D×H)')
    .replace(/\s+\./g, '.')

  return result
}

/** Translate visible filter/category labels without mutating API query parameters. */
export function localizedCatalogText(value: string): string {
  if (!i18n.language.startsWith('en')) return value
  const original = value.trim()
  if (original === 'ავეჯი მისაღებისთვის, საძინებლისა და ოფისისთვის.') {
    return 'Furniture for living rooms, bedrooms and offices.'
  }
  return englishLabels[original] ?? value
}
