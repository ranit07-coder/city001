import os
import certifi 
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Any, Dict
import uuid

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated
from contextlib import asynccontextmanager

from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
import httpx

# SQLAlchemy Imports
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import Column, String, Float, DateTime, Text, select, func
from sqlalchemy.dialects.postgresql import UUID

# Load Environment Variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/city_db")
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- Setup Database ---
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

# --- Models ---
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Report(Base):
    __tablename__ = "reports"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    ai_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# DB Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # We are skipping auto-creation here because you will strictly create 
    # the tables manually in your local PostgreSQL database.
    yield

# --- Setup App ---
app = FastAPI(title="City Agent Backend", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Config Services ---
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- Authentication Utils ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Pydantic Schemas ---
class UserRegister(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Endpoints ---

@app.post("/api/auth/register", status_code=201)
async def register_user(user: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        first_name=user.firstName,
        last_name=user.lastName,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    await db.commit()
    return {"msg": "User registered successfully"}

@app.post("/api/auth/login")
async def login_user(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(hours=1)
    token = create_access_token(
        data={"userId": str(db_user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "token": token,
        "user": {
            "firstName": db_user.first_name,
            "lastName": db_user.last_name,
            "email": db_user.email
        }
    }

@app.get("/api/auth/me")
async def get_me(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid User ID format")
        
    result = await db.execute(select(User).where(User.id == user_uuid))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user": {
            "firstName": db_user.first_name,
            "lastName": db_user.last_name,
            "email": db_user.email
        }
    }

async def analyze_media(text: str, image_url: str) -> dict:
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            image_data = response.content

        prompt = f"Analyze this event and provide category, location (lat,lng), summary, and sentiment. User description: {text}"
        
        result = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        result_text = result.text
        
        return {
            "category": "Flood" if "flood" in result_text.lower() else "General",
            "summary": result_text,
            "sentiment": "Negative" if "negative" in result_text.lower() else "Neutral"
        }
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "category": "General",
            "summary": "Analysis fallback",
            "sentiment": "Neutral"
        }

@app.post("/report", status_code=201)
async def upload_report(
    eventType: str = Form(...),
    severity: str = Form(...),
    description: str = Form(...),
    lat: str = Form(...),
    lng: str = Form(...),
    media: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        contents = await media.read()
        
        # Upload to Cloudinary
        res_cloudinary = cloudinary.uploader.upload(contents, resource_type="auto")
        secure_url = res_cloudinary.get("secure_url")
        
        # AI Analysis
        ai_result = await analyze_media(description, secure_url)
        
        # Save to DB
        new_report = Report(
            event_type=eventType,
            severity=severity,
            description=description,
            lat=float(lat),
            lng=float(lng),
            image_url=secure_url,
            ai_category=ai_result["category"],
            ai_summary=ai_result["summary"],
            sentiment=ai_result["sentiment"]
        )
        db.add(new_report)
        await db.commit()
        await db.refresh(new_report)
        
        return {
            "message": "✅ Report uploaded successfully", 
            "report": {
                "_id": str(new_report.id),
                "eventType": new_report.event_type,
                "severity": new_report.severity,
                "description": new_report.description,
                "location": {"lat": new_report.lat, "lng": new_report.lng},
                "imageUrl": new_report.image_url,
                "aiCategory": new_report.ai_category,
                "aiSummary": new_report.ai_summary,
                "sentiment": new_report.sentiment,
                "timestamp": new_report.timestamp,
                "createdAt": new_report.created_at
            }
        }
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/reports")
async def get_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).order_by(Report.timestamp.desc()).limit(1000))
    reports = result.scalars().all()
    
    return [
        {
            "_id": str(r.id),
            "eventType": r.event_type,
            "severity": r.severity,
            "description": r.description,
            "location": {"lat": r.lat, "lng": r.lng},
            "imageUrl": r.image_url,
            "aiCategory": r.ai_category,
            "aiSummary": r.ai_summary,
            "sentiment": r.sentiment,
            "timestamp": r.timestamp,
            "createdAt": r.created_at       
        }
        for r in reports
    ]

@app.get("/api/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    active_count = await db.scalar(select(func.count()).select_from(Report)) or 0
    high_priority_count = await db.scalar(select(func.count()).select_from(Report).where(Report.severity == "high")) or 0
    prediction_count = await db.scalar(select(func.count()).select_from(Report).where(Report.ai_category == "Prediction")) or 0
    
    # Sentiment stats
    sentiment_result = await db.execute(
        select(Report.sentiment, func.count(Report.id)).group_by(Report.sentiment)
    )
    sentiment_stats = sentiment_result.all()
    
    positive = 0
    for sentiment, count in sentiment_stats:
        if sentiment and "positive" in sentiment.lower():
            positive = count
            break
            
    city_mood = round((positive / active_count) * 100) if active_count > 0 else 0
    
    return {
        "activeCount": active_count,
        "highPriorityCount": high_priority_count,
        "predictionCount": prediction_count,
        "cityMood": city_mood
    }

@app.get("/api/predictions")
async def get_predictions(db: AsyncSession = Depends(get_db)):
    since = datetime.now(timezone.utc) - timedelta(hours=6)
    
    result = await db.execute(select(Report).where(Report.created_at >= since))
    recent_reports = result.scalars().all()
    
    grouped = {}
    for r in recent_reports:
        key = (r.event_type, r.severity)
        if key not in grouped:
            grouped[key] = {"count": 0, "sample": r}
        grouped[key]["count"] += 1
        
    sorted_groups = sorted(grouped.values(), key=lambda x: x["count"], reverse=True)[:6]
    
    predictions = []
    for g in sorted_groups:
        sample = g["sample"]
        event_type = sample.event_type
        severity = sample.severity
        count = g["count"]
        
        place = f"({sample.lat:.3f}, {sample.lng:.3f})"
        
        base_confidence = min(95, 30 + count * 10)
        
        if event_type == "traffic":
            duration_text = "5–7 PM"
            title = "Traffic Congestion Likely"
        elif event_type == "power":
            duration_text = "2–4 hours"
            title = "Potential Power Outage"
        else:
            duration_text = "Next 3 hours"
            title = "Weather Alert"
            
        area = sample.ai_category or place
        description = sample.ai_summary or f"{event_type} activity detected"
        
        predictions.append({
            "title": title,
            "severity": (severity or "low").lower(),
            "description": description,
            "area": area,
            "confidence": base_confidence,
            "window": duration_text
        })
        
    return {"window": "Next 6 hours", "predictions": predictions}

@app.get("/api/alerts")
async def get_alerts(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    one_hour_ago = now - timedelta(hours=1)
    
    result = await db.execute(select(Report).where(Report.created_at >= one_hour_ago))
    recent_reports = result.scalars().all()
    
    grouped = {}
    for r in recent_reports:
        key = r.ai_category or "Event"
        grouped[key] = grouped.get(key, 0) + 1
        
    alerts = []
    for cat, count in grouped.items():
        if count >= 3:
            alerts.append({
                "message": f"Multiple {cat} reports in your area.",
                "timestamp": now.isoformat()
            })
            
    return alerts

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
