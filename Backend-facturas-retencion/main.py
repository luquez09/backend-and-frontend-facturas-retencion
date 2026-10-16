from fastapi import FastAPI
from src.Routes.Document_routes import router as upload_documents
from fastapi.middleware.cors import CORSMiddleware

# Inicializar la aplicación principal de FastAPI
app = FastAPI(
    title="API de Procesamiento y Validación de Documentos",
    version="1.0"
)

origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],   
)

# Registrar el enrutador importado
app.include_router(upload_documents)

@app.get("/")
def root():
    return {
        "message": "Bienvenido a la API. Dirígete a /docs para ver la documentación interactiva."
    }