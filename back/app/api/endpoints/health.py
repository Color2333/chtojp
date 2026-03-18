from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health")
async def health_check():
    try:
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "version": "1.0.0"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 