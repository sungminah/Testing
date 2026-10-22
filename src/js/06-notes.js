'use strict';
/* ===== Ghi chú ngữ pháp theo chương (hiện ở giá sách & khi nói chuyện với người dân trong nhà) ===== */
const NOTES = [
  [ // Chương 1 · bài 1–3
    { t: 'N1 は N2 です · じゃ ありません · か · も · の', b: '「A は B です」= A là B. Phủ định: 「じゃ ありません」. Câu hỏi: thêm 「か」 cuối câu. 「も」= cũng. 「の」nối hai danh từ.', ex: [['わたしは ミラーです。', 'Tôi là Miller.'], ['ミラーさんは 学生ですか。', 'Anh Miller là sinh viên à?'], ['いいえ、学生じゃ ありません。', 'Không, không phải sinh viên.'], ['わたしも 会社員です。', 'Tôi cũng là nhân viên công ty.']] },
    { t: 'これ・それ・あれ / この・その・あの', b: 'これ = gần người nói, それ = gần người nghe, あれ = xa cả hai, どれ = cái nào. Khi đi cùng danh từ dùng この/その/あの + N.', ex: [['これは 本です。', 'Đây là sách.'], ['その かばんは だれのですか。', 'Cái cặp đó của ai?'], ['あの 方は だれですか。', 'Vị kia là ai?']] },
    { t: 'Số, tiền, giờ', b: 'Biến âm cần nhớ: 300 さんびゃく · 600 ろっぴゃく · 800 はっぴゃく · 3000 さんぜん · 8000 はっせん. Giờ: 4時 よじ · 7時 しちじ · 9時 くじ.', ex: [['これは いくらですか。', 'Cái này bao nhiêu tiền?'], ['３００円です。', '300 yên.'], ['いま ４時です。', 'Bây giờ là 4 giờ.']] }
  ],
  [ // 2 · bài 4–6
    { t: 'Động từ ます (hiện tại, quá khứ, phủ định)', b: 'ます (làm) · ません (không làm) · ました (đã làm) · ませんでした (đã không làm). Giờ giấc dùng 「に」; 「から ～ まで」= từ ... đến ...', ex: [['６時に 起きます。', 'Tôi dậy lúc 6 giờ.'], ['昨日 勉強しました。', 'Hôm qua tôi đã học.'], ['９時から ３時まで 働きます。', 'Làm từ 9 giờ đến 3 giờ.']] },
    { t: 'へ · で · と', b: '「へ」: hướng đến (行きます/来ます/帰ります). 「で」: phương tiện (電車で) hoặc nơi diễn ra hành động. 「と」: cùng với ai.', ex: [['学校へ 行きます。', 'Tôi đi đến trường.'], ['電車で 会社へ 行きます。', 'Tôi đi làm bằng tàu điện.'], ['友達と 来ました。', 'Tôi đã đến cùng bạn.']] },
    { t: 'を · ませんか · ましょう', b: '「を」đánh dấu tân ngữ. 「Vませんか」= cùng ... nhé? Đáp lại 「Vましょう」.', ex: [['コーヒーを 飲みます。', 'Tôi uống cà phê.'], ['いっしょに 映画を 見ませんか。', 'Cùng xem phim nhé?'], ['ええ、見ましょう。', 'Vâng, cùng xem nào.']] }
  ],
  [ // 3 · bài 7–9
    { t: 'あげます · もらいます', b: 'Cho: 「(人)に ～を あげます」. Nhận: 「(人)に ～を もらいます」. Công cụ dùng 「で」.', ex: [['友達に 花を あげました。', 'Tôi đã tặng hoa cho bạn.'], ['先生に 本を もらいました。', 'Tôi đã nhận sách từ thầy.'], ['はしで 食べます。', 'Tôi ăn bằng đũa.']] },
    { t: 'Tính từ い và な', b: 'い-adj: 高い → 高くないです. な-adj: 静か → 静かじゃ ありません; trước danh từ thêm 「な」(静かな 町). Nối câu: 「～が、～」= nhưng.', ex: [['この 本は 面白いです。', 'Cuốn sách này hay.'], ['東京は にぎやかな 町です。', 'Tokyo là thành phố náo nhiệt.'], ['忙しいですが、楽しいです。', 'Bận nhưng vui.']] },
    { t: 'が 好き / 上手 / わかります · から', b: 'Đối tượng của 好き, 嫌い, 上手, 下手, わかります dùng 「が」. 「から」= vì. 「あまり/ぜんぜん」đi với phủ định.', ex: [['音楽が 好きです。', 'Tôi thích âm nhạc.'], ['料理が 上手です。', 'Nấu ăn giỏi.'], ['用事が ありますから、行けません。', 'Vì có việc nên không đi được.']] }
  ],
  [ // 4 · bài 10–12
    { t: 'あります · います · vị trí', b: 'Vật: 「あります」; người/động vật: 「います」. Nơi tồn tại + 「に」. Từ chỉ vị trí: 上 下 前 後ろ 中 外 隣.', ex: [['机の 上に 本が あります。', 'Trên bàn có sách.'], ['庭に 犬が います。', 'Trong vườn có con chó.'], ['銀行は 駅の 隣です。', 'Ngân hàng ở cạnh ga.']] },
    { t: 'Cách đếm', b: 'Vật chung: ひとつ ふたつ みっつ… Người: ひとり ふたり さんにん… Vật mỏng: ～枚. Máy móc/xe: ～台. 「ぐらい」= khoảng; 「だけ」= chỉ.', ex: [['りんごを ２つ 買いました。', 'Tôi mua 2 quả táo.'], ['切手を ５枚 買いました。', 'Tôi mua 5 con tem.'], ['２時間ぐらい かかります。', 'Mất khoảng 2 tiếng.']] },
    { t: 'So sánh · quá khứ của tính từ', b: '「A は B より ～」= A ～ hơn B. 「～の 中で いちばん ～」. Quá khứ: N でした · い-adj → ～かったです.', ex: [['夏より 冬の 方が 好きです。', 'Tôi thích mùa đông hơn mùa hè.'], ['昨日は 雨でした。', 'Hôm qua trời mưa.'], ['試験は 難しかったです。', 'Bài thi đã khó.']] }
  ],
  [ // 5 · bài 13–15
    { t: '～たいです', b: 'Muốn làm gì: bỏ ます + 「たいです」. Phủ định: 「たくないです」.', ex: [['日本へ 行きたいです。', 'Tôi muốn đi Nhật.'], ['水を 飲みたいです。', 'Tôi muốn uống nước.'], ['何も 食べたくないです。', 'Tôi chẳng muốn ăn gì.']] },
    { t: 'Thể て + ください / います', b: 'Thể て: ます→て (買います→買って, 飲みます→飲んで, 書きます→書いて, 食べます→食べて). 「Vて ください」= xin hãy. 「Vて います」= đang.', ex: [['ちょっと 待って ください。', 'Xin chờ một chút.'], ['本を 読んで います。', 'Tôi đang đọc sách.'], ['ドアを 開けて ください。', 'Xin hãy mở cửa.']] },
    { t: '～ても いいです · ～ては いけません', b: '「Vても いいです」= được phép. 「Vては いけません」= không được. 「Vて います」còn chỉ trạng thái (住んで います).', ex: [['写真を 撮っても いいですか。', 'Chụp ảnh được không?'], ['ここで 話しては いけません。', 'Không được nói ở đây.'], ['東京に 住んで います。', 'Tôi sống ở Tokyo.']] }
  ],
  [ // 6 · bài 16–19
    { t: 'Nối câu bằng て · ～てから', b: 'Hành động nối tiếp: 「Vて、Vて、V」. 「Vてから」= sau khi. Tính từ い: 長くて 広い.', ex: [['朝 起きて、顔を 洗って、食べます。', 'Sáng dậy, rửa mặt, rồi ăn.'], ['食べてから、歯を みがきます。', 'Ăn xong thì đánh răng.']] },
    { t: 'Thể ない', b: '「Vないで ください」= xin đừng. 「Vなければ なりません」= phải làm.', ex: [['たばこを 吸わないで ください。', 'Xin đừng hút thuốc.'], ['薬を 飲まなければ なりません。', 'Tôi phải uống thuốc.']] },
    { t: 'Thể từ điển: こと · たことがある · たり', b: '「Vる ことが できます」= có thể. 「Vた ことが あります」= đã từng. 「Vたり Vたり します」= lúc thì ..., lúc thì ... 「Vる 前に」= trước khi.', ex: [['日本語を 話す ことが できます。', 'Tôi nói được tiếng Nhật.'], ['富士山に 登った ことが あります。', 'Tôi đã từng leo núi Phú Sĩ.'], ['本を 読んだり、映画を 見たり します。', 'Tôi lúc đọc sách, lúc xem phim.']] }
  ],
  [ // 7 · bài 20–22
    { t: 'Thể thường (nói với bạn bè)', b: 'ます→る (行きます→行く), ました→た, ません→ない. Tính từ い phủ định 「くない」.', ex: [['あした 行く？', 'Mai cậu đi không?'], ['うん、行く。', 'Ừ, đi.'], ['昨日 映画を 見た。', 'Hôm qua tớ xem phim.']] },
    { t: '～と 思います · ～と 言いました', b: 'Thể thường + 「と 思います」= tôi nghĩ rằng. 「～と 言いました」= đã nói rằng.', ex: [['明日は 雨が 降ると 思います。', 'Tôi nghĩ mai trời sẽ mưa.'], ['田中さんは 「行きます」と 言いました。', 'Anh Tanaka nói "tôi sẽ đi".']] },
    { t: 'Mệnh đề bổ nghĩa danh từ', b: 'Mệnh đề (thể thường) đứng ngay trước danh từ: 「母が 作った ケーキ」= bánh mẹ làm. Chủ ngữ trong mệnh đề dùng 「が」.', ex: [['これは 母が 作った ケーキです。', 'Đây là bánh mẹ tôi làm.'], ['昨日 買った 本は 高かったです。', 'Cuốn sách mua hôm qua đã đắt.']] }
  ],
  [ // 8 · bài 23–25
    { t: '～とき · ～と', b: '「Vる/Vた とき」= khi. 「Vる と、～」= hễ ... thì ... (kết quả tự nhiên).', ex: [['図書館へ 行く とき、友達に 会いました。', 'Trên đường đến thư viện tôi gặp bạn.'], ['ボタンを 押すと、ドアが 開きます。', 'Ấn nút thì cửa mở.']] },
    { t: 'くれます · あげます · もらいます', b: 'Người khác cho MÌNH: くれます. Mình cho người khác: あげます. Mình nhận: もらいます. Với động từ: 「Vて くれます/あげます/もらいます」.', ex: [['友達が 本を くれました。', 'Bạn đã cho tôi sách.'], ['母に 料理を 教えて もらいました。', 'Tôi được mẹ dạy nấu ăn.']] },
    { t: '～たら · ～ても', b: '「Vたら」= nếu / khi. 「Vても」= dù ... cũng. い-adj: 安かったら.', ex: [['雨が 降ったら、行きません。', 'Nếu mưa thì tôi không đi.'], ['安かったら、買います。', 'Nếu rẻ thì tôi mua.']] }
  ]
];
