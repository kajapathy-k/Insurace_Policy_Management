import os
import httpx
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Insurance API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USER_SERVICE = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
POLICY_SERVICE = os.getenv("POLICY_SERVICE_URL", "http://localhost:8002")
CLAIMS_SERVICE = os.getenv("CLAIMS_SERVICE_URL", "http://localhost:8003")
PAYMENT_SERVICE = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8004")

ROUTES = {
    "/auth":          USER_SERVICE,
    "/users":         USER_SERVICE,
    "/policy-plans":  POLICY_SERVICE,
    "/policies":      POLICY_SERVICE,
    "/claims":        CLAIMS_SERVICE,
    "/payments":      PAYMENT_SERVICE,
}

async def proxy(request: Request, target_url: str) -> Response:
    async with httpx.AsyncClient(timeout=30.0) as client:
        body = await request.body()
        headers = dict(request.headers)
        headers.pop("host", None)
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=dict(request.query_params),
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type"),
        )

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway(path: str, request: Request):
    full_path = f"/{path}"
    target_base = None
    for prefix, service_url in ROUTES.items():
        if full_path.startswith(prefix):
            target_base = service_url
            break
    if not target_base:
        raise HTTPException(status_code=404, detail=f"No route for /{path}")
    target_url = f"{target_base}/{path}"
    return await proxy(request, target_url)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "api-gateway",
        "routes": list(ROUTES.keys()),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
