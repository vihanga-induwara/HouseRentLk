from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from typing import Optional

# Import local AI scripts to demonstrate inference capability
from budget_planner import calculate_affordability, calculate_rent_vs_buy, calculate_deposit, estimate_utilities

app = FastAPI(
    title="HouseRentLk AI Inference Server",
    description="A centralized microservice for running Data Science and AI models efficiently in memory.",
    version="1.0.0"
)

# Health Check
@app.get("/health")
def read_health():
    return {"status": "ok", "message": "Inference server is running."}

# Define models
class BudgetPlanRequest(BaseModel):
    action: str
    income: Optional[float] = 0.0
    expenses: Optional[float] = 0.0
    town: Optional[str] = ""
    rent: Optional[float] = 0.0
    value: Optional[float] = 0.0
    months: Optional[int] = 4
    type: Optional[str] = "House"

@app.post("/api/v1/budget-plan")
def budget_plan(req: BudgetPlanRequest):
    """
    Demonstrates migrating the budget_planner into an active web server
    rather than spawning processes per request.
    """
    try:
        if req.action == "affordability":
            return calculate_affordability(req.income, req.expenses, req.town)
        elif req.action == "rent_vs_buy":
            return calculate_rent_vs_buy(req.rent, req.value)
        elif req.action == "deposit":
            return calculate_deposit(req.rent, req.months)
        elif req.action == "utilities":
            return estimate_utilities(req.town, req.type)
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting FastAPI Inference Server on port 8000...")
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
