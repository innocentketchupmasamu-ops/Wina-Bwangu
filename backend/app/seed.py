from sqlalchemy import select
from app.database.connection import AsyncSessionLocal
from app.models import Booth, Service, booth_services


async def init_db():
    # The database is managed by database/schema.sql and the supplied seed SQL.
    # Do not drop or recreate tables on every API restart.
    async with AsyncSessionLocal() as session:
        booth = await session.scalar(select(Booth).limit(1))
        service = await session.scalar(select(Service).limit(1))
        if booth and service:
            return
        raise RuntimeError(
            "Database is not initialized. Run database/schema.sql, "
            "database/seed_reference_data.sql and database/seed_transactions.sql first."
        )
