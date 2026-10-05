from pydantic import BaseModel

class BoothBase(BaseModel):
    name: str
    location: str

class BoothOut(BoothBase):
    id: int