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

### Cảnh 14-30 (bản cập nhật, dùng thay các dòng 14-30 cũ)

Bạn đã làm 13 cảnh đầu, nên từ cảnh 14 mình đổi lại toàn bộ để **không lặp** với những trang đã có (bộ ấm trà, hamster ngủ, thả diều, ăn bằng hai tay, đèn lồng tròn đỏ, cây lá tim, leo thang, trải khăn picnic) và **đa dạng vùng miền hơn**. Cảnh nào trùng với cảnh bạn đã làm (đồng lúa, chợ nổi, cầu khỉ, phố cổ, Hội An, ruộng bậc thang, trò chơi dân gian, làng cây đa) đã bị loại. Một số cảnh mới thay vào: rừng tràm, ga tàu, bánh tráng, cảnh kết thúc chuyến đi.

#### Khung prompt chuẩn mới (dùng cho mọi cảnh từ 14)

Thay `{SCENE}`, `{ACTIVITIES}`, `{DETAILS}` bằng cột tương ứng trong bảng bên dưới. Dán **cả khối**, đã bao gồm chú lữ khách, luật chống lặp và nét Việt Nam:

```
Create an image: black and white coloring book page for adults, portrait 2:3, extremely detailed, pure
black line art on a pure white background, clean uniform thick outlines, no shading, no gray, no solid
black fills, no text, no border. Draw water, sky and ground using only thin pure black lines on white,
never gray tones or filled areas.
Scene: {SCENE}.
Characters: thirteen small cute hamsters (chubby round bodies, small round ears, tiny bead eyes), every
hamster in a DIFFERENT pose and doing a DIFFERENT activity: {ACTIVITIES}. Plus the same traveler hamster
who appears once in every book scene: a cream hamster with a small backpack, a conical palm-leaf hat,
a checkered scarf and a tiny notebook, clearly visible. No two hamsters in the same pose.
Background: {DETAILS}. Dense with small details, every area large enough to color with a marker.
Outfits: give each hamster a different outfit (ao ba ba, ao dai, work clothes, headband, checkered
scarf, apron, straw raincoat), not every hamster wears a conical hat.
Vietnamese setting: authentic Vietnamese countryside or town details. Do NOT use Chinese or Japanese
architecture, pagodas with stacked roofs, torii gates or kimono. No flags, no text or writing anywhere.
Do NOT include: a tea set, a hamster sleeping, a kite, round red lanterns, a banyan or heart-leaf tree,
a hamster on a ladder, a picnic blanket, a hamster eating with both paws.
```

Mỗi cảnh có một **cây đặc trưng** khác nhau (cột cuối), để các trang không lặp cây lá tim.

#### Bảng 17 cảnh còn lại

| # | Vùng | {SCENE} | {ACTIVITIES} (mỗi con một việc, một tư thế) | {DETAILS} (kèm cây đặc trưng) |
|---|---|---|---|---|
| 14 | Trung | Fishing village on the central coast | paddling a round basket boat, mending a net on the sand, hanging fish on drying racks, sorting the catch into baskets, pulling a boat up the beach, building a sand tower, collecting shells, carrying a pole of baskets, gutting fish at a table, rowing a small boat, waving from a rock, pushing a cart of ice, feeding seagulls | round basket boats (thung chai), nets, fish drying racks, sandy beach, thatched huts, **coconut palms** |
| 15 | Tây Nguyên | Da Lat highlands market garden | picking strawberries, carrying a flower basket on the back, riding a bicycle with hydrangeas, grilling rice paper over charcoal, warming hands with hot soy milk, pruning roses, pushing a flower cart, painting a canvas on an easel, planting seedlings, walking down a pine path, watering a greenhouse bed, holding a bouquet, carrying sacks of vegetables | pine trees, strawberry beds, greenhouses, small wooden villas, hydrangeas and sunflowers, misty hills, **pine trees** |
| 16 | Bắc | Ha Long Bay floating village | rowing a junk boat, paddling a kayak, fishing with a rod, hauling a net, cooking on a floating house, hanging squid to dry, waving from a cave mouth, climbing a rope ladder onto a boat, feeding seagulls, repairing a sail, carrying baskets on a floating dock, selling snacks from a small boat, jumping into the water | limestone islands, junk boat with sails, floating houses, caves, sea waves drawn with thin lines, **small mangrove bushes** |
| 17 | Tây Nam Bộ | Lotus pond harvest | picking lotus flowers from a sampan, peeling lotus seeds on a mat, wrapping sticky rice in lotus leaves, rowing, fishing with a bamboo rod, carrying lotus on a shoulder pole, drying lotus petals on trays, catching a dragonfly with a net, arranging blossoms in a basket, standing on a plank over the pond, selling lotus seeds, sketching a flower, bringing lunch in a basket | large lotus leaves and flowers, seed pods, dragonflies, frogs, egrets, narrow wooden boat, **water coconut palms** |
| 18 | Chung | Night market with street food | pressing sugarcane juice, flipping banh xeo, serving sweet soup (che), grilling skewers over charcoal, selling banh trang tron, pulling stretchy candy, juggling, pushing a snack cart, ordering at a stall, carrying a tray of drinks, fishing for toys, selling balloons, wiping a table | string lights (bulbs, not round red lanterns), charcoal grills, sugarcane press, tiny stools, awnings, **flame trees** |
| 19 | Trung | Conical hat village | stitching a hat on a bamboo frame, drying palm leaves, ironing leaves flat, stacking finished hats, trying a hat on a friend, selling hats at a stall, carrying a bundle of leaves, weaving a hat rim, painting a poem-free pattern, packing hats in a basket, sweeping leaf scraps, counting hats, loading a cart | palm leaves, bamboo hat frames, tall stacks of hats, courtyard, red-tile roof, **areca palms** |
| 20 | Chung | Morning village market | weighing fish on a hanging scale, bargaining over eggs, carrying a pole of vegetables, selling banh mi, plucking a chicken, ladling soup, choosing fruit, wrapping goods in banana leaf, carrying a duck under the arm, counting coins, pulling a cart of coconuts, selling flowers, holding a shopping basket | baskets of mangosteen, dragon fruit, lychee, jackfruit, coconuts, bamboo scales, canopies, chickens, **mango tree** |
| 21 | Chung | Countryside kitchen yard | splitting firewood, cooking over a firewood stove, steaming sticky rice, hanging corn to dry, feeding chickens, washing vegetables at a well, grinding rice on a stone mill, stirring a clay pot, carrying water in buckets on a pole, sitting in a hammock reading a book, sweeping, shelling beans, rolling dough | firewood stove, clay pots, hammock, hanging corn, chickens, bamboo fence, **banana trees** |
| 22 | Chung | Rainy season in the countryside | wearing straw raincoats, holding banana-leaf umbrellas, splashing in puddles, fishing in a flooded field, catching frogs, sheltering under a big leaf, sailing a paper boat, carrying baskets through the rain, pushing a cart through mud, sweeping water off a porch, holding a duck, jumping over a puddle, peering out from a doorway | banana leaves, straw raincoats (ao toi), puddles, flooded field, bamboo, chickens, small boat, rain drawn with thin lines, **bamboo grove** |
| 23 | Bắc/Chung | Betrothal procession | carrying red lacquered trays covered with cloth, parents greeting guests, a bride and groom in traditional dress, drumming a small drum, carrying flower baskets, children following with candies, holding an umbrella over the couple, opening a gate, carrying a pole of gifts, playing a flute, clapping, lifting a banner of flowers | red lacquered trays, ao dai and turbans, decorated gate with flowers, wooden house, plain paper decorations, **frangipani trees** |
| 24 | Chung | Traditional boat race | rowing in sync, steering with a long oar, beating the rhythm on a drum, cheering from the bank, waving a plain ribbon, children on shoulders, bailing water, selling snacks on the bank, holding a megaphone shape cone, counting strokes, jumping with excitement, handing out water | long narrow racing boats, big drum, river bank crowd, palm trees, **coconut palms** |
| 25 | Chung | Rice paper and noodle village | spreading batter on a steamer cloth, lifting a steamed sheet, laying sheets on bamboo racks, cutting noodles, carrying a stack of racks, grilling rice paper over charcoal, packing noodles in baskets, turning sheets in the sun, stoking the fire, loading a cart, tasting a roll, tying bundles, sweeping flour | racks of drying rice paper (patterned), steamer pots, fire, baskets, courtyard, red-tile roof, **star-fruit trees** |
| 26 | Bắc/Chung | Village school under a flame tree | reading aloud, drawing on a blackboard, raising a paw to answer, arriving by bicycle, watering a school garden, ringing a school drum, carrying a stack of notebooks, planting a sapling, writing on slates, feeding pigeons, sharpening a pencil, helping a smaller hamster tie shoes, holding a globe | wooden desks, blackboard, bicycles, school bags, tile-roof classroom, a **flame tree (phuong) with flowers** |
| 27 | Bắc | Village festival | wrestling in a ring, riding a bamboo swing, catching a duck in a pond, smashing a clay pot blindfolded, drumming, selling snacks, performing a folk dance, carrying a festival banner pole, watching from a tree, juggling fruit, tossing rings at a stand, pulling a lantern-less float, clapping | communal house (dinh) with plain curved roof, pond, stalls, swing frame, **mango trees** |
| 28 | Tây Nam Bộ | Cajuput forest in flood season | paddling a small boat between trees, casting a net, picking water lilies, cooking on a boat, spotting egrets with a telescope, hauling a fish trap, steering a boat with a pole, feeding ducks, collecting duckweed, sitting on a tree root, rowing with a lunch basket, hanging a hammock between trees, pointing at birds | tall cajuput (tram) trees standing in water, floating duckweed, egrets, boats, narrow channels drawn with thin lines, **cajuput trees** |
| 29 | Chung | Old train station | waving from a train window, loading luggage, selling food through the window, ringing the station bell, holding a ticket, pushing a luggage cart, sweeping the platform, carrying a basket of fruit, checking a pocket watch, reading a timetable board without text, helping a baby hamster aboard, running to catch the train, stamping tickets | old steam-style locomotive, platform, station building with tiled roof, luggage, carts, **tall areca palms** |
| 30 | Chung | Coming home: the traveler's souvenir table | the traveler showing a photo album, unwrapping a conical hat, arranging pottery and lanterns on a shelf, hanging a woven textile, handing out gifts to children, tasting fruit from a basket, hugging a family member, pinning postcards on a board, helping with a map drawn as decoration only, pouring juice into cups, holding up a basket of souvenirs, opening a wooden chest | wooden house interior, souvenirs from every region (hat, pottery, textile, lantern, basket), window showing the village, **potted bonsai** |

Cảnh 30 là trang kết thúc hành trình. Nếu làm trang bản đồ, chỉ vẽ trang trí (đường đi, biểu tượng), không vẽ biên giới hay tên địa danh.

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

## Cấu trúc sách hành trình: "Hamster Adventures in Vietnam"

Ý tưởng: một chú hamster lữ khách đi dọc đất nước, mỗi vùng là một chương. **Không dùng tên hay nhân vật "Dế Mèn"** (tác phẩm của nhà văn Tô Hoài, còn trong thời hạn bản quyền). Chỉ mượn ý tưởng "hành trình phiêu lưu".

### Nhân vật chính (xuất hiện ở mọi trang)

Thêm câu này vào mọi prompt để người đọc tìm "chú hamster lữ khách" trong từng cảnh (tạo cảm giác tìm kiếm và theo dõi hành trình):

```
The same traveler hamster appears once in every scene: a cream hamster with a small backpack, a
conical palm-leaf hat (non la), a checkered scarf and a tiny notebook, clearly visible among the others.
```

Các trang bạn đã tạo trước đó chưa có chú lữ khách. Bạn có thể nhờ ChatGPT thêm vào (*"Add one traveler hamster with a small backpack, conical hat and checkered scarf into this scene, keep everything else the same"*), hoặc chỉ bắt đầu từ các trang mới.

### Thứ tự các chương (gợi ý, theo số cảnh cũ; từ cảnh 14 trở đi xem cột Vùng ở bảng cập nhật)

| Chương | Vùng | Cảnh gợi ý |
|---|---|---|
| 1 | Miền Bắc | 12 ruộng bậc thang, 10 phố cổ Hà Nội, 27 vịnh Hạ Long, 3 Tết, 4 Trung thu |
| 2 | Miền Trung | 11 Hội An, 25 làng chài thúng chai, 14 làng nón lá, 13 làng gốm |
| 3 | Tây Nguyên và Đà Lạt | 26 Đà Lạt, 17 trâu và đồng cỏ, 9 trò chơi dân gian |
| 4 | Miền Tây Nam Bộ | 6 chợ nổi, 7 cầu khỉ, 16 đầm sen, 5 đồng lúa chín, 29 chợ đêm |

Cả sách nên có khoảng 25-40 trang. Có thể thêm một trang giới thiệu "chuyến đi" ở đầu sách: hình trang trí tuyến đường đi (hamster với ba lô, bản đồ minh họa). **Nếu làm trang bản đồ, hãy giữ ở mức trang trí** (đường đi, biểu tượng địa danh), không vẽ đường biên giới hay chú thích địa lý chi tiết, để tránh sai sót nhạy cảm.

### Cấu hình bìa và tên sách

Tên sách, phụ đề, giới thiệu bìa sau nằm trong `book_hamster.json` (`title`, `title_lines`, `subtitle`, `tagline`, `back_blurb`). Bạn có thể nhờ mình chỉnh bất cứ lúc nào.
