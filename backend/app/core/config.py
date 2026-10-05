from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    tax_rate: float = 0.16
    api_v1_str: str = "/api/v1"

    class Config:
        env_file = ".env"


settings = Settings()