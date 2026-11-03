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

### Nét Việt Nam: đoạn dán thêm vào mọi prompt

AI hay trộn lẫn kiến trúc và đồ vật Trung Quốc, Nhật Bản vào cảnh. Để cảnh mang nét Việt Nam, thêm đoạn này vào cuối prompt (sau phần Background):

```
Vietnamese setting: some hamsters wear traditional Vietnamese clothing (conical palm-leaf hat "non la",
simple ao ba ba shirt, ao dai, checkered scarf). Vietnamese village details: bamboo groves, banana
trees, coconut palms, water buffalo, curved-roof communal house, red-tile roofs, lotus ponds, wooden
sampans. Do NOT use Chinese or Japanese architecture, torii gates, pagodas with stacked roofs or
kimono. No text or writing anywhere.
```

Nếu ảnh vẫn lẫn nét Trung/Nhật, nhắn tiếp:

```
Make this scene look clearly Vietnamese, not Chinese or Japanese: replace pagoda roofs with simple
red-tile village roofs, replace round Chinese lanterns with Vietnamese star lanterns or none,
and add conical palm-leaf hats and bamboo.
```

**Đừng yêu cầu chữ trong ảnh** (đặc biệt chữ tiếng Việt có dấu), vì AI thường viết sai. Nếu cần chữ, thêm sau bằng Canva.

Bạn hãy so ảnh với hình thật (ảnh chụp, tư liệu) để kiểm tra chi tiết có đúng không trước khi dùng.

### Danh sách 30 cảnh gợi ý

Cảnh 1 và 2 bạn đã làm. Các cảnh 3-30 dưới đây mang nét Việt Nam. Điền cột thứ ba vào `{ACTIVITIES}` và cột thứ tư vào `{DETAILS}`.

| # | {SCENE} | {ACTIVITIES} (mỗi con một việc, một tư thế) | {DETAILS} |
|---|---|---|---|
| 1 | Lantern festival night in a hillside village | hanging lanterns from a ladder, carrying a tray of dumplings, releasing a sky lantern, sleeping in a basket, dancing, peeking from a barrel, reading on a roof | wooden houses, strings of lanterns, full moon, stone bridge, pond |
| 2 | Spring picnic under blossoming trees | spreading a blanket, pouring tea, climbing a trunk, napping, flying a kite, painting a fan, catching a butterfly with a net | blossoming trees, checkered blanket, picnic basket, pond, far houses |
| 3 | Tet (Lunar New Year) in a village courtyard | wrapping square banh chung cakes in banana leaves, carrying a potted kumquat tree, hanging decorations, lion dance with a small drum, giving red envelopes, sweeping the yard, arranging a tray of five fruits | yellow apricot blossom (hoa mai) and pink peach blossom (hoa dao), kumquat trees, tray of five fruits, red-tile roof house, bamboo fence |
| 4 | Vietnamese Mid-Autumn night in the village | carrying star-shaped lanterns, lion dance with a drum, cutting mooncakes, holding a carp-shaped lantern, sitting under a banyan tree telling stories, pouring tea, looking at the moon | star lanterns (den ong sao), carp lanterns, banyan tree with aerial roots, full moon, tiled communal house |
| 5 | Golden rice harvest | cutting rice with sickles, carrying bundles on a shoulder pole, threshing, napping on straw in a conical hat, scarecrow, leading a water buffalo, bringing a lunch basket, flying a kite | ripe rice fields, straw stacks, bamboo groves, banana trees, egrets flying, water buffalo, ao ba ba |
| 6 | Floating market in the Mekong Delta | paddling a sampan, selling pineapples, hanging produce on a tall pole, cooking noodles on a boat, passing iced coffee between boats, weighing watermelons, sitting on a bow | sampans full of fruit, tall pole with hanging produce (cay beo), palm-leaf houses on the river, conical hats, coconut palms |
| 7 | Monkey bridge over a river village | balancing across a bamboo bridge, casting a fishing net, rowing, washing a pot, feeding ducks, carrying baskets, sitting on stilts | bamboo monkey bridge with a handrail, stilt houses, water coconut palms, ducks, small boats |
| 8 | Village square with a banyan tree and well | drawing water from a well, playing chess on a mat, napping on a bamboo bed, drinking tea, selling ice cream from a box, chasing a chicken, sitting on the banyan roots | huge banyan tree, stone well, curved-roof communal house (dinh), bamboo bench, red-tile roofs |
| 9 | Folk games in the village yard | jumping rope, kicking a shuttlecock, playing o an quan on the ground, hopscotch, blindfold game, tug of war, spinning tops, shooting marbles | dirt yard, small houses, tree shade, shuttlecocks, rope, marbles, simple clothes |
| 10 | Hanoi old quarter street | slurping pho, ladling broth, selling flowers from a bicycle, reading a newspaper, playing chess on tiny stools, riding a cyclo, sipping egg coffee, carrying goods on a shoulder pole | narrow tube houses with balconies and shutters, bicycles with flower baskets, small sidewalk stools, shoulder-pole vendor, cyclo |
| 11 | Hoi An old town at night | releasing lotus-shaped paper lights on the river, rowing a boat, hanging silk lanterns, a tailor sewing an ao dai, selling lanterns, drinking coffee on a balcony, riding a bicycle | yellow old-town houses, colorful silk lanterns, river with boats, covered bridge, bicycles |
| 12 | Terraced rice fields in the northern mountains | planting rice seedlings, carrying baskets on the back, leading a buffalo, weaving, drinking tea, flying a kite, climbing the terraces, resting at a stilt house | stepped rice terraces, misty mountains, stilt houses, waterfall, colorful traditional mountain clothing |
| 13 | Pottery village | throwing clay on a wheel, painting a vase, firing the kiln, carrying pots on a pole, drying cups, sweeping, packing a cart | blue-and-white vases, brick kiln, stacked pots, red-tile workshop, courtyard |
| 14 | Conical hat village | stitching a hat on a frame, drying palm leaves, stretching leaves flat, trying on hats, selling hats, carrying a stack of hats, napping under hats | palm leaves, bamboo hat frames, stacks of conical hats, courtyard, red-tile house |
| 15 | Night by the fire cooking banh chung | stirring the fire, watching the big pot, wrapping cakes, telling stories to little ones, carrying firewood, falling asleep on a grandparent, passing tea | large pot over open fire, firewood, banana leaves, bamboo strips, night sky, stilt house |
| 16 | Lotus pond | picking lotus, rowing a sampan, making lotus tea, fishing, reading on a boat, chasing a dragonfly, frog watching | large lotus leaves and flowers, seed pods, dragonflies, frogs, narrow wooden boat, conical hats |
| 17 | Day with the water buffalo | bathing the buffalo, riding with a bamboo flute, napping on its back, flying a kite, collecting grass, feeding ducks, sitting on the dike | water buffalo, rice paddies, egrets, grassy dike, bamboo, simple farm clothes |
| 18 | Morning village market | selling fruits, weighing goods, haggling, carrying baskets on a pole, buying fish, selling banh mi, plucking a chicken, sipping tea | baskets of mangosteen, dragon fruit, lychee, jackfruit, coconuts, bamboo scales, canopies, chickens |
| 19 | Street corner with banh mi and iced coffee | slicing baguettes, filling banh mi, dripping coffee with a phin, sipping iced coffee, delivering on a scooter, reading, napping on a plastic stool | banh mi cart, coffee filters (phin), tiny stools, scooter, shop awning, street trees |
| 20 | Rainy season in the countryside | wearing palm-leaf raincoats, holding banana-leaf umbrellas, splashing in puddles, fishing in a flooded field, catching frogs, sheltering under a conical hat, paddling | banana leaves, palm raincoats, puddles, flooded rice field, bamboo, chickens, small boat |
| 21 | Betrothal procession (le an hoi) | carrying red trays covered in cloth, parents greeting guests, a bride and groom in traditional dress, drumming, carrying flowers, children following | red lacquered trays, ao dai, traditional turbans, decorated gate, lanterns, wooden house |
| 22 | Traditional boat race | rowing in sync, steering, drumming the rhythm, cheering from the bank, waving flags, children on shoulders, bailing water | long narrow boats, drum, flags, river bank, crowd, palm trees |
| 23 | Village festival | wrestling, riding a swing, pulling rope, catching ducks in a pond, smashing a pot blindfolded, selling snacks, drumming | communal house, flags, swing, pond, stalls, banyan tree |
| 24 | Tet flower market | carrying peach blossom branches, selling kumquat trees, arranging orchids, riding a bicycle full of flowers, tying bouquets, watering, smelling flowers | peach and apricot blossoms, kumquat trees, orchids, bicycles, flower stalls, red-tile shop fronts |
| 25 | Fishing village on the coast | paddling a round basket boat, mending nets, drying fish on racks, sorting the catch, building a sandcastle, collecting shells, pulling a boat | round basket boats (thung chai), fishing nets, fish drying racks, coconut palms, sea |
| 26 | Da Lat highlands | picking strawberries, tending a flower farm, riding a bicycle, drinking hot soy milk, walking among pine trees, painting, picnic on a hill | pine trees, strawberry plants, flower terraces, small wooden houses, misty hills |
| 27 | Ha Long Bay | rowing a junk boat, kayaking, fishing, sunbathing on a deck, cooking on a boat, waving from a cave, feeding seagulls | limestone islands, traditional junk boat with sails, floating houses, sea, caves |
| 28 | Village school under a banyan | reading, drawing on a blackboard, raising a paw, arriving by bicycle, playing marbles, sleeping at a desk, ringing the school drum | wooden desks, blackboard, banyan tree, bicycles, school bags, tile roof classroom |
| 29 | Night market with street food | grilling skewers, flipping banh xeo, serving sweet soup (che), selling snails, juggling, sitting on tiny stools, fishing for toys | charcoal grills, banh xeo pans, tiny stools, string lights, stalls, basket vendors |
| 30 | Countryside kitchen yard | cooking over a firewood stove, steaming sticky rice, hanging corn, feeding chickens, washing vegetables, grinding rice, napping in a hammock | firewood stove, clay pots, hammock, hanging corn, chickens, banana trees, bamboo fence |

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
