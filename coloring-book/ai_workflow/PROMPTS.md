# Làm sách "Hamster Village" bằng công cụ tạo ảnh AI

Mục tiêu: các trang **chi tiết, dày đặc, nhiều hamster với tư thế và việc làm khác nhau**, nét đen trên nền trắng. Mô tả (prompt) viết bằng tiếng Anh vì công cụ AI hiểu tiếng Anh tốt hơn.

## Quy tắc bắt buộc

1. **Không dùng tên họa sĩ, thương hiệu hay nhân vật có sẵn** trong mô tả, và **không đưa ảnh của người khác** (kể cả 3 ảnh tranh thỏ bạn đã gửi) vào công cụ làm ảnh tham chiếu. Làm vậy dễ vi phạm bản quyền và có thể khiến sách bị gỡ.
2. **Đọc điều khoản thương mại** của công cụ và gói bạn dùng (có công cụ chỉ cho bán sản phẩm ở gói trả phí).
3. **Khai báo đã dùng AI** khi đăng KDP và Etsy theo yêu cầu hiện hành của từng nền tảng.
4. Tự kiểm tra từng ảnh (xem mục QA bên dưới). AI hay vẽ sai chi tiết.

## Bước 1: Tạo "bảng nhân vật" trước để giữ nhân vật nhất quán

Tạo một ảnh duy nhất có **cùng một nhóm hamster nhiều tư thế**. Sau khi có kết quả ưng ý, dùng ảnh đó làm ảnh tham chiếu cho các trang sau (nhiều công cụ có chức năng tham chiếu nhân vật; xem tài liệu công cụ bạn dùng).

```
Character sheet for a coloring book, black and white clean line art, white background, no shading.
A cast of five original cute hamsters (chubby round bodies, small round ears, tiny black bead eyes,
rosy cheek circles), each shown in several poses: sitting, walking in side view, running,
standing with arms raised cheering, sleeping curled up, seen from behind, peeking from behind an object,
carrying a basket on the head, holding a lantern, eating with both paws.
Hamster 1: round cream hamster wearing a scarf. Hamster 2: tiny hamster with an acorn-cap hat.
Hamster 3: plump hamster with a flower behind the ear. Hamster 4: tall thin hamster with round glasses.
Hamster 5: baby hamster in a knitted hat. Thick uniform outlines, no gray, no solid black areas.
```

## Bước 2: Mô tả mẫu cho mỗi trang

Thay `{SCENE}`, `{ACTIVITIES}`, `{DETAILS}`:

```
Black and white coloring book page for adults, extremely detailed, pure black line art on a pure
white background, clean uniform thick outlines, no shading, no gray, no solid black fills, no text,
portrait 8.5x11 composition filling the whole page edge to edge.
Scene: {SCENE}.
Characters: twelve to sixteen small cute hamsters (chubby round bodies, small round ears, tiny bead
eyes), every hamster in a DIFFERENT pose and doing a DIFFERENT activity: {ACTIVITIES}.
Background: {DETAILS}. Dense with small details, every area large enough to color with a marker.
```

### Danh sách 30 cảnh gợi ý (đều là ý tưởng gốc)

| # | {SCENE} | Gợi ý {ACTIVITIES} (mỗi con một việc, một tư thế) |
|---|---|---|
| 1 | Lantern festival night in a hillside village | hanging lanterns from a ladder, carrying a tray of dumplings, releasing a sky lantern, sleeping in a basket, dancing, peeking from a barrel, reading on a roof |
| 2 | Spring picnic under blossoming trees | spreading a blanket, pouring tea, climbing a trunk, napping on a petal pile, flying a kite, painting a fan, running with a net |
| 3 | Mid-autumn mochi making | pounding rice with a mallet, shaping dough, carrying steaming baskets on the head, tasting, stirring a big pot, stacking boxes |
| 4 | Pumpkin harvest | pushing a wheelbarrow, hugging a giant pumpkin, climbing a hay stack, carving, tying scarecrow, sitting on a cart |
| 5 | Winter village with hot spring | sledding, building a snow hamster, soaking in the spring with a towel hat, carrying firewood, skating, shoveling |
| 6 | Summer pond with fireflies | fishing from a boat, catching fireflies, swimming with a float ring, picking lotus, rowing, sleeping on a lily pad |
| 7 | Village market street | selling fruit, haggling, carrying sacks, juggling, sampling noodles, sweeping, walking a duck on a string |
| 8 | Morning bakery | kneading, loading an oven with a long paddle, frosting a cake, delivering bread on a bicycle, queueing, sweeping flour |
| 9 | Tea house garden | pouring tea, serving sweets, playing a flute, bowing, reading, feeding koi, arranging flowers |
| 10 | Library inside a hollow tree | climbing shelves on a ladder, reading in a hammock, stacking books, writing, whispering, sleeping over a book |
| 11 | Fishing day by the river | casting, reeling in, cooking over a fire, hauling a net, waving from a bridge, building a sandcastle |
| 12 | Kite-flying hill | holding a kite string, running, tangled in string, picnicking, sketching, rolling down the hill |
| 13 | Rainy day with umbrellas | sharing a leaf umbrella, splashing in puddles, carrying a lantern, sheltering under a mushroom, sailing a paper boat |
| 14 | Bridge festival over a stream | crossing with trays, hanging ribbons, drumming, juggling, peering over the rail, riding a small boat underneath |
| 15 | Persimmon orchard picking | on ladders, catching falling fruit, sorting into baskets, drying fruit on strings, napping in the shade |
| 16 | Dusk noodle stall | slurping, ladling soup, kneading noodles, delivering bowls, fanning the stove, waiting in line |
| 17 | Moon-viewing terrace | stargazing with a telescope, sipping tea, composing a poem, dancing, hanging lanterns, hugging a cat |
| 18 | Public bathhouse | scrubbing a friend's back, carrying buckets, drinking milk from a bottle, soaking, sweeping, sliding down a rail |
| 19 | Flower festival | weaving garlands, planting, carrying flower baskets, painting a mural, watering with a can, crowning a friend |
| 20 | River of paper lantern boats | launching boats, lighting candles, rowing, waving from a bridge, writing wishes, helping a baby hamster |
| 21 | Pottery workshop | throwing clay on a wheel, glazing, carrying finished pots, firing the kiln, sweeping, drying cups on shelves |
| 22 | Rice harvest | cutting, carrying bundles on poles, threshing, napping on the stack, stirring a pot, playing tug of war |
| 23 | Winter solstice dumpling feast | rolling dough, filling dumplings, steaming, serving, lighting lanterns, taste-testing |
| 24 | New Year street parade | lion dance with a costume, drumming, throwing confetti, carrying a dragon, selling sweets, riding shoulders |
| 25 | Mountain temple stairs | climbing with baskets, ringing a bell, sweeping leaves, praying, resting, feeding birds |
| 26 | Seaside harbor | mending nets, unloading crates, building a sandcastle, rowing, painting a boat, collecting shells |
| 27 | Mushroom forest | harvesting giant mushrooms, riding a snail, sliding down a cap, hiding, reading under a cap, carrying lanterns |
| 28 | Village wedding procession | carrying a sedan chair, scattering petals, playing music, holding a banner, dancing, cheering |
| 29 | Night market | grilling skewers, juggling, fishing for toys, selling lanterns, riding a carousel, eating sweets |
| 30 | School day under the big tree | reading, drawing on a board, raising paws, running with a bag, playing marbles, sleeping at a desk |

### Mẹo để có tư thế đa dạng

- Luôn viết rõ **từng con làm gì**, không chỉ viết "many hamsters".
- Dùng các từ chỉ góc nhìn: *side view*, *seen from behind*, *three-quarter view*, *viewed from above*.
- Dùng các từ chỉ tư thế: *standing on tiptoe*, *leaning*, *crouching*, *mid-jump*, *hugging*, *lying on its belly*.
- Nếu ảnh lặp một tư thế, tạo lại và thêm *"no two hamsters in the same pose"*.

## Bước 3: QA từng ảnh (rất quan trọng)

Với mỗi cảnh, tạo vài biến thể rồi chọn ảnh tốt nhất. Loại hoặc sửa ảnh khi có:
- nét đứt, nét lệch, vùng xám hoặc tô bóng;
- tay, tai, mắt sai (thừa/thiếu);
- chữ vô nghĩa hoặc ký tự lạ (xóa bằng cọ trắng);
- vùng đen đặc lớn (khó tô);
- các ô quá nhỏ (khó tô bằng bút);
- nhân vật hoặc logo giống tác phẩm có bản quyền của người khác.

Sửa bằng Photopea (miễn phí, chạy trên trình duyệt), Procreate, Photoshop hoặc Canva. Nếu ảnh nhỏ hơn khoảng 2550 px bề ngang, dùng công cụ phóng to (upscale) trước.

## Bước 4: Ghép thành sách

Đặt các ảnh vào một thư mục, đặt tên theo thứ tự: `01_xxx.png`, `02_xxx.png`, ... rồi chạy:

```bash
python3 build_book_from_images.py THU_MUC_ANH --config book_hamster.json --out output/hamster_book
```

Công cụ sẽ đổi ảnh về đen trắng thuần, chuẩn 8.5x11 in, **cảnh báo ảnh quá nhỏ, quá nhiều xám/đen hoặc trống**, rồi tạo PDF ruột KDP, bản PDF tải về, bìa trọn bộ và ảnh tổng hợp. Thêm `--cover-art anh_bia_mau.png` để đặt ảnh màu lên bìa trước. Chỉnh tên sách và mô tả trong `book_hamster.json`.

Số trang nên tối thiểu khoảng 25-40 hình để sách đủ dày.
