from fastapi import APIRouter, File, UploadFile, HTTPException
from src.Services.CSVService import CSVServices

router = APIRouter(
    prefix = "/csv",
    tags = ["Procesamiento de CSV"]
)

@router.post("/upload")
async def upload_documents(fileContabilidad: UploadFile = File(...), 
                           fileFactura: UploadFile = File(...)):
    
    result = await CSVServices.upload_documents(fileContabilidad, fileFactura)

    if "error" in result:
        return HTTPException(status_code=400, detail=result["error"])

    return result