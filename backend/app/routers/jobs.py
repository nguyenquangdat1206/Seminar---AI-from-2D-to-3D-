import asyncio
from uuid import uuid4
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.tripo import TripoService

router = APIRouter(prefix="/jobs", tags=["Jobs"])

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
MODEL_DIR = STORAGE_DIR / "models"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024

jobs = {}


async def process_job(job_id: str):
    job = jobs[job_id]

    try:
        job["status"] = "processing"
        job["progress"] = 10

        tripo = TripoService()

        file_token = await tripo.upload_image(
            job["imagePath"],
            job["filename"],
        )

        task_id = await tripo.create_model(
            file_token,
            Path(job["imagePath"]).suffix.lower().lstrip("."),
        )

        job["tripoTaskId"] = task_id
        job["progress"] = 20

        while True:
            result = await tripo.get_task(task_id)
            data = result.get("data", {})
            task_status = data.get("status")

            if task_status == "success":
                model_url = data.get("output", {}).get("model")

                if not model_url:
                    model_url = data.get("output", {}).get("model_url")

                if not model_url:
                    raise RuntimeError(
                        "Tripo hoàn thành nhưng không trả về URL model."
                    )

                job["modelUrl"] = model_url
                job["status"] = "completed"
                job["progress"] = 100
                job["model"] = {
                    "format": "glb",
                    "downloadUrl": model_url,
                }
                return

            if task_status in {"failed", "cancelled", "unknown"}:
                raise RuntimeError(
                    f"Tripo xử lý thất bại: {task_status}"
                )

            job["progress"] = min(job["progress"] + 5, 90)
            await asyncio.sleep(3)

    except Exception as exc:
        job["status"] = "failed"
        job["error"] = str(exc)


@router.post("")
async def create_job(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Chỉ chấp nhận PNG, JPG, JPEG hoặc WEBP.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(status_code=400, detail="File ảnh rỗng.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Ảnh không được vượt quá 10 MB.",
        )

    signatures = {
        ".png": b"\x89PNG\r\n\x1a\n",
        ".jpg": b"\xff\xd8\xff",
        ".jpeg": b"\xff\xd8\xff",
        ".webp": b"RIFF",
    }

    if not content.startswith(signatures[extension]):
        raise HTTPException(
            status_code=400,
            detail="Nội dung file không khớp định dạng ảnh.",
        )

    if extension == ".webp" and content[8:12] != b"WEBP":
        raise HTTPException(
            status_code=400,
            detail="File WEBP không hợp lệ.",
        )

    job_id = str(uuid4())
    image_path = UPLOAD_DIR / f"{job_id}{extension}"
    image_path.write_bytes(content)

    jobs[job_id] = {
        "jobId": job_id,
        "status": "queued",
        "progress": 0,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "error": None,
        "model": None,
        "modelUrl": None,
        "imagePath": str(image_path),
        "filename": f"{job_id}{extension}",
    }

    asyncio.create_task(process_job(job_id))

    return {
        "jobId": job_id,
        "status": "queued",
        "message": "Đã nhận ảnh, đang gửi yêu cầu tạo model 3D.",
    }


@router.get("/{job_id}")
async def get_job(job_id: str):
    job = jobs.get(job_id)

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy job.",
        )

    return {
        key: value
        for key, value in job.items()
        if key not in {"imagePath", "filename"}
    }