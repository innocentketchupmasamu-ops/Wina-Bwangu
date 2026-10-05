from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    tax_rate: float = 0.16
    admin_username: str = "admin"
    admin_password: str = "wina123"
    api_v1_str: str = "/api/v1"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
