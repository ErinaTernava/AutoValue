from pydantic import BaseModel
from typing import Optional, Dict

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
    verdict: str
    verdict_color: str
    summary_eur: str
    savings_eur: float


class CarBasicInfo(BaseModel):
    brand: str
    model: str
    year: int
    mileage: float
    fuelType: str
    transmission: str
    engineSize: float
    mpg: float
    price: Optional[float] = None

class CompareWeights(BaseModel):
    performance: float = 33
    value: float = 33
    efficiency: float = 34
    modernity: float = 0
    practicality: float = 0

class CompareInput(BaseModel):
    car1: CarBasicInfo
    car2: CarBasicInfo
    weights: Optional[CompareWeights] = None

class CarCompareOutput(BaseModel):
    brand: str
    model: str
    year: int
    mileage: float
    engineSize: float
    mpg: float
    fuelType: str
    transmission: str
    fair_price_eur: float
    scores: Dict[str, float]
    total_score: float

class CompareOutput(BaseModel):
    car1: CarCompareOutput
    car2: CarCompareOutput
    winner: int  
    recommendation: str