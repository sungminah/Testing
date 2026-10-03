"""CLI: python -m sheets_app.cli {list,add,set} ..."""
import argparse
import json
import os

from dotenv import load_dotenv

from .client import SheetStore


def main(argv: list[str] | None = None) -> None:
    load_dotenv()
    p = argparse.ArgumentParser(description="Làm việc với Google Sheets")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list", help="In mọi dòng dưới dạng JSON")
    add = sub.add_parser("add", help="Thêm dòng từ JSON, vd: '{\"name\":\"An\",\"age\":30}'")
    add.add_argument("json_row")
    st = sub.add_parser("set", help="Cập nhật ô: set <dòng> <cột> <giá trị>")
    st.add_argument("row", type=int)
    st.add_argument("column")
    st.add_argument("value")
    args = p.parse_args(argv)

    store = SheetStore.open(os.environ["SPREADSHEET_ID"], os.environ.get("WORKSHEET_NAME", "Sheet1"))
    if args.cmd == "list":
        print(json.dumps(store.all_rows(), ensure_ascii=False, indent=2))
    elif args.cmd == "add":
        store.append(json.loads(args.json_row))
        print("Đã thêm dòng.")
    elif args.cmd == "set":
        store.update_cell(args.row, args.column, args.value)
        print("Đã cập nhật.")


if __name__ == "__main__":
    main()
