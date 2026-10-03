"""Lớp mỏng bọc gspread để làm việc với một worksheet."""
import os
from typing import Any

import gspread
from google.oauth2.service_account import Credentials

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def connect(credentials_path: str | None = None) -> gspread.Client:
    path = credentials_path or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "credentials.json")
    creds = Credentials.from_service_account_file(path, scopes=SCOPES)
    return gspread.authorize(creds)


class SheetStore:
    def __init__(self, worksheet: gspread.Worksheet):
        self.ws = worksheet

    @classmethod
    def open(cls, spreadsheet_id: str, worksheet_name: str = "Sheet1") -> "SheetStore":
        sh = connect().open_by_key(spreadsheet_id)
        return cls(sh.worksheet(worksheet_name))

    def all_rows(self) -> list[dict[str, Any]]:
        """Mọi dòng dữ liệu, dùng dòng đầu làm tên cột."""
        return self.ws.get_all_records()

    def append(self, row: dict[str, Any]) -> None:
        """Thêm một dòng; giá trị được sắp theo thứ tự cột ở dòng tiêu đề."""
        headers = self.ws.row_values(1)
        self.ws.append_row([row.get(h, "") for h in headers], value_input_option="USER_ENTERED")

    def update_cell(self, row: int, column: str, value: Any) -> None:
        """Cập nhật ô theo số dòng (tính cả tiêu đề, dòng 1) và tên cột."""
        headers = self.ws.row_values(1)
        self.ws.update_cell(row, headers.index(column) + 1, value)

    def find_row(self, column: str, value: Any) -> int | None:
        """Số dòng đầu tiên có `column` == value, hoặc None."""
        for i, rec in enumerate(self.all_rows(), start=2):
            if str(rec.get(column)) == str(value):
                return i
        return None
