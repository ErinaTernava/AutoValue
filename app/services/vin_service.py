import requests

def decode_vin(vin: str):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/{vin}?format=json"
    response = requests.get(url)

    data = response.json()["Results"][0]

    return {
        "make": data.get("Make"),
        "model": data.get("Model"),
        "year": data.get("ModelYear"),
        "engine": data.get("EngineCylinders"),
        "fuel": data.get("FuelTypePrimary"),
        "body": data.get("BodyClass")
    }