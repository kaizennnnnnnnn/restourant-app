from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── Pydantic Models ─────────────────────────────────────────────────

class AddOn(BaseModel):
    name: str
    price: float

class MenuItemOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    image_url: str = ""
    add_ons: List[AddOn] = []
    is_popular: bool = False
    prep_time_minutes: int = 15
    available: bool = True

class OrderItemIn(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int
    add_ons: List[AddOn] = []
    special_instructions: str = ""

class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    customer_name: str
    customer_phone: str
    customer_address: str = ""
    order_type: str = "delivery"
    subtotal: float
    total: float

class OrderOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    items: List[OrderItemIn]
    customer_name: str
    customer_phone: str
    customer_address: str = ""
    order_type: str = "delivery"
    subtotal: float
    total: float
    status: str = "new"
    created_at: str = ""
    updated_at: str = ""
    estimated_prep_time: int = 0
    order_number: int = 0

class AdminLogin(BaseModel):
    username: str
    password: str

class OrderStatusUpdate(BaseModel):
    status: str
    estimated_prep_time: Optional[int] = None

class SettingsOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    restaurant_name: str = "Bella Cucina"
    is_open: bool = True
    default_prep_time: int = 20
    phone: str = "+1 (555) 123-4567"
    address: str = "123 Main Street, Downtown"
    tagline: str = "Authentic flavors, crafted with love"

class SettingsUpdate(BaseModel):
    is_open: Optional[bool] = None
    default_prep_time: Optional[int] = None
    restaurant_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tagline: Optional[str] = None

# ─── Auth Helpers ─────────────────────────────────────────────────────

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_next_order_number():
    result = await db.counters.find_one_and_update(
        {"name": "order_number"},
        {"$inc": {"value": 1}},
        return_document=True,
        upsert=True,
    )
    return result["value"]


# ─── Seed Endpoint ────────────────────────────────────────────────────

@api_router.post("/seed")
async def seed_data():
    existing = await db.menu_items.find_one({}, {"_id": 0})
    if existing:
        return {"message": "Already seeded"}

    menu_items = [
        # Pizza
        {"id": str(uuid.uuid4()), "name": "Margherita Classic", "description": "Fresh mozzarella, San Marzano tomatoes, basil on a crispy thin crust", "price": 14.99, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", "add_ons": [{"name": "Extra Cheese", "price": 2.00}, {"name": "Mushrooms", "price": 1.50}, {"name": "Jalapenos", "price": 1.00}], "is_popular": True, "prep_time_minutes": 18, "available": True},
        {"id": str(uuid.uuid4()), "name": "Pepperoni Supreme", "description": "Double pepperoni, mozzarella blend, and our signature tomato sauce", "price": 16.99, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", "add_ons": [{"name": "Extra Cheese", "price": 2.00}, {"name": "Hot Honey", "price": 1.50}, {"name": "Extra Pepperoni", "price": 2.50}], "is_popular": True, "prep_time_minutes": 20, "available": True},
        {"id": str(uuid.uuid4()), "name": "BBQ Chicken", "description": "Grilled chicken, red onions, BBQ sauce, cilantro, smoked gouda", "price": 17.99, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", "add_ons": [{"name": "Extra Chicken", "price": 3.00}, {"name": "Pineapple", "price": 1.50}], "is_popular": False, "prep_time_minutes": 22, "available": True},
        {"id": str(uuid.uuid4()), "name": "Truffle Mushroom", "description": "Wild mushroom medley, truffle oil, fontina cheese, fresh thyme", "price": 19.99, "category": "Pizza", "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", "add_ons": [{"name": "Extra Truffle Oil", "price": 2.50}, {"name": "Arugula", "price": 1.00}], "is_popular": False, "prep_time_minutes": 20, "available": True},
        # Burgers
        {"id": str(uuid.uuid4()), "name": "Classic Smash Burger", "description": "Double smashed patty, American cheese, pickles, special sauce", "price": 13.99, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", "add_ons": [{"name": "Bacon", "price": 2.00}, {"name": "Extra Patty", "price": 4.00}, {"name": "Fried Egg", "price": 1.50}], "is_popular": True, "prep_time_minutes": 15, "available": True},
        {"id": str(uuid.uuid4()), "name": "Spicy Jalapeno Burger", "description": "Angus beef, pepper jack, crispy jalapenos, chipotle mayo", "price": 15.99, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80", "add_ons": [{"name": "Bacon", "price": 2.00}, {"name": "Avocado", "price": 2.50}], "is_popular": False, "prep_time_minutes": 15, "available": True},
        {"id": str(uuid.uuid4()), "name": "Mushroom Swiss Burger", "description": "Sauteed mushrooms, Swiss cheese, garlic aioli, brioche bun", "price": 14.99, "category": "Burgers", "image_url": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80", "add_ons": [{"name": "Extra Mushrooms", "price": 1.50}, {"name": "Truffle Mayo", "price": 1.50}], "is_popular": False, "prep_time_minutes": 15, "available": True},
        # Sides
        {"id": str(uuid.uuid4()), "name": "Loaded Fries", "description": "Crispy fries with cheese sauce, bacon bits, and green onions", "price": 8.99, "category": "Sides", "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", "add_ons": [{"name": "Extra Cheese Sauce", "price": 1.50}, {"name": "Sour Cream", "price": 0.75}], "is_popular": True, "prep_time_minutes": 10, "available": True},
        {"id": str(uuid.uuid4()), "name": "Caesar Salad", "description": "Romaine, parmesan, croutons, house-made Caesar dressing", "price": 9.99, "category": "Sides", "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80", "add_ons": [{"name": "Grilled Chicken", "price": 3.00}], "is_popular": False, "prep_time_minutes": 8, "available": True},
        {"id": str(uuid.uuid4()), "name": "Garlic Bread", "description": "Freshly baked with garlic butter, herbs, and melted mozzarella", "price": 6.99, "category": "Sides", "image_url": "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&q=80", "add_ons": [{"name": "Extra Cheese", "price": 1.50}], "is_popular": False, "prep_time_minutes": 8, "available": True},
        # Drinks
        {"id": str(uuid.uuid4()), "name": "Fresh Lemonade", "description": "House-squeezed with a hint of mint and raw honey", "price": 4.99, "category": "Drinks", "image_url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80", "add_ons": [{"name": "Ginger Shot", "price": 0.75}], "is_popular": False, "prep_time_minutes": 3, "available": True},
        {"id": str(uuid.uuid4()), "name": "Iced Coffee", "description": "Cold brewed for 24 hours, served over ice with cream", "price": 5.49, "category": "Drinks", "image_url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", "add_ons": [{"name": "Extra Shot", "price": 1.00}, {"name": "Vanilla Syrup", "price": 0.50}], "is_popular": True, "prep_time_minutes": 3, "available": True},
        {"id": str(uuid.uuid4()), "name": "Mango Smoothie", "description": "Fresh mango, yogurt, and a touch of honey blended smooth", "price": 6.99, "category": "Drinks", "image_url": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80", "add_ons": [{"name": "Protein Boost", "price": 1.50}], "is_popular": False, "prep_time_minutes": 5, "available": True},
        {"id": str(uuid.uuid4()), "name": "Sparkling Water", "description": "Imported Italian sparkling mineral water, 750ml", "price": 3.99, "category": "Drinks", "image_url": "https://images.unsplash.com/photo-1560023907-5f339617ea55?w=400&q=80", "add_ons": [], "is_popular": False, "prep_time_minutes": 1, "available": True},
        # Desserts
        {"id": str(uuid.uuid4()), "name": "Tiramisu", "description": "Classic Italian espresso-soaked ladyfingers and mascarpone cream", "price": 8.99, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", "add_ons": [{"name": "Extra Cocoa", "price": 0.50}], "is_popular": True, "prep_time_minutes": 5, "available": True},
        {"id": str(uuid.uuid4()), "name": "Chocolate Lava Cake", "description": "Warm dark chocolate center served with vanilla gelato", "price": 9.99, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80", "add_ons": [{"name": "Extra Gelato", "price": 2.00}], "is_popular": False, "prep_time_minutes": 12, "available": True},
        {"id": str(uuid.uuid4()), "name": "New York Cheesecake", "description": "Creamy cheesecake with graham crust and mixed berry compote", "price": 7.99, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80", "add_ons": [{"name": "Berry Compote", "price": 1.00}, {"name": "Whipped Cream", "price": 0.75}], "is_popular": False, "prep_time_minutes": 5, "available": True},
    ]

    await db.menu_items.insert_many(menu_items)

    hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    await db.admin_users.insert_one({
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    await db.restaurant_settings.insert_one({
        "restaurant_name": "Bella Cucina",
        "is_open": True,
        "default_prep_time": 20,
        "phone": "+1 (555) 123-4567",
        "address": "123 Main Street, Downtown",
        "tagline": "Authentic flavors, crafted with love",
    })

    await db.counters.insert_one({"name": "order_number", "value": 1000})

    return {"message": "Seeded successfully"}


# ─── Public Endpoints ─────────────────────────────────────────────────

@api_router.get("/menu")
async def get_menu():
    items = await db.menu_items.find({"available": True}, {"_id": 0}).to_list(100)
    categories = sorted(set(item["category"] for item in items))
    return {"items": items, "categories": categories}


@api_router.get("/restaurant/settings")
async def get_settings():
    doc = await db.restaurant_settings.find_one({}, {"_id": 0})
    if not doc:
        return SettingsOut().model_dump()
    return doc


@api_router.post("/orders")
async def create_order(order: OrderCreate):
    # Validate
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    if not order.customer_name.strip():
        raise HTTPException(status_code=400, detail="Customer name is required")
    if not order.customer_phone.strip():
        raise HTTPException(status_code=400, detail="Phone number is required")

    # Check restaurant is open
    settings = await db.restaurant_settings.find_one({}, {"_id": 0})
    if settings and not settings.get("is_open", True):
        raise HTTPException(status_code=400, detail="Restaurant is currently closed")

    order_number = await get_next_order_number()
    default_prep = settings.get("default_prep_time", 20) if settings else 20

    now = datetime.now(timezone.utc).isoformat()
    order_doc = {
        "id": str(uuid.uuid4()),
        "order_number": order_number,
        "items": [item.model_dump() for item in order.items],
        "customer_name": order.customer_name.strip(),
        "customer_phone": order.customer_phone.strip(),
        "customer_address": order.customer_address.strip(),
        "order_type": order.order_type,
        "subtotal": order.subtotal,
        "total": order.total,
        "status": "new",
        "created_at": now,
        "updated_at": now,
        "estimated_prep_time": default_prep,
    }

    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return doc


# ─── Admin Endpoints ──────────────────────────────────────────────────

@api_router.post("/admin/login")
async def admin_login(body: AdminLogin):
    user = await db.admin_users.find_one({"username": body.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["username"])
    return {"token": token, "username": user["username"]}


@api_router.get("/admin/orders")
async def get_admin_orders(
    status: Optional[str] = None,
    admin: str = Depends(verify_admin),
):
    query = {}
    if status and status != "all":
        query["status"] = status
    orders = (
        await db.orders.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return {"orders": orders}


@api_router.patch("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    admin: str = Depends(verify_admin),
):
    valid_statuses = ["new", "accepted", "preparing", "ready", "completed", "rejected"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    update = {
        "status": body.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if body.estimated_prep_time is not None:
        update["estimated_prep_time"] = body.estimated_prep_time

    result = await db.orders.update_one({"id": order_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return doc


@api_router.get("/admin/stats")
async def get_admin_stats(admin: str = Depends(verify_admin)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    pipeline = [
        {"$match": {"created_at": {"$gte": today_start}}},
        {
            "$group": {
                "_id": None,
                "total_orders": {"$sum": 1},
                "total_revenue": {"$sum": "$total"},
                "avg_order_value": {"$avg": "$total"},
            }
        },
    ]
    result = await db.orders.aggregate(pipeline).to_list(1)

    stats = result[0] if result else {"total_orders": 0, "total_revenue": 0, "avg_order_value": 0}
    stats.pop("_id", None)

    # Count by status
    status_pipeline = [
        {"$match": {"created_at": {"$gte": today_start}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    status_results = await db.orders.aggregate(status_pipeline).to_list(10)
    status_counts = {r["_id"]: r["count"] for r in status_results}

    stats["by_status"] = status_counts
    stats["pending_orders"] = status_counts.get("new", 0) + status_counts.get("accepted", 0) + status_counts.get("preparing", 0)
    return stats


@api_router.patch("/admin/settings")
async def update_settings(body: SettingsUpdate, admin: str = Depends(verify_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.restaurant_settings.update_one({}, {"$set": update}, upsert=True)
    doc = await db.restaurant_settings.find_one({}, {"_id": 0})
    return doc


# ─── Health ───────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Bella Cucina API", "status": "running"}


# ─── App Setup ────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    logger.info("Starting Bella Cucina API...")
    # Auto-seed on first start
    existing = await db.menu_items.find_one({}, {"_id": 0})
    if not existing:
        logger.info("No data found, auto-seeding...")
        await seed_data()
        logger.info("Auto-seed complete")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
