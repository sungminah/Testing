'use strict';
/* ===== Từ vựng N5 (Minna no Nihongo I, bài 1–25): từ|cách đọc|nghĩa|bài ===== */
const VOC_RAW = `
私|わたし|tôi|1
人|ひと|người|1
先生|せんせい|giáo viên|1
学生|がくせい|học sinh, sinh viên|1
会社員|かいしゃいん|nhân viên công ty|1
銀行員|ぎんこういん|nhân viên ngân hàng|1
医者|いしゃ|bác sĩ|1
研究者|けんきゅうしゃ|nhà nghiên cứu|1
大学|だいがく|đại học|1
病院|びょういん|bệnh viện|1
電気|でんき|điện, đèn điện|1
友達|ともだち|bạn bè|1
日本|にほん|Nhật Bản|1
方|かた|vị (cách nói lịch sự của 人)|1
お願いします|おねがいします|xin nhờ, xin giúp đỡ|1
田中|たなか|Tanaka (họ)|1
木村|きむら|Kimura (họ)|1
山田|やまだ|Yamada (họ)|1
元気|げんき|khỏe|1
朝|あさ|buổi sáng|1
夜|よる|buổi tối, ban đêm|1
食事|しょくじ|bữa ăn|1
会社|かいしゃ|công ty|1
本|ほん|sách|2
辞書|じしょ|từ điển|2
雑誌|ざっし|tạp chí|2
新聞|しんぶん|báo|2
手帳|てちょう|sổ tay|2
名刺|めいし|danh thiếp|2
鍵|かぎ|chìa khóa|2
時計|とけい|đồng hồ|2
傘|かさ|cái ô|2
鞄|かばん|cái cặp|2
靴|くつ|giày|2
机|つくえ|cái bàn học|2
椅子|いす|cái ghế|2
写真|しゃしん|bức ảnh|2
車|くるま|xe hơi|2
日本語|にほんご|tiếng Nhật|2
英語|えいご|tiếng Anh|2
土産|みやげ|quà lưu niệm|2
何|なに|cái gì|2
教室|きょうしつ|lớp học|3
食堂|しょくどう|nhà ăn, căng tin|3
事務所|じむしょ|văn phòng|3
会議室|かいぎしつ|phòng họp|3
受付|うけつけ|quầy tiếp tân|3
玄関|げんかん|lối vào|3
階|かい|tầng|3
地下|ちか|tầng hầm|3
円|えん|yên|3
百|ひゃく|trăm|3
千|せん|nghìn|3
万|まん|vạn (mười nghìn)|3
国|くに|đất nước|3
家|うち|nhà|3
電話|でんわ|điện thoại|3
売り場|うりば|quầy bán hàng|3
手洗い|てあらい|nhà vệ sinh|3
今|いま|bây giờ|4
午前|ごぜん|buổi sáng (AM)|4
午後|ごご|buổi chiều (PM)|4
昼|ひる|buổi trưa|4
晩|ばん|buổi tối|4
毎朝|まいあさ|mỗi sáng|4
毎日|まいにち|mỗi ngày|4
昨日|きのう|hôm qua|4
今日|きょう|hôm nay|4
明日|あした|ngày mai|4
月曜日|げつようび|thứ hai|4
火曜日|かようび|thứ ba|4
水曜日|すいようび|thứ tư|4
木曜日|もくようび|thứ năm|4
金曜日|きんようび|thứ sáu|4
土曜日|どようび|thứ bảy|4
日曜日|にちようび|chủ nhật|4
何曜日|なんようび|thứ mấy|4
何時|なんじ|mấy giờ|4
半|はん|rưỡi|4
時|じ|giờ|4
分|ふん|phút|4
起きます|おきます|thức dậy|4
寝ます|ねます|đi ngủ|4
働きます|はたらきます|làm việc|4
休みます|やすみます|nghỉ ngơi|4
勉強します|べんきょうします|học bài|4
終わります|おわります|kết thúc|4
銀行|ぎんこう|ngân hàng|4
郵便局|ゆうびんきょく|bưu điện|4
図書館|としょかん|thư viện|4
美術館|びじゅつかん|bảo tàng mỹ thuật|4
行きます|いきます|đi|5
来ます|きます|đến|5
帰ります|かえります|trở về|5
学校|がっこう|trường học|5
駅|えき|nhà ga|5
飛行機|ひこうき|máy bay|5
船|ふね|tàu thuyền|5
電車|でんしゃ|tàu điện|5
地下鉄|ちかてつ|tàu điện ngầm|5
新幹線|しんかんせん|tàu cao tốc|5
自転車|じてんしゃ|xe đạp|5
歩いて|あるいて|đi bộ (thể て)|5
一人|ひとり|một người|5
家族|かぞく|gia đình|5
彼|かれ|anh ấy|5
彼女|かのじょ|cô ấy|5
誕生日|たんじょうび|sinh nhật|5
来週|らいしゅう|tuần sau|5
先週|せんしゅう|tuần trước|5
今週|こんしゅう|tuần này|5
来月|らいげつ|tháng sau|5
食べます|たべます|ăn|6
飲みます|のみます|uống|6
見ます|みます|xem, nhìn|6
買います|かいます|mua|6
読みます|よみます|đọc|6
書きます|かきます|viết|6
聞きます|ききます|nghe, hỏi|6
会います|あいます|gặp|6
昼ご飯|ひるごはん|bữa trưa|6
朝ご飯|あさごはん|bữa sáng|6
晩ご飯|ばんごはん|bữa tối|6
卵|たまご|trứng|6
肉|にく|thịt|6
魚|さかな|cá|6
野菜|やさい|rau|6
果物|くだもの|trái cây|6
水|みず|nước|6
お茶|おちゃ|trà|6
牛乳|ぎゅうにゅう|sữa bò|6
映画|えいが|phim|6
手紙|てがみ|thư|6
花|はな|hoa|6
公園|こうえん|công viên|6
吸います|すいます|hút (thuốc)|6
撮ります|とります|chụp (ảnh)|6
コーヒー|コーヒー|cà phê|6
ジュース|ジュース|nước ép|6
ビール|ビール|bia|6
パン|パン|bánh mì|6
バス|バス|xe buýt|5
タクシー|タクシー|taxi|5
切ります|きります|cắt|7
送ります|おくります|gửi|7
貸します|かします|cho mượn|7
借ります|かります|mượn|7
教えます|おしえます|dạy, chỉ|7
習います|ならいます|học (từ ai đó)|7
手|て|bàn tay|7
箸|はし|đũa|7
荷物|にもつ|hành lý|7
お金|おかね|tiền|7
切符|きっぷ|vé|7
父|ちち|bố (của mình)|7
母|はは|mẹ (của mình)|7
大きい|おおきい|to, lớn|8
小さい|ちいさい|nhỏ|8
新しい|あたらしい|mới|8
古い|ふるい|cũ|8
悪い|わるい|xấu, tệ|8
暑い|あつい|nóng (thời tiết)|8
寒い|さむい|lạnh (thời tiết)|8
冷たい|つめたい|lạnh (khi chạm)|8
難しい|むずかしい|khó|8
易しい|やさしい|dễ|8
高い|たかい|cao, đắt|8
安い|やすい|rẻ|8
低い|ひくい|thấp|8
面白い|おもしろい|thú vị|8
美味しい|おいしい|ngon|8
忙しい|いそがしい|bận|8
楽しい|たのしい|vui|8
白い|しろい|trắng|8
黒い|くろい|đen|8
赤い|あかい|đỏ|8
青い|あおい|xanh dương|8
桜|さくら|hoa anh đào|8
山|やま|núi|8
川|かわ|sông|8
町|まち|thị trấn, phố|8
食べ物|たべもの|đồ ăn|8
所|ところ|nơi chốn|8
寮|りょう|ký túc xá|8
生活|せいかつ|cuộc sống|8
仕事|しごと|công việc|8
綺麗|きれい|đẹp, sạch|8
静か|しずか|yên tĩnh|8
賑やか|にぎやか|náo nhiệt|8
有名|ゆうめい|nổi tiếng|8
親切|しんせつ|tốt bụng, tử tế|8
暇|ひま|rảnh rỗi|8
便利|べんり|tiện lợi|8
素敵|すてき|tuyệt vời|8
お寺|おてら|chùa|8
好き|すき|thích|9
嫌い|きらい|ghét|9
上手|じょうず|giỏi|9
下手|へた|kém|9
分かります|わかります|hiểu|9
料理|りょうり|nấu ăn, món ăn|9
飲み物|のみもの|đồ uống|9
歌|うた|bài hát|9
音楽|おんがく|âm nhạc|9
絵|え|bức tranh|9
字|じ|chữ|9
漢字|かんじ|chữ Hán|9
約束|やくそく|lời hẹn|9
用事|ようじ|việc bận|9
上|うえ|trên|10
下|した|dưới|10
前|まえ|trước|10
後ろ|うしろ|sau, phía sau|10
右|みぎ|bên phải|10
左|ひだり|bên trái|10
中|なか|trong|10
外|そと|ngoài|10
隣|となり|bên cạnh|10
近く|ちかく|gần đây|10
間|あいだ|giữa, khoảng|10
犬|いぬ|con chó|10
鳥|とり|con chim|10
馬|うま|con ngựa|10
猫|ねこ|con mèo|10
木|き|cây|10
箱|はこ|cái hộp|10
庭|にわ|vườn|10
部屋|へや|căn phòng|10
子供|こども|trẻ em|10
切手|きって|tem thư|11
封筒|ふうとう|phong bì|11
兄弟|きょうだい|anh chị em|11
兄|あに|anh trai (của mình)|11
姉|あね|chị gái (của mình)|11
弟|おとうと|em trai (của mình)|11
妹|いもうと|em gái (của mình)|11
外国|がいこく|nước ngoài|11
東京|とうきょう|Tokyo|11
枚|まい|tờ (đếm vật mỏng)|11
台|だい|chiếc (đếm máy, xe)|11
時間|じかん|thời gian|11
一週間|いっしゅうかん|một tuần|11
簡単|かんたん|đơn giản|12
近い|ちかい|gần|12
遠い|とおい|xa|12
速い|はやい|nhanh|12
遅い|おそい|chậm, muộn|12
多い|おおい|nhiều|12
少ない|すくない|ít|12
冬|ふゆ|mùa đông|12
夏|なつ|mùa hè|12
春|はる|mùa xuân|12
秋|あき|mùa thu|12
天気|てんき|thời tiết|12
雨|あめ|mưa|12
雪|ゆき|tuyết|12
旅行|りょこう|du lịch|12
祭り|まつり|lễ hội|12
試験|しけん|kỳ thi|12
欲しい|ほしい|muốn có|13
遊びます|あそびます|chơi|13
泳ぎます|およぎます|bơi|13
迎えます|むかえます|đón|13
疲れます|つかれます|mệt|13
結婚|けっこん|kết hôn|13
買い物|かいもの|mua sắm|13
喫茶店|きっさてん|quán cà phê|13
付けます|つけます|bật (đèn, máy)|14
消します|けします|tắt|14
開けます|あけます|mở|14
閉めます|しめます|đóng|14
急ぎます|いそぎます|vội|14
待ちます|まちます|đợi|14
持ちます|もちます|cầm, mang|14
取ります|とります|lấy|14
手伝います|てつだいます|giúp đỡ|14
呼びます|よびます|gọi|14
話します|はなします|nói chuyện|14
見せます|みせます|cho xem|14
窓|まど|cửa sổ|14
名前|なまえ|tên|14
早い|はやい|sớm|17
今年|ことし|năm nay|19
来年|らいねん|năm sau|19
立ちます|たちます|đứng|15
座ります|すわります|ngồi|15
使います|つかいます|dùng|15
置きます|おきます|đặt|15
作ります|つくります|làm, chế tạo|15
売ります|うります|bán|15
知ります|しります|biết|15
住みます|すみます|sống, cư trú|15
研究|けんきゅう|nghiên cứu|15
乗ります|のります|đi (xe), lên|16
浴びます|あびます|tắm (vòi sen)|16
入れます|いれます|cho vào|16
出します|だします|lấy ra, gửi|16
入ります|はいります|vào|16
出ます|でます|ra|16
辞めます|やめます|nghỉ (việc)|16
押します|おします|ấn, đẩy|16
若い|わかい|trẻ|16
広い|ひろい|rộng|16
長い|ながい|dài|16
短い|みじかい|ngắn|16
明るい|あかるい|sáng|16
暗い|くらい|tối|16
体|からだ|cơ thể|16
頭|あたま|đầu|16
髪|かみ|tóc|16
顔|かお|khuôn mặt|16
目|め|mắt|16
耳|みみ|tai|16
口|くち|miệng|16
歯|は|răng|16
足|あし|chân|16
覚えます|おぼえます|nhớ|17
忘れます|わすれます|quên|17
払います|はらいます|trả (tiền)|17
返します|かえします|trả lại|17
出かけます|でかけます|ra ngoài|17
心配|しんぱい|lo lắng|17
薬|くすり|thuốc|17
熱|ねつ|sốt|17
風邪|かぜ|cảm cúm|17
出来ます|できます|có thể, làm được|18
洗います|あらいます|rửa|18
弾きます|ひきます|chơi (nhạc cụ)|18
歌います|うたいます|hát|18
集めます|あつめます|sưu tầm|18
捨てます|すてます|vứt|18
運転|うんてん|lái xe|18
予約|よやく|đặt trước|18
趣味|しゅみ|sở thích|18
登ります|のぼります|leo|19
泊まります|とまります|trọ lại|19
掃除|そうじ|dọn dẹp|19
洗濯|せんたく|giặt giũ|19
練習|れんしゅう|luyện tập|19
眠い|ねむい|buồn ngủ|19
強い|つよい|mạnh|19
弱い|よわい|yếu|19
富士山|ふじさん|núi Phú Sĩ|19
去年|きょねん|năm ngoái|19
思います|おもいます|nghĩ|21
言います|いいます|nói|21
降ります|ふります|rơi (mưa)|21
物価|ぶっか|giá cả, vật giá|21
意見|いけん|ý kiến|21
会議|かいぎ|cuộc họp|21
着ます|きます|mặc (áo)|22
履きます|はきます|mang (giày)|22
被ります|かぶります|đội (mũ)|22
掛けます|かけます|đeo (kính)|22
帽子|ぼうし|mũ|22
予定|よてい|dự định|22
道|みち|con đường|23
信号|しんごう|đèn giao thông|23
橋|はし|cây cầu|23
渡ります|わたります|băng qua|23
曲がります|まがります|rẽ|23
歩きます|あるきます|đi bộ|23
連れて行きます|つれていきます|dẫn đi|24
案内|あんない|hướng dẫn|24
説明|せつめい|giải thích|24
考えます|かんがえます|suy nghĩ|25
通訳|つうやく|thông dịch|25
中止|ちゅうし|đình chỉ, hủy|25
留学|りゅうがく|du học|25
大使館|たいしかん|đại sứ quán|25
`;
/* Hán Việt + nghĩa các chữ Hán thường gặp */
const KANJI_RAW = `
日|nhật|ngày, mặt trời|月|nguyệt|tháng, mặt trăng|火|hỏa|lửa|水|thủy|nước|木|mộc|cây|金|kim|vàng, tiền|土|thổ|đất
曜|diệu|ngày trong tuần|年|niên|năm|時|thời|giờ|分|phân|phút, hiểu|半|bán|một nửa|午|ngọ|trưa|前|tiền|trước|後|hậu|sau
今|kim|bây giờ|毎|mỗi|mỗi|週|chu|tuần|何|hà|gì|人|nhân|người|男|nam|đàn ông|女|nữ|phụ nữ|子|tử|con|友|hữu|bạn
達|đạt|(số nhiều)|先|tiên|trước|生|sinh|sinh ra, sống|学|học|học|校|hiệu|trường|大|đại|to|小|tiểu|nhỏ|中|trung|giữa, trong
高|cao|cao, đắt|安|an|rẻ, yên|新|tân|mới|古|cổ|cũ|長|trường|dài|多|đa|nhiều|少|thiểu|ít|上|thượng|trên|下|hạ|dưới
右|hữu|phải|左|tả|trái|外|ngoại|ngoài|国|quốc|nước|語|ngữ|ngôn ngữ|本|bản|sách, gốc|見|kiến|nhìn|聞|văn|nghe
話|thoại|nói chuyện|読|độc|đọc|書|thư|viết|食|thực|ăn|飲|ẩm|uống|買|mãi|mua|行|hành|đi|来|lai|đến|帰|quy|về
出|xuất|ra|入|nhập|vào|会|hội|gặp, hội|休|hưu|nghỉ|起|khởi|dậy|寝|tẩm|ngủ|電|điện|điện|車|xa|xe|駅|dịch|nhà ga
道|đạo|đường|店|điếm|cửa hàng|山|sơn|núi|川|xuyên|sông|田|điền|ruộng|花|hoa|hoa|雨|vũ|mưa|天|thiên|trời
気|khí|khí|名|danh|tên|白|bạch|trắng|黒|hắc|đen|赤|xích|đỏ|青|thanh|xanh|手|thủ|tay|足|túc|chân|目|mục|mắt
耳|nhĩ|tai|口|khẩu|miệng|頭|đầu|đầu|体|thể|cơ thể|父|phụ|bố|母|mẫu|mẹ|兄|huynh|anh|姉|tỷ|chị|弟|đệ|em trai
妹|muội|em gái|犬|khuyển|chó|猫|miêu|mèo|魚|ngư|cá|肉|nhục|thịt|茶|trà|trà|私|tư|tôi, riêng|社|xã|công ty, xã hội
員|viên|thành viên|医|y|y học|者|giả|người|病|bệnh|bệnh|院|viện|viện|銀|ngân|bạc|英|anh|Anh|辞|từ|từ ngữ
雑|tạp|tạp|誌|chí|ghi chép|写|tả|chụp, sao chép|真|chân|thật|円|viên|yên (tiền)|百|bách|trăm|千|thiên|nghìn
万|vạn|vạn|一|nhất|một|二|nhị|hai|三|tam|ba|四|tứ|bốn|五|ngũ|năm|六|lục|sáu|七|thất|bảy|八|bát|tám|九|cửu|chín
十|thập|mười|教|giáo|dạy|室|thất|phòng|堂|đường|sảnh|事|sự|việc|務|vụ|nhiệm vụ|所|sở|nơi|階|giai|tầng|地|địa|đất
部|bộ|bộ phận|屋|ốc|nhà, phòng|家|gia|nhà|族|tộc|dòng họ|朝|triều|buổi sáng|昼|trú|buổi trưa|晩|vãn|buổi tối
夜|dạ|ban đêm|昨|tạc|hôm qua|明|minh|sáng|春|xuân|mùa xuân|夏|hạ|mùa hè|秋|thu|mùa thu|冬|đông|mùa đông
動|động|chuyển động|仕|sĩ|làm việc|歌|ca|hát|音|âm|âm thanh|楽|nhạc|nhạc, vui|映|ánh|chiếu|画|họa|tranh
旅|lữ|chuyến đi|試|thí|thử|験|nghiệm|kiểm nghiệm|薬|dược|thuốc|熱|nhiệt|nóng, sốt|思|tư|nghĩ|言|ngôn|lời nói
`;
const KANJI = {};
KANJI_RAW.trim().replace(/\n/g, '|').split('|').reduce((acc, x, i, arr) => { if (i % 3 === 0 && arr[i + 2] !== undefined) KANJI[x] = { hv: arr[i + 1], m: arr[i + 2] }; return acc; }, 0);

const isKanji = c => /[一-鿿々]/.test(c);
const isKana = c => /[ぁ-ゖァ-ヺー]/.test(c);
const VOC = VOC_RAW.trim().split('\n').map(l => { const [w, r, m, n] = l.split('|'); return { w, r, m, l: +n }; });

/* ---- căn chỉnh chữ Hán ↔ cách đọc để chỉ gắn furigana lên chữ Hán ---- */
function align(w, r) {
  const segs = []; let i = 0;
  while (i < w.length) { let j = i; const k = isKanji(w[i]); while (j < w.length && isKanji(w[j]) === k) j++; segs.push({ k, s: w.slice(i, j) }); i = j; }
  let pos = 0;
  for (let n = 0; n < segs.length; n++) {
    const sg = segs[n];
    if (!sg.k) { if (r.substr(pos, sg.s.length) !== sg.s) return null; pos += sg.s.length; continue; }
    const nx = segs[n + 1];
    let end;
    if (!nx) end = r.length;
    else { end = r.indexOf(nx.s, pos + 1); if (end < 0) return null; }
    sg.r = r.slice(pos, end); pos = end;
    if (!sg.r) return null;
  }
  return segs;
}
const FEN = {}; // chữ đầu -> các mục (từ dài trước)
function addEntry(w, segs, l) { (FEN[w[0]] = FEN[w[0]] || []).push({ w, segs, l }); }
VOC.forEach(v => {
  let w = v.w, r = v.r;
  if (w[0] === 'お' && r[0] === 'お' && isKanji(w[1] || '')) { w = w.slice(1); r = r.slice(1); }
  if (!isKanji(w[0])) return;
  const segs = align(w, r) || [{ k: true, s: w, r }];
  addEntry(w, segs, v.l);
  // dạng rút gọn tới chữ Hán cuối cùng (để bắt các dạng chia: 食べて, 高く ...)
  let last = segs.length - 1; while (last >= 0 && !segs[last].k) last--;
  if (last >= 0 && last < segs.length - 1) { const hs = segs.slice(0, last + 1); addEntry(hs.map(s => s.s).join(''), hs, v.l); }
});
Object.values(FEN).forEach(a => a.sort((x, y) => y.w.length - x.w.length));
window.__missingFuri = new Set();

let FURI_MODE = 'auto'; // 'auto' | 'all'
function furiShown(l) {
  if (FURI_MODE === 'all') return true;
  const c = (typeof S !== 'undefined' && S && S.cur != null) ? S.cur : 0;
  return c <= 2 || l >= lessonStart(c) - 6;
}
const rubyH = (k, r) => `<ruby>${esc(k)}<rt>${esc(r)}</rt></ruby>`;
/* furi(text): chuyển văn bản Nhật thành HTML có furigana tự động; {漢字|よみ} = ghi rõ cách đọc */
function furi(text) {
  text = String(text); let out = '', i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '{') {
      const j = text.indexOf('}', i); const [k, r] = text.slice(i + 1, j).split('|');
      out += rubyH(k, r); i = j + 1; continue;
    }
    if (c === '＿') { out += '<span class="blank">　</span>'; i++; continue; }
    if (c === '\n') { out += '<br>'; i++; continue; }
    if (isKanji(c)) {
      const hit = (FEN[c] || []).find(e => text.startsWith(e.w, i));
      if (hit) {
        if (furiShown(hit.l)) out += hit.segs.map(s => s.k ? rubyH(s.s, s.r) : esc(s.s)).join(''); else out += esc(hit.w);
        i += hit.w.length; continue;
      }
      window.__missingFuri.add(c);
    }
    out += esc(c); i++;
  }
  return out;
}
const plain = t => String(t).replace(/\{([^|}]+)\|[^}]*\}/g, '$1');
