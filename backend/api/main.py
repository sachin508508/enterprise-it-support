from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .security_config import FRONTEND_ORIGIN

from .auth.routes import router as auth_router
from .routes.chat import router as chat_router
from .routes.conversations import router as conversations_router
from .routes.dashboard import router as dashboard_router
from .routes.hitl import router as hitl_router


app = FastAPI(
    title="Enterprise IT Support API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "DELETE",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


@app.middleware("http")
async def security_headers(
    request: Request,
    call_next,
):

    response = await call_next(request)

    response.headers[
        "X-Content-Type-Options"
    ] = "nosniff"

    response.headers[
        "X-Frame-Options"
    ] = "DENY"

    response.headers[
        "Referrer-Policy"
    ] = "no-referrer"

    response.headers[
        "Cache-Control"
    ] = "no-store"

    return response


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "status": "failed",
            "message": "An internal server error occurred.",
        },
    )


@app.get("/")
async def root():

    return {
        "message": (
            "Enterprise IT Support API is running"
        )
    }


@app.get("/health")
async def health():

    return {
        "status": "healthy"
    }


app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(hitl_router)
app.include_router(dashboard_router)