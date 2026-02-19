import sys
import json
import re

# Sri Lankan towns for matching
SL_TOWNS = [
    "colombo", "kandy", "galle", "negombo", "batticaloa", "jaffna",
    "trincomalee", "anuradhapura", "ratnapura", "badulla", "matara",
    "kurunegala", "nuwara eliya", "kotte", "dehiwala", "moratuwa",
    "maharagama", "kelaniya", "panadura", "kaduwela", "rajagiriya",
    "nugegoda", "piliyandala", "malabe", "wattala", "kadawatha",
    "homagama", "kottawa", "mount lavinia", "borella", "nawala",
    "thalawathugoda", "battaramulla", "athurugiriya", "kiribathgoda",
    "hokandara", "horana", "avissawella", "kalutara", "beruwala",
    "hikkaduwa", "unawatuna", "mirissa", "tangalle", "hambantota",
    "ella", "bandarawela", "haputale", "sigiriya", "dambulla",
    "polonnaruwa", "matale", "ampara", "puttalam", "chilaw",
    "kilinochchi", "mannar", "mullaitivu", "vavuniya",
    "wellawatte", "bambalapitiya", "kollupitiya", "fort", "pettah",
    "kohuwala", "pepiliyana", "boralesgamuwa"
]

PROPERTY_TYPES = {
    "house": "House",
    "houses": "House",
    "boarding": "Boarding Room",
    "boarding room": "Boarding Room",
    "room": "Boarding Room",
    "rooms": "Boarding Room",
    "annex": "Annex",
    "annexe": "Annex",
    "apartment": "Apartment",
    "apartments": "Apartment",
    "flat": "Apartment",
    "flats": "Apartment",
}

def parse_nlp_query(query):
    """
    Parse a natural language search query into structured filters.
    Examples:
    - "2 bed house in Colombo under 50k"
    - "furnished apartment near Kandy max 30000"
    - "3 bedroom with parking Nugegoda"
    """
    q = query.lower().strip()
    filters = {}

    # Extract bedrooms: "2 bed", "3 bedroom", "2br"
    bed_match = re.search(r'(\d+)\s*(?:bed(?:room)?s?|br)\b', q)
    if bed_match:
        filters['beds'] = int(bed_match.group(1))
        q = q[:bed_match.start()] + q[bed_match.end():]

    # Extract bathrooms: "2 bath", "1 bathroom"
    bath_match = re.search(r'(\d+)\s*(?:bath(?:room)?s?)\b', q)
    if bath_match:
        filters['baths'] = int(bath_match.group(1))
        q = q[:bath_match.start()] + q[bath_match.end():]

    # Extract max price: "under 50k", "max 30000", "below 50,000", "budget 25k"
    price_max = re.search(r'(?:under|below|max(?:imum)?|budget|less than|up to)\s*(?:lkr\s*)?(\d{1,3})(?:,(\d{3}))*\s*(k)?\b', q)
    if price_max:
        price_str = price_max.group(1)
        if price_max.group(2):
            price_str += price_max.group(2)
        price_val = int(price_str)
        if price_max.group(3):
            price_val *= 1000
        filters['maxPrice'] = price_val
        q = q[:price_max.start()] + q[price_max.end():]

    # Extract min price: "above 20k", "min 15000", "from 10k"
    price_min = re.search(r'(?:above|over|min(?:imum)?|from|at least|more than)\s*(?:lkr\s*)?(\d{1,3})(?:,(\d{3}))*\s*(k)?\b', q)
    if price_min:
        price_str = price_min.group(1)
        if price_min.group(2):
            price_str += price_min.group(2)
        price_val = int(price_str)
        if price_min.group(3):
            price_val *= 1000
        filters['minPrice'] = price_val
        q = q[:price_min.start()] + q[price_min.end():]

    # Extract price range: "20k-50k", "20000 to 40000"
    price_range = re.search(r'(\d{1,3})(?:,(\d{3}))?\s*(k)?\s*(?:to|-)\s*(\d{1,3})(?:,(\d{3}))?\s*(k)?', q)
    if price_range and 'maxPrice' not in filters:
        min_str = price_range.group(1)
        if price_range.group(2):
            min_str += price_range.group(2)
        min_val = int(min_str)
        if price_range.group(3):
            min_val *= 1000

        max_str = price_range.group(4)
        if price_range.group(5):
            max_str += price_range.group(5)
        max_val = int(max_str)
        if price_range.group(6):
            max_val *= 1000

        filters['minPrice'] = min_val
        filters['maxPrice'] = max_val
        q = q[:price_range.start()] + q[price_range.end():]

    # Extract property type
    for keyword, ptype in PROPERTY_TYPES.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', q):
            filters['type'] = ptype
            q = re.sub(r'\b' + re.escape(keyword) + r'\b', '', q)
            break

    # Extract furnished status
    if re.search(r'\bfully\s*furnished\b', q):
        filters['furnished'] = 'Furnished'
        q = re.sub(r'\bfully\s*furnished\b', '', q)
    elif re.search(r'\bsemi[- ]?furnished\b', q):
        filters['furnished'] = 'Semi-Furnished'
        q = re.sub(r'\bsemi[- ]?furnished\b', '', q)
    elif re.search(r'\bfurnished\b', q):
        filters['furnished'] = 'Furnished'
        q = re.sub(r'\bfurnished\b', '', q)
    elif re.search(r'\bunfurnished\b', q):
        filters['furnished'] = 'Unfurnished'
        q = re.sub(r'\bunfurnished\b', '', q)

    # Extract amenities
    amenities = {}
    if re.search(r'\b(?:ac|air\s*con(?:dition(?:ed|ing)?)?)\b', q):
        amenities['ac'] = True
        q = re.sub(r'\b(?:ac|air\s*con(?:dition(?:ed|ing)?)?)\b', '', q)
    if re.search(r'\bparking\b', q):
        amenities['parking'] = True
        q = re.sub(r'\bparking\b', '', q)
    if re.search(r'\b(?:wifi|wi-fi|internet)\b', q):
        amenities['wifi'] = True
        q = re.sub(r'\b(?:wifi|wi-fi|internet)\b', '', q)

    if amenities:
        filters['amenities'] = amenities

    # Extract town — match longest town name first
    q_clean = re.sub(r'\b(?:in|near|at|around|close to|nearby)\b', ' ', q)
    q_clean = re.sub(r'\s+', ' ', q_clean).strip()

    sorted_towns = sorted(SL_TOWNS, key=len, reverse=True)
    for town in sorted_towns:
        if town in q_clean:
            filters['town'] = town.title()
            break

    return {
        'original_query': query,
        'parsed_filters': filters,
        'confidence': 'high' if len(filters) >= 2 else 'medium' if len(filters) == 1 else 'low'
    }

if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())
    query = input_data.get('query', '')
    result = parse_nlp_query(query)
    print(json.dumps(result))
