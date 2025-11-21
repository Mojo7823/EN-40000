from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB
from typing import List, Optional

# Import new routes
from app.routes import health, preview, cover, components

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register new routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(preview.router, prefix="/api/preview", tags=["preview"])
app.include_router(cover.router, prefix="/api/cover", tags=["cover"])
app.include_router(components.router, prefix="/api", tags=["components"])

# Database setup
db = TinyDB('db.json')
items_table = db.table('items')

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemInDB(Item):
    id: int

@app.get("/api/hello")
def read_root():
    return {"message": "Hello from Python Backend!"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# CRUD Endpoints

@app.get("/api/items", response_model=List[ItemInDB])
def get_items():
    items = []
    for item in items_table.all():
        items.append(ItemInDB(id=item.doc_id, **item))
    return items

@app.post("/api/items", response_model=ItemInDB)
def create_item(item: Item):
    item_id = items_table.insert(item.model_dump())
    return ItemInDB(id=item_id, **item.model_dump())

@app.put("/api/items/{item_id}", response_model=ItemInDB)
def update_item(item_id: int, item: Item):
    if not items_table.contains(doc_id=item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    items_table.update(item.model_dump(), doc_ids=[item_id])
    return ItemInDB(id=item_id, **item.model_dump())

@app.delete("/api/items/{item_id}")
def delete_item(item_id: int):
    if not items_table.contains(doc_id=item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    items_table.remove(doc_ids=[item_id])
    return {"message": "Item deleted successfully"}
