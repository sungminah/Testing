# Testing — Tích hợp Google Sheets

CLI + thư viện Python nhỏ để đọc/ghi Google Sheets qua service account.

## Cài đặt Google (một lần)
1. Vào Google Cloud Console, tạo project và bật **Google Sheets API**.
2. Tạo **Service Account**, tạo key dạng JSON, lưu thành `credentials.json` (đã nằm trong `.gitignore`).
3. Mở Google Sheet, bấm **Share**, thêm email của service account (`...@...iam.gserviceaccount.com`) với quyền **Editor**.
4. Dòng 1 của sheet là tiêu đề cột (vd: `name`, `age`).

## Chạy
```bash
pip install -r requirements.txt
cp .env.example .env   # điền SPREADSHEET_ID
python -m sheets_app.cli list
python -m sheets_app.cli add '{"name":"An","age":30}'
python -m sheets_app.cli set 2 age 31
pytest
```

## Dùng như thư viện
```python
from sheets_app.client import SheetStore
store = SheetStore.open("SPREADSHEET_ID", "Sheet1")
store.append({"name": "An", "age": 30})
```
