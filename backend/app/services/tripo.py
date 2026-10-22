import os

import httpx
from dotenv import load_dotenv

load_dotenv()

TRIPO_API_KEY = os.getenv("TRIPO_API_KEY")
TRIPO_BASE_URL = "https://openapi.tripo3d.ai/v3"


class TripoService:
    def __init__(self):
        if not TRIPO_API_KEY:
            raise RuntimeError(
                "Chưa cấu hình API key"
            )

        self.headers = {
            "Authorization": f"Bearer {TRIPO_API_KEY}"
        }

    async def upload_image(
        self,
        image_path: str,
        filename: str,
    ) -> str:
        """Upload ảnh lên Tripo và lấy file_token."""

        async with httpx.AsyncClient(timeout=120) as client:
            with open(image_path, "rb") as image_file:
                response = await client.post(
                    f"{TRIPO_BASE_URL}/files",
                    headers=self.headers,
                    files={
                        "file": (
                            filename,
                            image_file,
                            "application/octet-stream",
                        )
                    },
                )

            response.raise_for_status()
            result = response.json()

        if result.get("code") != 0:
            raise RuntimeError(
                result.get("message", "Tripo upload thất bại")
            )

        return result["data"]["file_token"]

    async def create_model(
        self,
        file_token: str,
        file_type: str = "jpg",
    ) -> str:
        """Yêu cầu Tripo tạo model 3D từ ảnh."""

        payload = {
            "type": "image_to_model",
            "model": "v3.1-20260211",
            "input": file_token,
        }

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{TRIPO_BASE_URL}/generation/image-to-model",
                headers=self.headers,
                json=payload,
            )
            if response.is_error:
                raise RuntimeError(
                    f"Tripo HTTP {response.status_code}: "
                    f"{response.text}"
                )

            result = response.json()

        if result.get("code") != 0:
            raise RuntimeError(
                result.get("message", "Không tạo được model 3D")
            )

        return result["data"]["task_id"]

    async def get_task(self, task_id: str) -> dict:
        """Kiểm tra trạng thái xử lý của Tripo."""

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

        return result