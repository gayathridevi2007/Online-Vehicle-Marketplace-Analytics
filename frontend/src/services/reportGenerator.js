import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateVehicleAnalyticsPdf({
  appliedFilters = {},
  summary = {},
  records = [],
  brands = [],
  fuelTypes = [],
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const generationDate = new Date().toLocaleString()
  const pageMargin = 14

  // 1. Executive Automotive Header Band
  doc.setFillColor(15, 23, 42) // Dark Navy
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(0, 210, 255) // Electric Cyan
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('ONLINE VEHICLE MARKETPLACE ANALYTICS · STAR WAREHOUSE INTELLIGENCE REPORT', pageMargin, 12)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text('Automotive Marketplace Analytics & Fact Lineage', pageMargin, 20)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${generationDate} | Primary Source: star.fact_vehicle_marketplace (17,437 Verified Records)`, pageMargin, 27)

  let cursorY = 38

  // 2. Applied Filter Criteria Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(pageMargin, cursorY, 182, 20, 2, 2, 'FD')

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Active Dimensional Filter Parameters:', pageMargin + 4, cursorY + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(51, 65, 85)

  const filterStrings = []
  if (appliedFilters.state || appliedFilters.location) {
    filterStrings.push(`Location/State: ${appliedFilters.state || appliedFilters.location}`)
  }
  if (appliedFilters.city) filterStrings.push(`City: ${appliedFilters.city}`)
  if (appliedFilters.brand) filterStrings.push(`Brand: ${appliedFilters.brand}`)
  if (appliedFilters.model) filterStrings.push(`Model: ${appliedFilters.model}`)
  if (appliedFilters.fuel_type) filterStrings.push(`Fuel: ${appliedFilters.fuel_type}`)
  if (appliedFilters.transmission) filterStrings.push(`Transmission: ${appliedFilters.transmission}`)
  if (appliedFilters.year) filterStrings.push(`Year: ${appliedFilters.year}`)
  if (appliedFilters.year_from || appliedFilters.year_to) {
    filterStrings.push(`Year Range: ${appliedFilters.year_from || 'Any'} - ${appliedFilters.year_to || 'Any'}`)
  }
  if (appliedFilters.min_price || appliedFilters.max_price) {
    filterStrings.push(`Price Range: ${appliedFilters.min_price || '0'} - ${appliedFilters.max_price || 'Max'}`)
  }

  const filterText = filterStrings.length > 0
    ? filterStrings.join('   |   ')
    : 'None (Global Warehouse Scope · All 17,437 Verified Records Included)'

  doc.text(filterText, pageMargin + 4, cursorY + 13, { maxWidth: 174 })

  cursorY += 26

  // 3. Key Performance Indicators (4 KPI Cards)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Key Performance Metrics (Dimensional Facts)', pageMargin, cursorY)
  cursorY += 4

  const totalMatching = summary?.total_records || records.length || 0
  const kpiData = [
    { label: 'Matching Records', value: Number(totalMatching).toLocaleString() },
    { label: 'With Brand', value: Number(summary?.records_with_brand || 0).toLocaleString() },
    { label: 'With Model', value: Number(summary?.records_with_model || 0).toLocaleString() },
    { label: 'Avg Odometer', value: summary?.avg_odometer_km ? `${Number(summary.avg_odometer_km).toFixed(0)} km` : 'N/A' },
  ]

  const cardWidth = 43
  kpiData.forEach((kpi, index) => {
    const x = pageMargin + index * (cardWidth + 3.3)
    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(x, cursorY, cardWidth, 15, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(kpi.label, x + 3, cursorY + 5)

    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(14, 116, 144) // Teal / Cyan
    doc.text(kpi.value, x + 3, cursorY + 11.5)
  })

  cursorY += 21

  // 4. Graphical Distribution Charts (Vector Horizontal Bar Charts)
  const topBrands = brands.slice(0, 5)
  const topFuels = fuelTypes.slice(0, 4)

  if (topBrands.length > 0 || topFuels.length > 0) {
    const chartBoxY = cursorY
    const halfWidth = 88

    // Left Chart: Brand Volume
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Top Brands Distribution (Volume)', pageMargin, chartBoxY)

    // Right Chart: Fuel Types
    doc.text('Fuel Type Share (Star Fact)', pageMargin + halfWidth + 6, chartBoxY)

    let brandBarY = chartBoxY + 5
    const maxBrandCount = Math.max(...topBrands.map((b) => Number(b.record_count || b.count || 1)), 1)

    topBrands.forEach((b) => {
      const name = String(b.brand || b.label || 'Unknown')
      const count = Number(b.record_count || b.count || 0)
      const ratio = Math.min(1, count / maxBrandCount)
      const barMaxW = 46

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      doc.text(name.slice(0, 14), pageMargin, brandBarY + 3.5)

      // Background Track
      doc.setFillColor(241, 245, 249)
      doc.roundedRect(pageMargin + 26, brandBarY, barMaxW, 4, 1, 1, 'F')

      // Fill Bar (Cyan/Blue)
      doc.setFillColor(14, 165, 233)
      doc.roundedRect(pageMargin + 26, brandBarY, Math.max(2, barMaxW * ratio), 4, 1, 1, 'F')

      // Count Label
      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      doc.text(count.toLocaleString(), pageMargin + 26 + barMaxW + 2, brandBarY + 3.2)

      brandBarY += 5.5
    })

    let fuelBarY = chartBoxY + 5
    const maxFuelCount = Math.max(...topFuels.map((f) => Number(f.record_count || f.count || 1)), 1)

    topFuels.forEach((f) => {
      const name = String(f.fuel_type || f.label || 'Unknown')
      const count = Number(f.record_count || f.count || 0)
      const ratio = Math.min(1, count / maxFuelCount)
      const barMaxW = 46

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      doc.text(name.slice(0, 14), pageMargin + halfWidth + 6, fuelBarY + 3.5)

      // Background Track
      doc.setFillColor(241, 245, 249)
      doc.roundedRect(pageMargin + halfWidth + 30, fuelBarY, barMaxW, 4, 1, 1, 'F')

      // Fill Bar (Teal/Emerald)
      doc.setFillColor(16, 185, 129)
      doc.roundedRect(pageMargin + halfWidth + 30, fuelBarY, Math.max(2, barMaxW * ratio), 4, 1, 1, 'F')

      // Count Label
      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      doc.text(count.toLocaleString(), pageMargin + halfWidth + 30 + barMaxW + 2, fuelBarY + 3.2)

      fuelBarY += 5.5
    })

    cursorY = Math.max(brandBarY, fuelBarY) + 5
  }

  // 5. Sample Verified Vehicle Fact Records Table
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Sample Verified Vehicle Records (Star Schema Fact Lineage)', pageMargin, cursorY)
  cursorY += 3

  const tableRows = (records || []).slice(0, 25).map((rec) => {
    const rawPrice = rec.combined_cars_selling_price_raw
      ?? rec.combined_cars_present_price_raw
      ?? rec.combined_cars2_price_raw
      ?? rec.combined_cars3_selling_price_raw
      ?? '—'
    const priceFormatted = rawPrice !== '—' && Number.isFinite(Number(rawPrice))
      ? Number(rawPrice).toLocaleString()
      : rawPrice

    const odo = rec.odometer_km ? `${Number(rec.odometer_km).toLocaleString()} km` : '—'

    return [
      rec.brand || '—',
      rec.model || rec.full_model_name || '—',
      rec.vehicle_year || '—',
      rec.fuel_type || '—',
      rec.transmission || '—',
      rec.city || '—',
      odo,
      priceFormatted,
      rec.source_file_name || '—',
    ]
  })

  autoTable(doc, {
    startY: cursorY,
    head: [['Brand', 'Model', 'Year', 'Fuel', 'Trans.', 'City', 'Odometer', 'Raw Price', 'Source CSV']],
    body: tableRows.length > 0 ? tableRows : [['No records matching current filters', '', '', '', '', '', '', '', '']],
    theme: 'grid',
    styles: {
      fontSize: 6.8,
      cellPadding: 1.8,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [0, 210, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: pageMargin, right: pageMargin },
  })

  // 6. Running Page Footers
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(
      'Online Vehicle Marketplace Analytics · Academic Star Warehouse · Raw source price scale preserved without currency conversion.',
      pageMargin,
      290,
    )
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' })
  }

  // 7. Save & Download PDF
  const filename = `VMA-Analytics-Report-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
