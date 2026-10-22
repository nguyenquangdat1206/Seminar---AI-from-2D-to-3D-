import httpx

from app.config import TRIPO_API_KEY, TRIPO_BASE_URL


class TripoService:
    def __init__(self):
        if not TRIPO_API_KEY:
            raise RuntimeError(
                "Chưa cấu hình TRIPO_API_KEY trong file .env"
            )

        self.headers = {
            "Authorization": f"Bearer {TRIPO_API_KEY}"
        }

    async def upload_image(self, image_path: str) -> str:
        """Upload ảnh lên Tripo và nhận file_token."""

        async with httpx.AsyncClient(timeout=120) as client:
            with open(image_path, "rb") as image_file:
                response = await client.post(
                    f"{TRIPO_BASE_URL}/files",
                    headers=self.headers,
                    files={
                        "file": (
                            image_path.split("/")[-1],
                            image_file,
                            "application/octet-stream",
                        )
                    },
                )

        response.raise_for_status()
        result = response.json()

        if result.get("code") != 0:
            raise RuntimeError(
                result.get("message", "Tripo upload ảnh thất bại")
            )

        return result["data"]["file_token"]
    async def get_task(self, task_id: str) -> dict:
        """Lấy trạng thái xử lý model từ Tripo."""

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                f"{TRIPO_BASE_URL}/tasks/{task_id}",
                headers=self.headers,
            )

        response.raise_for_status()
        result = response.json()

        if result.get("code") != 0:
            raise RuntimeError(
                result.get("message", "Không lấy được trạng thái task")
            )

        return result["data"]

    async def create_model_task(self, file_token: str) -> str:
        """Gửi yêu cầu tạo model 3D từ ảnh."""

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{TRIPO_BASE_URL}/generation/image-to-model",
                headers=self.headers,
                json={
                    "input": file_token,
                    "model": "v3.1-20260211",
                    "texture": True,
                    "pbr": True,
                },
            )

        response.raise_for_status()
        result = response.json()

        if result.get("code") != 0:
            raise RuntimeError(
                result.get("message", "Tripo tạo model thất bại")
            )

        return result["data"]["task_id"]