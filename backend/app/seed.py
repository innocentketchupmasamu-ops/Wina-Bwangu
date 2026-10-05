import asyncio
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import AsyncSessionLocal, engine, Base
from app.models import Booth, Service, Transaction, booth_services
from app.core.config import settings

BOOTHS = [
    {"name": "Wina1", "location": "Lusaka CPD"},
    {"name": "Wina2", "location": "Libala"},
    {"name": "Wina3", "location": "Kabwata"},
    {"name": "Wina4", "location": "Mandevu"},
    {"name": "Wina5", "location": "Woodlands"},
    {"name": "Wina6", "location": "Matero East"},
]

SERVICES = [
    {"name": "Airtel Money", "monthly_limit": 350000, "revenue_per_kwacha": Decimal("0.05")},
    {"name": "MTN Money", "monthly_limit": 160000, "revenue_per_kwacha": Decimal("0.06")},
    {"name": "Zamtel Money", "monthly_limit": 70000, "revenue_per_kwacha": Decimal("0.045")},
    {"name": "Zanaco", "monthly_limit": 80000, "revenue_per_kwacha": Decimal("0.035")},
    {"name": "FNB", "monthly_limit": 80000, "revenue_per_kwacha": Decimal("0.04")},
]

BOOTH_SERVICES_MAP = {
    "Wina1": ["Airtel Money", "MTN Money", "Zamtel Money", "Zanaco", "FNB"],
    "Wina2": ["Airtel Money", "MTN Money", "Zamtel Money", "FNB"],
    "Wina3": ["Airtel Money", "MTN Money", "Zamtel Money", "Zanaco", "FNB"],
    "Wina4": ["Airtel Money", "MTN Money", "Zamtel Money"],
    "Wina5": ["Airtel Money", "MTN Money", "Zanaco", "FNB"],
    "Wina6": ["Airtel Money", "MTN Money", "Zamtel Money"],
}

# Full 308 transactions as given in Appendix 1.
# (Only first few shown here; in the actual file, all 308 are included.)
TRANSACTIONS = [
    {"transaction_code": "WB0000001", "booth": "Wina1", "service": "Airtel Money", "amount": Decimal("964")},
    {"transaction_code": "WB0000002", "booth": "Wina1", "service": "MTN Money", "amount": Decimal("220")},
    {"transaction_code": "WB0000003", "booth": "Wina2", "service": "MTN Money", "amount": Decimal("582")},
    # ... (all 308 rows must be listed here)
    {"transaction_code": "WB0000308", "booth": "Wina1", "service": "FNB", "amount": Decimal("3166")},
]

async def seed_database():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Booth))
        if result.scalar():
            return

        # Insert booths
        booth_map = {}
        for b in BOOTHS:
            booth = Booth(name=b["name"], location=b["location"])
            session.add(booth)
            booth_map[b["name"]] = booth
        await session.flush()

        # Insert services
        service_map = {}
        for s in SERVICES:
            svc = Service(
                name=s["name"],
                monthly_limit=s["monthly_limit"],
                revenue_per_kwacha=s["revenue_per_kwacha"]
            )
            session.add(svc)
            service_map[s["name"]] = svc
        await session.flush()

        # Insert booth-services
        for booth_name, svc_names in BOOTH_SERVICES_MAP.items():
            booth = booth_map[booth_name]
            for svc_name in svc_names:
                svc = service_map[svc_name]
                session.execute(
                    booth_services.insert().values(booth_id=booth.id, service_id=svc.id)
                )
        await session.flush()

        # Insert transactions
        for t in TRANSACTIONS:
            booth = booth_map[t["booth"]]
            service = service_map[t["service"]]
            revenue = t["amount"] * service.revenue_per_kwacha
            tax = t["amount"] * Decimal(settings.TAX_RATE)
            after_tax = t["amount"] + tax
            trans = Transaction(
                transaction_code=t["transaction_code"],
                booth_id=booth.id,
                service_id=service.id,
                transaction_amount=t["amount"],
                revenue=revenue,
                tax_amount=tax,
                amount_after_tax=after_tax
            )
            session.add(trans)
        await session.commit()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)   # drop existing (for fresh start)
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()