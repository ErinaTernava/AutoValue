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