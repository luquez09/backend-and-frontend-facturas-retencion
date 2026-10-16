from fastapi import FastAPI
from src.Routes.Document_routes import router as upload_documents

# Inicializar la aplicación principal de FastAPI
app = FastAPI(
    title="API de Procesamiento y Validación de Documentos",
    version="1.0"
)

# Registrar el enrutador importado
app.include_router(upload_documents)

@app.get("/")
def root():
    return {
        "message": "Bienvenido a la API. Dirígete a /docs para ver la documentación interactiva."
    }