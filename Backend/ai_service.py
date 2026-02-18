import sys
import json
import random

def generate_town_vibe(town):
    """
    Generates a vibe description for a town based on a simple knowledge base.
    In a real scenario, this would potentially call an LLM.
    """
    town = town.lower()
    
    # Add script directory to path to find knowledge_base
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(script_dir)
    
    from knowledge_base import knowledge_base
    
    # Check for exact match or partial match
    matched_town = None
    for key in knowledge_base:
        if key in town:
            matched_town = key
            break
            
    if matched_town is not None:
        vibe = " ".join(knowledge_base[matched_town])
    else:
        # Generic fallback
        town_cap = town.title()
        vibe = f"{town_cap} is a growing town with improving infrastructure and community facilities. It offers a developing residential environment suitable for families. The area is seeing new commercial establishments, making daily life more convenient."
        
    return vibe

def generate_description(data):
    """
    Generates a property description based on provided data.
    """
    title = data.get('title', 'Property')
    p_type = data.get('type', 'Property')
    beds = data.get('beds', 0)
    baths = data.get('baths', 0)
    price = data.get('price', 0)
    amenities = data.get('amenities', [])
    location = data.get('location', {}).get('town', 'Sri Lanka')
    
    # Templates for introduction
    intros = [
        f"Discover this amazing {beds}-bedroom {p_type.lower()} located in the heart of {location}.",
        f"Welcome to your new home! A stunning {p_type.lower()} in {location} offering comfort and style.",
        f"Experience convenient living in this {beds}-bedroom {p_type.lower()} situated in {location}."
    ]
    
    # Templates for features
    features = [
        f"This property features {baths} bathrooms and covers a spacious area.",
        f"With {baths} well-appointed bathrooms, this home is designed for family living.",
        f"The unit includes {baths} washrooms and ample living space."
    ]
    
    # Templates for amenities
    amenity_text = ""
    if amenities:
        amenity_list = ", ".join(amenities[:3])
        amenity_text = f"Key amenities include {amenity_list} and more."
    else:
        amenity_text = "The property comes with all essential facilities."
        
    # Templates for conclusion
    conclusions = [
        f"Priced at LKR {price:,}/month, this is a deal you don't want to miss!",
        f"Available now for just LKR {price:,} per month. Contact us today!",
        f"Rent this beautiful space for LKR {price:,}/month. Schedule a viewing now."
    ]
    
    description = f"{random.choice(intros)} {random.choice(features)} {amenity_text} {random.choice(conclusions)}"
    
    return description

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            # Fallback for testing/manual run without input
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        
        town = data.get('location', {}).get('town', '')
        
        result = {
            "description": generate_description(data),
            "townVibe": generate_town_vibe(town)
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
