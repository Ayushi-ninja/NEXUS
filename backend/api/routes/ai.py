"""
AI API routes — /api/v1/ai/...
Uses Google Gemini via ai_service to generate live traffic recommendations.
"""
from fastapi import APIRouter, Query, Depends
from typing import List
from api.schemas import AIRecommendation
from services import ai_service, traffic_service, weather_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get(
    "/recommendations",
    response_model=List[AIRecommendation],
    summary="AI traffic management recommendations",
)
async def ai_recommendations(
    limit: int = Query(3, ge=1, le=10, description="Max recommendations to return"),
):
    """
    Returns real-time AI-generated traffic management recommendations.
    Fetches current traffic, weather, and emergency status to provide context to Gemini.
    """
    # Fetch real-time context
    traffic = traffic_service.get_traffic_status()
    weather = weather_service.get_current_weather()
    emergency = traffic_service.get_active_emergency()

    # Get AI insights
    results = await ai_service.get_ai_recommendations(
        traffic_status=traffic,
        weather_data=weather,
        emergency_alert=emergency,
        limit=limit
    )
    
    return results