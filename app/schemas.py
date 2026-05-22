from pydantic import BaseModel

class CarInput(BaseModel):
    brand: str
    model: str
    year: int
    mileage: float
    fuelType: str
    transmission: str
    engineSize: float
    mpg: float

class PriceOutput(BaseModel):
    low_price_eur: float
    fair_price_eur: float
    high_price_eur: float
    summary_eur: str

class EvaluateInput(BaseModel):
    brand: str
    model: str
    year: int
    mileage: float
    fuelType: str
    transmission: str
    engineSize: float
    mpg: float
    asked_price: float

class EvaluateOutput(BaseModel):
    low_price_eur: float
    fair_price_eur: float
    high_price_eur: float
    asked_price_eur: float
    verdict: str          # "Great Deal" / "Fair" / "Overpriced" / "Way Overpriced"
    verdict_color: str    # "green" / "blue" / "orange" / "red"
    summary_eur: str
    savings_eur: float   