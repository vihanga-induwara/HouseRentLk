import sys
import json

def calculate_affordability(income, expenses, town=""):
    is_colombo = town and "colombo" in town.lower()
    
    rec_ratio = 0.35 if is_colombo else 0.30
    max_ratio = 0.45 if is_colombo else 0.40
    
    recommended_rent = income * rec_ratio
    max_safe_rent = income * max_ratio
    
    remaining = income - expenses - recommended_rent
    
    return {
        "recommendedRent": round(recommended_rent),
        "maxSafeLimit": round(max_safe_rent),
        "remainingAfterExpenses": round(remaining),
        "recommendedRatio": round(rec_ratio * 100),
        "maxSafeRatio": round(max_ratio * 100),
        "status": "Healthy" if remaining > 0 else "Tight"
    }

def calculate_rent_vs_buy(monthly_rent, property_value):
    # Simplified logic for Sri Lankan context
    # Assume 14.5% interest rate for housing loans (from legacy tool)
    interest_rate = 0.145
    years = 20
    loan_amount = property_value * 0.8 # 80% LTV
    
    r = interest_rate / 12
    n = years * 12
    emi = (loan_amount * r * (1 + r)**n) / ((1 + r)**n - 1)
    
    total_rent_10yr = monthly_rent * 12 * 10
    total_buy_10yr = emi * 12 * 10
    
    return {
        "monthlyRent": round(monthly_rent),
        "monthlyMortgage": round(emi),
        "rentTotal10Yr": round(total_rent_10yr),
        "buyTotal10Yr": round(total_buy_10yr),
        "recommendation": "Rent" if monthly_rent < emi * 0.7 else "Buy"
    }

def calculate_deposit(monthly_rent, advance_months):
    refundable_deposit = monthly_rent * 1 # Usually 1 month
    advance_payment = monthly_rent * advance_months
    moving_estimate = 25000 # Average LKR estimate
    
    total = refundable_deposit + advance_payment + moving_estimate
    
    return {
        "monthlyRent": monthly_rent,
        "advancePayment": round(advance_payment),
        "refundableDeposit": round(refundable_deposit),
        "movingEstimate": moving_estimate,
        "totalInitialCost": round(total)
    }

def estimate_utilities(town, property_type):
    # Very rough estimates for SL
    base_costs = {
        "Apartment": {"electricity": 12000, "water": 1500},
        "House": {"electricity": 8000, "water": 1000},
        "Annex": {"electricity": 4000, "water": 500}
    }
    
    # Adjust for Colombo
    multiplier = 1.2 if town.lower() == "colombo" else 1.0
    
    costs = base_costs.get(property_type, base_costs["House"])
    
    return {
        "electricity": round(costs["electricity"] * multiplier),
        "water": round(costs["water"] * multiplier),
        "total": round((costs["electricity"] + costs["water"]) * multiplier)
    }

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)

        data = json.loads(input_data)
        action = data.get("action")
        
        result = {}
        if action == "affordability":
            result = calculate_affordability(data.get("income", 0), data.get("expenses", 0), data.get("town", ""))
        elif action == "rent_vs_buy":
            result = calculate_rent_vs_buy(data.get("rent", 0), data.get("value", 0))
        elif action == "deposit":
            result = calculate_deposit(data.get("rent", 0), data.get("months", 4))
        elif action == "utilities":
            result = estimate_utilities(data.get("town", ""), data.get("type", "House"))
        else:
            result = {"error": "Invalid action"}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
