"""
Market Intelligence — Generates competitive analytics reports from scraped vs local data.

Input (stdin JSON): {
    "scrapedByArea": [{ "town": "...", "count": N, "avgPrice": N, "sources": [...] }],
    "localByArea": [{ "town": "...", "count": N, "avgPrice": N }],
    "scrapedBySource": [{ "source": "...", "count": N, "avgPrice": N }],
    "totalScraped": N,
    "totalLocal": N
}
Output (stdout JSON): {
    "priceComparison": [...],
    "hotAreas": [...],
    "gapOpportunities": [...],
    "supplyAnalysis": {...},
    "summary": "..."
}
"""
import sys
import json

def generate_price_comparison(scraped_areas, local_areas):
    """Compare prices between scraped data and local listings per area."""
    local_map = {a['town'].lower(): a for a in local_areas}
    comparisons = []

    for area in scraped_areas:
        town = area.get('town', '')
        town_lower = town.lower()
        local = local_map.get(town_lower, {})
        
        scraped_avg = area.get('avgPrice', 0)
        local_avg = local.get('avgPrice', 0)
        scraped_count = area.get('count', 0)
        local_count = local.get('count', 0)

        diff_pct = 0
        if local_avg > 0 and scraped_avg > 0:
            diff_pct = round(((scraped_avg - local_avg) / local_avg) * 100, 1)

        insight = ''
        if diff_pct > 10:
            insight = f'Competitor prices are {diff_pct}% higher — your listings are more affordable.'
        elif diff_pct < -10:
            insight = f'Competitor prices are {abs(diff_pct)}% lower — consider reviewing your pricing strategy.'
        else:
            insight = 'Prices are comparable across platforms.'

        comparisons.append({
            'town': town,
            'scrapedAvgPrice': round(scraped_avg),
            'localAvgPrice': round(local_avg),
            'priceDiffPercent': diff_pct,
            'scrapedCount': scraped_count,
            'localCount': local_count,
            'volumeDiffPercent': round(((scraped_count - local_count) / max(local_count, 1)) * 100, 1),
            'insight': insight,
        })

    # Sort by volume difference descending
    comparisons.sort(key=lambda x: abs(x['priceDiffPercent']), reverse=True)
    return comparisons

def detect_hot_areas(scraped_areas):
    """Detect areas with high activity / price spikes."""
    hot = []
    
    if not scraped_areas:
        return hot

    avg_count = sum(a.get('count', 0) for a in scraped_areas) / max(len(scraped_areas), 1)
    avg_price = sum(a.get('avgPrice', 0) for a in scraped_areas) / max(len(scraped_areas), 1)

    for area in scraped_areas:
        count = area.get('count', 0)
        price = area.get('avgPrice', 0)
        reasons = []

        if count > avg_count * 1.5:
            reasons.append(f'Supply spike: {count} listings vs avg {avg_count:.0f}')
        if price > avg_price * 1.3:
            reasons.append(f'High prices: LKR {price:,.0f} vs avg LKR {avg_price:,.0f}')
        if price < avg_price * 0.7 and count > avg_count * 0.8:
            reasons.append(f'Affordable area with good supply')

        if reasons:
            hot.append({
                'town': area.get('town', ''),
                'listingCount': count,
                'avgPrice': round(price),
                'reasons': reasons,
                'heatScore': min(100, int((count / max(avg_count, 1)) * 50 + (price / max(avg_price, 1)) * 50)),
            })

    hot.sort(key=lambda x: x['heatScore'], reverse=True)
    return hot[:10]

def detect_gap_opportunities(scraped_areas, local_areas):
    """Find areas where competitors have listings but we have few/none."""
    local_map = {a['town'].lower(): a.get('count', 0) for a in local_areas}
    gaps = []

    for area in scraped_areas:
        town = area.get('town', '')
        scraped_count = area.get('count', 0)
        local_count = local_map.get(town.lower(), 0)

        if scraped_count >= 5 and local_count < scraped_count * 0.3:
            gap_ratio = scraped_count / max(local_count, 1)
            gaps.append({
                'town': town,
                'competitorListings': scraped_count,
                'ourListings': local_count,
                'gapRatio': round(gap_ratio, 1),
                'opportunity': f'{town} has {scraped_count} competitor listings but only {local_count} on HouseRentLk. This is an expansion opportunity.',
                'priority': 'HIGH' if gap_ratio > 5 else 'MEDIUM',
            })

    gaps.sort(key=lambda x: x['gapRatio'], reverse=True)
    return gaps

def analyze_supply(scraped_by_source, total_scraped, total_local):
    """Analyze supply distribution across sources."""
    source_breakdown = []
    for source in scraped_by_source:
        source_breakdown.append({
            'source': source.get('source', ''),
            'count': source.get('count', 0),
            'avgPrice': round(source.get('avgPrice', 0)),
            'marketShare': round((source.get('count', 0) / max(total_scraped, 1)) * 100, 1),
        })

    return {
        'totalExternal': total_scraped,
        'totalInternal': total_local,
        'externalToInternalRatio': round(total_scraped / max(total_local, 1), 1),
        'sourceBreakdown': source_breakdown,
        'dominantSource': max(source_breakdown, key=lambda x: x['count'])['source'] if source_breakdown else 'N/A',
    }

def generate_summary(comparisons, hot_areas, gaps, supply):
    """Generate a human-readable executive summary."""
    parts = []

    parts.append(f"Market Overview: {supply['totalExternal']} external listings tracked across competitors vs {supply['totalInternal']} on HouseRentLk.")

    if supply['externalToInternalRatio'] > 3:
        parts.append(f"⚠️ Competitors have {supply['externalToInternalRatio']}x more listings — significant growth opportunity.")
    elif supply['externalToInternalRatio'] < 1:
        parts.append(f"✅ HouseRentLk has more listings than tracked competitors.")

    if comparisons:
        higher = [c for c in comparisons if c['priceDiffPercent'] > 10]
        if higher:
            parts.append(f"📊 {len(higher)} areas where competitor prices are 10%+ higher — your platform offers better value.")

    if gaps:
        parts.append(f"📍 {len(gaps)} gap opportunity areas detected where competitors dominate but HouseRentLk has few listings.")

    if hot_areas:
        top = hot_areas[0]
        parts.append(f"🔥 Hottest area: {top['town']} with {top['listingCount']} listings and avg LKR {top['avgPrice']:,.0f}/month.")

    return ' '.join(parts)

def generate_report(data):
    scraped_areas = data.get('scrapedByArea', [])
    local_areas = data.get('localByArea', [])
    scraped_by_source = data.get('scrapedBySource', [])
    total_scraped = data.get('totalScraped', 0)
    total_local = data.get('totalLocal', 0)

    comparisons = generate_price_comparison(scraped_areas, local_areas)
    hot_areas = detect_hot_areas(scraped_areas)
    gaps = detect_gap_opportunities(scraped_areas, local_areas)
    supply = analyze_supply(scraped_by_source, total_scraped, total_local)
    summary = generate_summary(comparisons, hot_areas, gaps, supply)

    return {
        'priceComparison': comparisons,
        'hotAreas': hot_areas,
        'gapOpportunities': gaps,
        'supplyAnalysis': supply,
        'summary': summary,
    }

if __name__ == '__main__':
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        data = json.loads(input_data)
        result = generate_report(data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
