import sys
import json

# Sri Lankan town safety baseline data (curated estimates)
# Scale: 0-100 where 100 is safest
TOWN_SAFETY_BASELINES = {
    "colombo": 60, "colombo 7": 80, "colombo 3": 75, "colombo 5": 75,
    "rajagiriya": 78, "nugegoda": 72, "maharagama": 68,
    "dehiwala": 65, "mount lavinia": 70, "moratuwa": 62,
    "piliyandala": 70, "malabe": 74, "kaduwela": 72,
    "kottawa": 75, "thalawathugoda": 80, "battaramulla": 78,
    "nawala": 76, "borella": 62, "wellawatte": 58,
    "bambalapitiya": 65, "kollupitiya": 72, "kohuwala": 74,
    "pepiliyana": 73, "boralesgamuwa": 72,
    "kandy": 68, "galle": 72, "negombo": 60,
    "nuwara eliya": 82, "ella": 85, "bandarawela": 80,
    "matara": 65, "jaffna": 58, "trincomalee": 60,
    "anuradhapura": 70, "kurunegala": 68,
    "panadura": 64, "kalutara": 66,
    "wattala": 62, "kadawatha": 70, "kiribathgoda": 66,
    "kelaniya": 64, "homagama": 72,
    "fort": 55, "pettah": 50, "athurugiriya": 73,
    "hokandara": 76, "horana": 70,
}

def calculate_safety_score(town, review_data):
    """
    Calculate neighborhood safety score from:
    1. Baseline town data
    2. Review sentiment about safety
    3. Community feedback
    """
    town_lower = town.lower().strip() if town else ''

    # Get baseline
    baseline = TOWN_SAFETY_BASELINES.get(town_lower, 65)  # default 65

    # Analyze reviews for safety-related keywords
    safety_positive = [
        'safe', 'secure', 'quiet', 'peaceful', 'calm', 'family',
        'guard', 'cctv', 'gated', 'well-lit', 'friendly', 'clean'
    ]
    safety_negative = [
        'unsafe', 'dangerous', 'sketchy', 'noisy', 'loud', 'theft',
        'robbery', 'crime', 'harassment', 'stray dogs', 'flooding',
        'dirty', 'pollution', 'dark streets', 'scary'
    ]

    positive_count = 0
    negative_count = 0
    review_comments = review_data.get('reviews', [])

    for review in review_comments:
        comment = review.get('comment', '').lower()
        for word in safety_positive:
            if word in comment:
                positive_count += 1
        for word in safety_negative:
            if word in comment:
                negative_count += 1

    # Adjust baseline with review sentiment
    review_adjustment = 0
    if positive_count + negative_count > 0:
        sentiment_ratio = positive_count / (positive_count + negative_count)
        review_adjustment = (sentiment_ratio - 0.5) * 20  # -10 to +10

    final_score = max(0, min(100, baseline + review_adjustment))

    # Generate category breakdown
    categories = []

    # Night safety
    night_score = final_score - 10 if final_score > 50 else final_score - 5
    categories.append({
        'name': 'Night Safety',
        'score': max(0, min(100, round(night_score))),
        'icon': '🌙'
    })

    # Public transport
    transport_score = final_score + 5 if town_lower in ['colombo', 'kandy', 'galle', 'nugegoda', 'maharagama'] else final_score - 5
    categories.append({
        'name': 'Transport Access',
        'score': max(0, min(100, round(transport_score))),
        'icon': '🚌'
    })

    # Family friendliness
    family_score = final_score + 8 if final_score > 70 else final_score
    categories.append({
        'name': 'Family Friendly',
        'score': max(0, min(100, round(family_score))),
        'icon': '👨‍👩‍👧'
    })

    # Walkability
    walk_score = final_score + 3
    categories.append({
        'name': 'Walkability',
        'score': max(0, min(100, round(walk_score))),
        'icon': '🚶'
    })

    # Determine label
    if final_score >= 80:
        label = 'Very Safe'
        color = 'green'
    elif final_score >= 65:
        label = 'Safe'
        color = 'blue'
    elif final_score >= 50:
        label = 'Moderate'
        color = 'yellow'
    else:
        label = 'Exercise Caution'
        color = 'orange'

    return {
        'overallScore': round(final_score),
        'label': label,
        'color': color,
        'categories': categories,
        'basedOn': {
            'town': town,
            'reviewsAnalyzed': len(review_comments),
            'positiveSignals': positive_count,
            'negativeSignals': negative_count
        }
    }

if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())
    town = input_data.get('town', '')
    review_data = input_data.get('reviewData', {})
    result = calculate_safety_score(town, review_data)
    print(json.dumps(result))
