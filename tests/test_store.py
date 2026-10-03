from unittest.mock import MagicMock

from sheets_app.client import SheetStore


def make_store(headers, records):
    ws = MagicMock()
    ws.row_values.return_value = headers
    ws.get_all_records.return_value = records
    return SheetStore(ws), ws


def test_append_orders_by_header():
    store, ws = make_store(["name", "age"], [])
    store.append({"age": 30, "name": "An"})
    ws.append_row.assert_called_once_with(["An", 30], value_input_option="USER_ENTERED")


def test_append_fills_missing_with_blank():
    store, ws = make_store(["name", "age"], [])
    store.append({"name": "An"})
    assert ws.append_row.call_args[0][0] == ["An", ""]


def test_update_cell_maps_column_name():
    store, ws = make_store(["name", "age"], [])
    store.update_cell(3, "age", 31)
    ws.update_cell.assert_called_once_with(3, 2, 31)


def test_find_row():
    store, _ = make_store(["name"], [{"name": "An"}, {"name": "Binh"}])
    assert store.find_row("name", "Binh") == 3
    assert store.find_row("name", "X") is None
