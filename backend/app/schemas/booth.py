from pydantic import BaseModel, ConfigDict


class BoothBase(BaseModel):
    name: str
    location: str


class BoothOut(BoothBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
