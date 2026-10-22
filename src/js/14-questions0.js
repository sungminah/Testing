'use strict';
/* ===== Chương mở đầu (bài 0): quy tắc romaji & chữ cái. Đáp án bằng romaji / kana. ===== */
Q('m', 1, 0, '「は」は じょしの ときは ローマ字で なんと よみますか。', 'Khi 「は」 là trợ từ (chủ đề), nó đọc là gì?', ['wa', 'ha', 'ba', 'pa'], 'Trợ từ 「は」 đọc là "wa" (わたしは = watashi wa). Trong từ bình thường nó vẫn là "ha" (はな = hana).', 'わたしは|watashi wa|tôi (chủ đề)', 'wa (đúng)|ha|ba|pa');
Q('m', 1, 0, 'じょしの 「を」は ローマ字で なんと よみますか。', 'Trợ từ 「を」 đọc là gì?', ['o', 'wo', 'u', 'wa'], 'Trợ từ 「を」 đọc là "o" (Hepburn). Trên bàn phím mới gõ "wo".', 'を|o|trợ từ tân ngữ', 'o (đúng)|wo (cách gõ phím)|u|wa');
Q('m', 2, 0, '「きって」を ローマ字で かくと どれですか。', 'Viết 「きって」 (con tem) bằng romaji.', ['kitte', 'kite', 'kito', 'kitsute'], 'Chữ 「っ」 nhỏ nhân đôi phụ âm đứng sau nó: きって = ki-t-te → "kitte".', 'きって|kitte|con tem', 'kitte|kite (thiếu っ)|kito|kitsute');
Q('m', 2, 0, '「コーヒー」を ローマ字で かくと どれですか。', 'Viết 「コーヒー」 bằng romaji.', ['koohii', 'kohi', 'koohi', 'kouhii'], 'Dấu 「ー」 trong katakana kéo dài nguyên âm: コー = koo, ヒー = hii.', 'コーヒー|koohii|cà phê', 'koohii|kohi (thiếu kéo dài)|koohi|kouhii');
Q('m', 2, 0, '「おおきい」を ローマ字で かくと どれですか。', 'Viết 「おおきい」 (to lớn) bằng romaji.', ['ookii', 'okii', 'ookki', 'ookiii'], 'おお kéo dài nguyên âm o → "oo"; きい → "kii".', 'おおきい|ookii|to lớn', 'ookii|okii (thiếu kéo dài)|ookki|ookiii');
Q('m', 1, 0, '「ん」は ローマ字で なんと かきますか。', 'Chữ 「ん」 viết bằng romaji là gì?', ['n', 'm', 'ng', 'nn'], '「ん」 luôn viết là "n" (さんぽ = sanpo, ほん = hon).', 'ほん|hon|quyển sách', 'n|m|ng|nn');
Q('m', 3, 0, '「しゅくだい」を ローマ字で かくと どれですか。', 'Viết 「しゅくだい」 (bài tập) bằng romaji.', ['shukudai', 'sukudai', 'shikudai', 'shyukudai'], 'しゅ = shu (し + ゅ nhỏ). Không viết "shyu".', 'しゅくだい|shukudai|bài tập', 'shukudai|sukudai|shikudai|shyukudai');
Q('m', 3, 0, '「ちょっと」を ローマ字で かくと どれですか。', 'Viết 「ちょっと」 (một chút) bằng romaji.', ['chotto', 'choto', 'chyotto', 'tyotto'], 'ちょ = cho; っと nhân đôi t → "chotto".', 'ちょっと|chotto|một chút', 'chotto|choto|chyotto|tyotto');
