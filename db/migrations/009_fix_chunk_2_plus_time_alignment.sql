-- 009_fix_chunk_2_plus_time_alignment.sql
-- PURPOSE: Correct all chunk-2-and-later timestamps created from misleading filename offsets.
-- SOURCE FACT: Audio was split into 180-second chunks, while several filenames encode 300-second-looking offsets.
-- SCOPE: 198 affected candidate segments from the original 006/007 seeds.
-- SAFE MATCH KEY: YouTube video ID + original stored start/end + transcript JSON filename.
-- IMPORTANT: Apply this INSTEAD OF 008_correct_chunk_offsets.sql.
-- PREREQUISITES: 001–007 have already run; 008 should not be used.

begin;

create temp table _chunk_time_fix (
  youtube_video_id text not null,
  old_start_seconds integer not null,
  old_end_seconds integer not null,
  transcript_source_file text not null,
  new_start_seconds integer not null,
  new_end_seconds integer not null,
  new_segment_key text not null,
  new_timestamp_label text not null,
  new_start_url text not null,
  primary key (youtube_video_id, old_start_seconds, old_end_seconds, transcript_source_file)
) on commit drop;

insert into _chunk_time_fix (
  youtube_video_id, old_start_seconds, old_end_seconds, transcript_source_file,
  new_start_seconds, new_end_seconds, new_segment_key, new_timestamp_label, new_start_url
) values
('1FN_xHL-u-Q', 315, 370, '1FN_xHL-u-Q__chunk_0002__000300-000600.json', 195, 250, '1FN_xHL-u-Q:195:250', '3:15–4:10', 'https://www.youtube.com/watch?v=1FN_xHL-u-Q&t=195s'),
('1FN_xHL-u-Q', 370, 404, '1FN_xHL-u-Q__chunk_0002__000300-000600.json', 250, 284, '1FN_xHL-u-Q:250:284', '4:10–4:44', 'https://www.youtube.com/watch?v=1FN_xHL-u-Q&t=250s'),
('1FN_xHL-u-Q', 431, 471, '1FN_xHL-u-Q__chunk_0002__000300-000600.json', 311, 351, '1FN_xHL-u-Q:311:351', '5:11–5:51', 'https://www.youtube.com/watch?v=1FN_xHL-u-Q&t=311s'),
('1FN_xHL-u-Q', 600, 658, '1FN_xHL-u-Q__chunk_0003__000600-000829.json', 360, 418, '1FN_xHL-u-Q:360:418', '6:00–6:58', 'https://www.youtube.com/watch?v=1FN_xHL-u-Q&t=360s'),
('1FN_xHL-u-Q', 737, 745, '1FN_xHL-u-Q__chunk_0003__000600-000829.json', 497, 505, '1FN_xHL-u-Q:497:505', '8:17–8:25', 'https://www.youtube.com/watch?v=1FN_xHL-u-Q&t=497s'),
('1QFHZfQzZ0E', 316, 351, '1QFHZfQzZ0E__chunk_0002__000300-000600.json', 196, 231, '1QFHZfQzZ0E:196:231', '3:16–3:51', 'https://www.youtube.com/watch?v=1QFHZfQzZ0E&t=196s'),
('1QFHZfQzZ0E', 607, 621, '1QFHZfQzZ0E__chunk_0003__000600-000900.json', 367, 381, '1QFHZfQzZ0E:367:381', '6:07–6:21', 'https://www.youtube.com/watch?v=1QFHZfQzZ0E&t=367s'),
('1QFHZfQzZ0E', 665, 684, '1QFHZfQzZ0E__chunk_0003__000600-000900.json', 425, 444, '1QFHZfQzZ0E:425:444', '7:05–7:24', 'https://www.youtube.com/watch?v=1QFHZfQzZ0E&t=425s'),
('1QFHZfQzZ0E', 707, 717, '1QFHZfQzZ0E__chunk_0003__000600-000900.json', 467, 477, '1QFHZfQzZ0E:467:477', '7:47–7:57', 'https://www.youtube.com/watch?v=1QFHZfQzZ0E&t=467s'),
('1QFHZfQzZ0E', 768, 779, '1QFHZfQzZ0E__chunk_0003__000600-000900.json', 528, 539, '1QFHZfQzZ0E:528:539', '8:48–8:59', 'https://www.youtube.com/watch?v=1QFHZfQzZ0E&t=528s'),
('1R8WiILKtJs', 381, 424, '1R8WiILKtJs__chunk_0002__000300-000600.json', 261, 304, '1R8WiILKtJs:261:304', '4:21–5:04', 'https://www.youtube.com/watch?v=1R8WiILKtJs&t=261s'),
('1R8WiILKtJs', 424, 455, '1R8WiILKtJs__chunk_0002__000300-000600.json', 304, 335, '1R8WiILKtJs:304:335', '5:04–5:35', 'https://www.youtube.com/watch?v=1R8WiILKtJs&t=304s'),
('1R8WiILKtJs', 614, 626, '1R8WiILKtJs__chunk_0003__000600-000628.json', 374, 386, '1R8WiILKtJs:374:386', '6:14–6:26', 'https://www.youtube.com/watch?v=1R8WiILKtJs&t=374s'),
('3bAWqnjPfV4', 354, 407, '3bAWqnjPfV4__chunk_0002__000300-000600.json', 234, 287, '3bAWqnjPfV4:234:287', '3:54–4:47', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=234s'),
('3bAWqnjPfV4', 392, 431, '3bAWqnjPfV4__chunk_0002__000300-000600.json', 272, 311, '3bAWqnjPfV4:272:311', '4:32–5:11', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=272s'),
('3bAWqnjPfV4', 431, 480, '3bAWqnjPfV4__chunk_0002__000300-000600.json', 311, 360, '3bAWqnjPfV4:311:360', '5:11–6:00', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=311s'),
('3bAWqnjPfV4', 600, 635, '3bAWqnjPfV4__chunk_0003__000600-000900.json', 360, 395, '3bAWqnjPfV4:360:395', '6:00–6:35', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=360s'),
('3bAWqnjPfV4', 644, 684, '3bAWqnjPfV4__chunk_0003__000600-000900.json', 404, 444, '3bAWqnjPfV4:404:444', '6:44–7:24', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=404s'),
('3bAWqnjPfV4', 711, 758, '3bAWqnjPfV4__chunk_0003__000600-000900.json', 471, 518, '3bAWqnjPfV4:471:518', '7:51–8:38', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=471s'),
('3bAWqnjPfV4', 943, 998, '3bAWqnjPfV4__chunk_0004__000900-001200.json', 583, 638, '3bAWqnjPfV4:583:638', '9:43–10:38', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=583s'),
('3bAWqnjPfV4', 1203, 1260, '3bAWqnjPfV4__chunk_0005__001200-001500.json', 723, 780, '3bAWqnjPfV4:723:780', '12:03–13:00', 'https://www.youtube.com/watch?v=3bAWqnjPfV4&t=723s'),
('4Hkm2kBu_mE', 399, 445, '4Hkm2kBu_mE__chunk_0002__000300-000600.json', 279, 325, '4Hkm2kBu_mE:279:325', '4:39–5:25', 'https://www.youtube.com/watch?v=4Hkm2kBu_mE&t=279s'),
('4Hkm2kBu_mE', 641, 700, '4Hkm2kBu_mE__chunk_0003__000600-000900.json', 401, 460, '4Hkm2kBu_mE:401:460', '6:41–7:40', 'https://www.youtube.com/watch?v=4Hkm2kBu_mE&t=401s'),
('517uzXPQ3xg', 369, 394, '517uzXPQ3xg__chunk_0002__000300-000600.json', 249, 274, '517uzXPQ3xg:249:274', '4:09–4:34', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=249s'),
('517uzXPQ3xg', 394, 437, '517uzXPQ3xg__chunk_0002__000300-000600.json', 274, 317, '517uzXPQ3xg:274:317', '4:34–5:17', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=274s'),
('517uzXPQ3xg', 639, 664, '517uzXPQ3xg__chunk_0003__000600-000900.json', 399, 424, '517uzXPQ3xg:399:424', '6:39–7:04', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=399s'),
('517uzXPQ3xg', 900, 938, '517uzXPQ3xg__chunk_0004__000900-001200.json', 540, 578, '517uzXPQ3xg:540:578', '9:00–9:38', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=540s'),
('517uzXPQ3xg', 950, 970, '517uzXPQ3xg__chunk_0004__000900-001200.json', 590, 610, '517uzXPQ3xg:590:610', '9:50–10:10', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=590s'),
('517uzXPQ3xg', 977, 1035, '517uzXPQ3xg__chunk_0004__000900-001200.json', 617, 675, '517uzXPQ3xg:617:675', '10:17–11:15', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=617s'),
('517uzXPQ3xg', 1026, 1082, '517uzXPQ3xg__chunk_0004__000900-001200.json', 666, 722, '517uzXPQ3xg:666:722', '11:06–12:02', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=666s'),
('517uzXPQ3xg', 1225, 1266, '517uzXPQ3xg__chunk_0005__001200-001500.json', 745, 786, '517uzXPQ3xg:745:786', '12:25–13:06', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=745s'),
('517uzXPQ3xg', 1291, 1341, '517uzXPQ3xg__chunk_0005__001200-001500.json', 811, 861, '517uzXPQ3xg:811:861', '13:31–14:21', 'https://www.youtube.com/watch?v=517uzXPQ3xg&t=811s'),
('69_-GJO5Z9M', 312, 347, '69_-GJO5Z9M__chunk_0002__000300-000600.json', 192, 227, '69_-GJO5Z9M:192:227', '3:12–3:47', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=192s'),
('69_-GJO5Z9M', 350, 375, '69_-GJO5Z9M__chunk_0002__000300-000600.json', 230, 255, '69_-GJO5Z9M:230:255', '3:50–4:15', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=230s'),
('69_-GJO5Z9M', 410, 433, '69_-GJO5Z9M__chunk_0002__000300-000600.json', 290, 313, '69_-GJO5Z9M:290:313', '4:50–5:13', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=290s'),
('69_-GJO5Z9M', 437, 480, '69_-GJO5Z9M__chunk_0002__000300-000600.json', 317, 360, '69_-GJO5Z9M:317:360', '5:17–6:00', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=317s'),
('69_-GJO5Z9M', 630, 669, '69_-GJO5Z9M__chunk_0003__000600-000900.json', 390, 429, '69_-GJO5Z9M:390:429', '6:30–7:09', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=390s'),
('69_-GJO5Z9M', 669, 724, '69_-GJO5Z9M__chunk_0003__000600-000900.json', 429, 484, '69_-GJO5Z9M:429:484', '7:09–8:04', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=429s'),
('69_-GJO5Z9M', 1027, 1080, '69_-GJO5Z9M__chunk_0004__000900-001200.json', 667, 720, '69_-GJO5Z9M:667:720', '11:07–12:00', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=667s'),
('69_-GJO5Z9M', 1645, 1690, '69_-GJO5Z9M__chunk_0006__001500-001800.json', 1045, 1090, '69_-GJO5Z9M:1045:1090', '17:25–18:10', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=1045s'),
('69_-GJO5Z9M', 1844, 1888, '69_-GJO5Z9M__chunk_0007__001800-002027.json', 1124, 1168, '69_-GJO5Z9M:1124:1168', '18:44–19:28', 'https://www.youtube.com/watch?v=69_-GJO5Z9M&t=1124s'),
('7YvI9La1T2U', 327, 345, '7YvI9La1T2U__chunk_0002__000300-000600.json', 207, 225, '7YvI9La1T2U:207:225', '3:27–3:45', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=207s'),
('7YvI9La1T2U', 378, 411, '7YvI9La1T2U__chunk_0002__000300-000600.json', 258, 291, '7YvI9La1T2U:258:291', '4:18–4:51', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=258s'),
('7YvI9La1T2U', 467, 480, '7YvI9La1T2U__chunk_0002__000300-000600.json', 347, 360, '7YvI9La1T2U:347:360', '5:47–6:00', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=347s'),
('7YvI9La1T2U', 600, 648, '7YvI9La1T2U__chunk_0003__000600-000801.json', 360, 408, '7YvI9La1T2U:360:408', '6:00–6:48', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=360s'),
('7YvI9La1T2U', 631, 679, '7YvI9La1T2U__chunk_0003__000600-000801.json', 391, 439, '7YvI9La1T2U:391:439', '6:31–7:19', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=391s'),
('7YvI9La1T2U', 660, 711, '7YvI9La1T2U__chunk_0003__000600-000801.json', 420, 471, '7YvI9La1T2U:420:471', '7:00–7:51', 'https://www.youtube.com/watch?v=7YvI9La1T2U&t=420s'),
('9evdTcBy5Hc', 362, 391, '9evdTcBy5Hc__chunk_0002__000300-000600.json', 242, 271, '9evdTcBy5Hc:242:271', '4:02–4:31', 'https://www.youtube.com/watch?v=9evdTcBy5Hc&t=242s'),
('AvUsPxVHSiA', 468, 478, 'AvUsPxVHSiA__chunk_0002__000300-000600.json', 348, 358, 'AvUsPxVHSiA:348:358', '5:48–5:58', 'https://www.youtube.com/watch?v=AvUsPxVHSiA&t=348s'),
('AvUsPxVHSiA', 600, 622, 'AvUsPxVHSiA__chunk_0003__000600-000700.json', 360, 382, 'AvUsPxVHSiA:360:382', '6:00–6:22', 'https://www.youtube.com/watch?v=AvUsPxVHSiA&t=360s'),
('AvUsPxVHSiA', 631, 650, 'AvUsPxVHSiA__chunk_0003__000600-000700.json', 391, 410, 'AvUsPxVHSiA:391:410', '6:31–6:50', 'https://www.youtube.com/watch?v=AvUsPxVHSiA&t=391s'),
('CvWVNMybMeQ', 310, 354, 'CvWVNMybMeQ__chunk_0002__000300-000600.json', 190, 234, 'CvWVNMybMeQ:190:234', '3:10–3:54', 'https://www.youtube.com/watch?v=CvWVNMybMeQ&t=190s'),
('CvWVNMybMeQ', 354, 389, 'CvWVNMybMeQ__chunk_0002__000300-000600.json', 234, 269, 'CvWVNMybMeQ:234:269', '3:54–4:29', 'https://www.youtube.com/watch?v=CvWVNMybMeQ&t=234s'),
('CvWVNMybMeQ', 390, 450, 'CvWVNMybMeQ__chunk_0002__000300-000600.json', 270, 330, 'CvWVNMybMeQ:270:330', '4:30–5:30', 'https://www.youtube.com/watch?v=CvWVNMybMeQ&t=270s'),
('CvWVNMybMeQ', 476, 479, 'CvWVNMybMeQ__chunk_0002__000300-000600.json', 356, 359, 'CvWVNMybMeQ:356:359', '5:56–5:59', 'https://www.youtube.com/watch?v=CvWVNMybMeQ&t=356s'),
('CvWVNMybMeQ', 604, 646, 'CvWVNMybMeQ__chunk_0003__000600-000702.json', 364, 406, 'CvWVNMybMeQ:364:406', '6:04–6:46', 'https://www.youtube.com/watch?v=CvWVNMybMeQ&t=364s'),
('E66s-OJI0m0', 352, 386, 'E66s-OJI0m0__chunk_0002__000300-000600.json', 232, 266, 'E66s-OJI0m0:232:266', '3:52–4:26', 'https://www.youtube.com/watch?v=E66s-OJI0m0&t=232s'),
('E66s-OJI0m0', 435, 480, 'E66s-OJI0m0__chunk_0002__000300-000600.json', 315, 360, 'E66s-OJI0m0:315:360', '5:15–6:00', 'https://www.youtube.com/watch?v=E66s-OJI0m0&t=315s'),
('EKeY_En_46g', 317, 351, 'EKeY_En_46g__chunk_0002__000300-000353.json', 197, 231, 'EKeY_En_46g:197:231', '3:17–3:51', 'https://www.youtube.com/watch?v=EKeY_En_46g&t=197s'),
('ETEads8iW24', 358, 386, 'ETEads8iW24__chunk_0002__000300-000557.json', 238, 266, 'ETEads8iW24:238:266', '3:58–4:26', 'https://www.youtube.com/watch?v=ETEads8iW24&t=238s'),
('Eri2MJKYxf8', 308, 339, 'Eri2MJKYxf8__chunk_0002__000300-000600.json', 188, 219, 'Eri2MJKYxf8:188:219', '3:08–3:39', 'https://www.youtube.com/watch?v=Eri2MJKYxf8&t=188s'),
('Eri2MJKYxf8', 343, 373, 'Eri2MJKYxf8__chunk_0002__000300-000600.json', 223, 253, 'Eri2MJKYxf8:223:253', '3:43–4:13', 'https://www.youtube.com/watch?v=Eri2MJKYxf8&t=223s'),
('Eri2MJKYxf8', 386, 409, 'Eri2MJKYxf8__chunk_0002__000300-000600.json', 266, 289, 'Eri2MJKYxf8:266:289', '4:26–4:49', 'https://www.youtube.com/watch?v=Eri2MJKYxf8&t=266s'),
('Eri2MJKYxf8', 684, 719, 'Eri2MJKYxf8__chunk_0003__000600-000845.json', 444, 479, 'Eri2MJKYxf8:444:479', '7:24–7:59', 'https://www.youtube.com/watch?v=Eri2MJKYxf8&t=444s'),
('F3DjMch3ex0', 604, 637, 'F3DjMch3ex0__chunk_0003__000600-000636.json', 364, 397, 'F3DjMch3ex0:364:397', '6:04–6:37', 'https://www.youtube.com/watch?v=F3DjMch3ex0&t=364s'),
('Fic0zak8K5Y', 315, 368, 'Fic0zak8K5Y__chunk_0002__000300-000600.json', 195, 248, 'Fic0zak8K5Y:195:248', '3:15–4:08', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=195s'),
('Fic0zak8K5Y', 429, 450, 'Fic0zak8K5Y__chunk_0002__000300-000600.json', 309, 330, 'Fic0zak8K5Y:309:330', '5:09–5:30', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=309s'),
('Fic0zak8K5Y', 463, 484, 'Fic0zak8K5Y__chunk_0002__000300-000600.json', 343, 364, 'Fic0zak8K5Y:343:364', '5:43–6:04', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=343s'),
('Fic0zak8K5Y', 684, 708, 'Fic0zak8K5Y__chunk_0003__000600-000900.json', 444, 468, 'Fic0zak8K5Y:444:468', '7:24–7:48', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=444s'),
('Fic0zak8K5Y', 772, 780, 'Fic0zak8K5Y__chunk_0003__000600-000900.json', 532, 540, 'Fic0zak8K5Y:532:540', '8:52–9:00', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=532s'),
('Fic0zak8K5Y', 900, 946, 'Fic0zak8K5Y__chunk_0004__000900-001057.json', 540, 586, 'Fic0zak8K5Y:540:586', '9:00–9:46', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=540s'),
('Fic0zak8K5Y', 946, 988, 'Fic0zak8K5Y__chunk_0004__000900-001057.json', 586, 628, 'Fic0zak8K5Y:586:628', '9:46–10:28', 'https://www.youtube.com/watch?v=Fic0zak8K5Y&t=586s'),
('G3MAdfyihhw', 305, 351, 'G3MAdfyihhw__chunk_0002__000300-000600.json', 185, 231, 'G3MAdfyihhw:185:231', '3:05–3:51', 'https://www.youtube.com/watch?v=G3MAdfyihhw&t=185s'),
('G3MAdfyihhw', 369, 404, 'G3MAdfyihhw__chunk_0002__000300-000600.json', 249, 284, 'G3MAdfyihhw:249:284', '4:09–4:44', 'https://www.youtube.com/watch?v=G3MAdfyihhw&t=249s'),
('G3MAdfyihhw', 414, 432, 'G3MAdfyihhw__chunk_0002__000300-000600.json', 294, 312, 'G3MAdfyihhw:294:312', '4:54–5:12', 'https://www.youtube.com/watch?v=G3MAdfyihhw&t=294s'),
('G3MAdfyihhw', 637, 665, 'G3MAdfyihhw__chunk_0003__000600-000900.json', 397, 425, 'G3MAdfyihhw:397:425', '6:37–7:05', 'https://www.youtube.com/watch?v=G3MAdfyihhw&t=397s'),
('G3MAdfyihhw', 900, 933, 'G3MAdfyihhw__chunk_0004__000900-001055.json', 540, 573, 'G3MAdfyihhw:540:573', '9:00–9:33', 'https://www.youtube.com/watch?v=G3MAdfyihhw&t=540s'),
('Hk97yKXBHVw', 300, 347, 'Hk97yKXBHVw__chunk_0002__000300-000438.json', 180, 227, 'Hk97yKXBHVw:180:227', '3:00–3:47', 'https://www.youtube.com/watch?v=Hk97yKXBHVw&t=180s'),
('IDny7YYxobE', 328, 360, 'IDny7YYxobE__chunk_0002__000300-000600.json', 208, 240, 'IDny7YYxobE:208:240', '3:28–4:00', 'https://www.youtube.com/watch?v=IDny7YYxobE&t=208s'),
('IDny7YYxobE', 600, 636, 'IDny7YYxobE__chunk_0003__000600-000900.json', 360, 396, 'IDny7YYxobE:360:396', '6:00–6:36', 'https://www.youtube.com/watch?v=IDny7YYxobE&t=360s'),
('IJxLAyBdIM4', 429, 480, 'IJxLAyBdIM4__chunk_0002__000300-000600.json', 309, 360, 'IJxLAyBdIM4:309:360', '5:09–6:00', 'https://www.youtube.com/watch?v=IJxLAyBdIM4&t=309s'),
('IJxLAyBdIM4', 690, 714, 'IJxLAyBdIM4__chunk_0003__000600-000809.json', 450, 474, 'IJxLAyBdIM4:450:474', '7:30–7:54', 'https://www.youtube.com/watch?v=IJxLAyBdIM4&t=450s'),
('IL4cmuWiQUk', 300, 336, 'IL4cmuWiQUk__chunk_0002__000300-000358.json', 180, 216, 'IL4cmuWiQUk:180:216', '3:00–3:36', 'https://www.youtube.com/watch?v=IL4cmuWiQUk&t=180s'),
('IL4cmuWiQUk', 337, 358, 'IL4cmuWiQUk__chunk_0002__000300-000358.json', 217, 238, 'IL4cmuWiQUk:217:238', '3:37–3:58', 'https://www.youtube.com/watch?v=IL4cmuWiQUk&t=217s'),
('IZhlanwZPS8', 920, 950, 'IZhlanwZPS8__chunk_0004__000900-001052.json', 560, 590, 'IZhlanwZPS8:560:590', '9:20–9:50', 'https://www.youtube.com/watch?v=IZhlanwZPS8&t=560s'),
('KAiPJsuDM50', 313, 365, 'KAiPJsuDM50__chunk_0002__000300-000600.json', 193, 245, 'KAiPJsuDM50:193:245', '3:13–4:05', 'https://www.youtube.com/watch?v=KAiPJsuDM50&t=193s'),
('KAiPJsuDM50', 351, 399, 'KAiPJsuDM50__chunk_0002__000300-000600.json', 231, 279, 'KAiPJsuDM50:231:279', '3:51–4:39', 'https://www.youtube.com/watch?v=KAiPJsuDM50&t=231s'),
('KAiPJsuDM50', 380, 431, 'KAiPJsuDM50__chunk_0002__000300-000600.json', 260, 311, 'KAiPJsuDM50:260:311', '4:20–5:11', 'https://www.youtube.com/watch?v=KAiPJsuDM50&t=260s'),
('KAiPJsuDM50', 424, 480, 'KAiPJsuDM50__chunk_0002__000300-000600.json', 304, 360, 'KAiPJsuDM50:304:360', '5:04–6:00', 'https://www.youtube.com/watch?v=KAiPJsuDM50&t=304s'),
('KAiPJsuDM50', 601, 618, 'KAiPJsuDM50__chunk_0003__000600-000640.json', 361, 378, 'KAiPJsuDM50:361:378', '6:01–6:18', 'https://www.youtube.com/watch?v=KAiPJsuDM50&t=361s'),
('KCh3z314r5M', 626, 639, 'KCh3z314r5M__chunk_0003__000600-000740.json', 386, 399, 'KCh3z314r5M:386:399', '6:26–6:39', 'https://www.youtube.com/watch?v=KCh3z314r5M&t=386s'),
('Kobf2zvvvbk', 449, 478, 'Kobf2zvvvbk__chunk_0002__000300-000600.json', 329, 358, 'Kobf2zvvvbk:329:358', '5:29–5:58', 'https://www.youtube.com/watch?v=Kobf2zvvvbk&t=329s'),
('Kobf2zvvvbk', 641, 681, 'Kobf2zvvvbk__chunk_0003__000600-000900.json', 401, 441, 'Kobf2zvvvbk:401:441', '6:41–7:21', 'https://www.youtube.com/watch?v=Kobf2zvvvbk&t=401s'),
('Kobf2zvvvbk', 686, 739, 'Kobf2zvvvbk__chunk_0003__000600-000900.json', 446, 499, 'Kobf2zvvvbk:446:499', '7:26–8:19', 'https://www.youtube.com/watch?v=Kobf2zvvvbk&t=446s'),
('Kobf2zvvvbk', 726, 777, 'Kobf2zvvvbk__chunk_0003__000600-000900.json', 486, 537, 'Kobf2zvvvbk:486:537', '8:06–8:57', 'https://www.youtube.com/watch?v=Kobf2zvvvbk&t=486s'),
('Kobf2zvvvbk', 900, 956, 'Kobf2zvvvbk__chunk_0004__000900-001058.json', 540, 596, 'Kobf2zvvvbk:540:596', '9:00–9:56', 'https://www.youtube.com/watch?v=Kobf2zvvvbk&t=540s'),
('MC71NLSy3Dg', 312, 335, 'MC71NLSy3Dg__chunk_0002__000300-000600.json', 192, 215, 'MC71NLSy3Dg:192:215', '3:12–3:35', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=192s'),
('MC71NLSy3Dg', 403, 441, 'MC71NLSy3Dg__chunk_0002__000300-000600.json', 283, 321, 'MC71NLSy3Dg:283:321', '4:43–5:21', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=283s'),
('MC71NLSy3Dg', 466, 481, 'MC71NLSy3Dg__chunk_0002__000300-000600.json', 346, 361, 'MC71NLSy3Dg:346:361', '5:46–6:01', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=346s'),
('MC71NLSy3Dg', 657, 674, 'MC71NLSy3Dg__chunk_0003__000600-000900.json', 417, 434, 'MC71NLSy3Dg:417:434', '6:57–7:14', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=417s'),
('MC71NLSy3Dg', 682, 725, 'MC71NLSy3Dg__chunk_0003__000600-000900.json', 442, 485, 'MC71NLSy3Dg:442:485', '7:22–8:05', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=442s'),
('MC71NLSy3Dg', 743, 764, 'MC71NLSy3Dg__chunk_0003__000600-000900.json', 503, 524, 'MC71NLSy3Dg:503:524', '8:23–8:44', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=503s'),
('MC71NLSy3Dg', 935, 962, 'MC71NLSy3Dg__chunk_0004__000900-001050.json', 575, 602, 'MC71NLSy3Dg:575:602', '9:35–10:02', 'https://www.youtube.com/watch?v=MC71NLSy3Dg&t=575s'),
('MKr5VVrQIWQ', 372, 423, 'MKr5VVrQIWQ__chunk_0002__000300-000600.json', 252, 303, 'MKr5VVrQIWQ:252:303', '4:12–5:03', 'https://www.youtube.com/watch?v=MKr5VVrQIWQ&t=252s'),
('MRtvUvg5Afs', 379, 388, 'MRtvUvg5Afs__chunk_0002__000300-000431.json', 259, 268, 'MRtvUvg5Afs:259:268', '4:19–4:28', 'https://www.youtube.com/watch?v=MRtvUvg5Afs&t=259s'),
('NZVSQRzo48o', 429, 452, 'NZVSQRzo48o__chunk_0002__000300-000545.json', 309, 332, 'NZVSQRzo48o:309:332', '5:09–5:32', 'https://www.youtube.com/watch?v=NZVSQRzo48o&t=309s'),
('PTWDtHFcwIA', 300, 356, 'PTWDtHFcwIA__chunk_0002__000300-000504.json', 180, 236, 'PTWDtHFcwIA:180:236', '3:00–3:56', 'https://www.youtube.com/watch?v=PTWDtHFcwIA&t=180s'),
('PTWDtHFcwIA', 334, 376, 'PTWDtHFcwIA__chunk_0002__000300-000504.json', 214, 256, 'PTWDtHFcwIA:214:256', '3:34–4:16', 'https://www.youtube.com/watch?v=PTWDtHFcwIA&t=214s'),
('QJL4rdBYbts', 359, 376, 'QJL4rdBYbts__chunk_0002__000300-000519.json', 239, 256, 'QJL4rdBYbts:239:256', '3:59–4:16', 'https://www.youtube.com/watch?v=QJL4rdBYbts&t=239s'),
('QJL4rdBYbts', 407, 437, 'QJL4rdBYbts__chunk_0002__000300-000519.json', 287, 317, 'QJL4rdBYbts:287:317', '4:47–5:17', 'https://www.youtube.com/watch?v=QJL4rdBYbts&t=287s'),
('Qa1Zj_L3x8c', 313, 362, 'Qa1Zj_L3x8c__chunk_0002__000300-000600.json', 193, 242, 'Qa1Zj_L3x8c:193:242', '3:13–4:02', 'https://www.youtube.com/watch?v=Qa1Zj_L3x8c&t=193s'),
('Qa1Zj_L3x8c', 469, 480, 'Qa1Zj_L3x8c__chunk_0002__000300-000600.json', 349, 360, 'Qa1Zj_L3x8c:349:360', '5:49–6:00', 'https://www.youtube.com/watch?v=Qa1Zj_L3x8c&t=349s'),
('Qa1Zj_L3x8c', 608, 637, 'Qa1Zj_L3x8c__chunk_0003__000600-000900.json', 368, 397, 'Qa1Zj_L3x8c:368:397', '6:08–6:37', 'https://www.youtube.com/watch?v=Qa1Zj_L3x8c&t=368s'),
('Qa1Zj_L3x8c', 678, 704, 'Qa1Zj_L3x8c__chunk_0003__000600-000900.json', 438, 464, 'Qa1Zj_L3x8c:438:464', '7:18–7:44', 'https://www.youtube.com/watch?v=Qa1Zj_L3x8c&t=438s'),
('Qa1Zj_L3x8c', 955, 967, 'Qa1Zj_L3x8c__chunk_0004__000900-001008.json', 595, 607, 'Qa1Zj_L3x8c:595:607', '9:55–10:07', 'https://www.youtube.com/watch?v=Qa1Zj_L3x8c&t=595s'),
('Qs-tFga-tVg', 305, 357, 'Qs-tFga-tVg__chunk_0002__000300-000511.json', 185, 237, 'Qs-tFga-tVg:185:237', '3:05–3:57', 'https://www.youtube.com/watch?v=Qs-tFga-tVg&t=185s'),
('Qs-tFga-tVg', 328, 376, 'Qs-tFga-tVg__chunk_0002__000300-000511.json', 208, 256, 'Qs-tFga-tVg:208:256', '3:28–4:16', 'https://www.youtube.com/watch?v=Qs-tFga-tVg&t=208s'),
('RToMe8Z6T2k', 360, 381, 'RToMe8Z6T2k__chunk_0002__000300-000600.json', 240, 261, 'RToMe8Z6T2k:240:261', '4:00–4:21', 'https://www.youtube.com/watch?v=RToMe8Z6T2k&t=240s'),
('RToMe8Z6T2k', 600, 645, 'RToMe8Z6T2k__chunk_0003__000600-000830.json', 360, 405, 'RToMe8Z6T2k:360:405', '6:00–6:45', 'https://www.youtube.com/watch?v=RToMe8Z6T2k&t=360s'),
('Rpmg27DcOoU', 314, 365, 'Rpmg27DcOoU__chunk_0002__000300-000535.json', 194, 245, 'Rpmg27DcOoU:194:245', '3:14–4:05', 'https://www.youtube.com/watch?v=Rpmg27DcOoU&t=194s'),
('Rpmg27DcOoU', 362, 406, 'Rpmg27DcOoU__chunk_0002__000300-000535.json', 242, 286, 'Rpmg27DcOoU:242:286', '4:02–4:46', 'https://www.youtube.com/watch?v=Rpmg27DcOoU&t=242s'),
('Rpmg27DcOoU', 420, 453, 'Rpmg27DcOoU__chunk_0002__000300-000535.json', 300, 333, 'Rpmg27DcOoU:300:333', '5:00–5:33', 'https://www.youtube.com/watch?v=Rpmg27DcOoU&t=300s'),
('S-xMtLyNw1w', 327, 382, 'S-xMtLyNw1w__chunk_0002__000300-000600.json', 207, 262, 'S-xMtLyNw1w:207:262', '3:27–4:22', 'https://www.youtube.com/watch?v=S-xMtLyNw1w&t=207s'),
('S-xMtLyNw1w', 370, 422, 'S-xMtLyNw1w__chunk_0002__000300-000600.json', 250, 302, 'S-xMtLyNw1w:250:302', '4:10–5:02', 'https://www.youtube.com/watch?v=S-xMtLyNw1w&t=250s'),
('S-xMtLyNw1w', 390, 441, 'S-xMtLyNw1w__chunk_0002__000300-000600.json', 270, 321, 'S-xMtLyNw1w:270:321', '4:30–5:21', 'https://www.youtube.com/watch?v=S-xMtLyNw1w&t=270s'),
('S-xMtLyNw1w', 479, 480, 'S-xMtLyNw1w__chunk_0002__000300-000600.json', 359, 360, 'S-xMtLyNw1w:359:360', '5:59–6:00', 'https://www.youtube.com/watch?v=S-xMtLyNw1w&t=359s'),
('S-xMtLyNw1w', 600, 637, 'S-xMtLyNw1w__chunk_0003__000600-000722.json', 360, 397, 'S-xMtLyNw1w:360:397', '6:00–6:37', 'https://www.youtube.com/watch?v=S-xMtLyNw1w&t=360s'),
('T12mQVEA6bM', 373, 410, 'T12mQVEA6bM__chunk_0002__000300-000507.json', 253, 290, 'T12mQVEA6bM:253:290', '4:13–4:50', 'https://www.youtube.com/watch?v=T12mQVEA6bM&t=253s'),
('UDxKpYNJUyk', 402, 433, 'UDxKpYNJUyk__chunk_0002__000300-000600.json', 282, 313, 'UDxKpYNJUyk:282:313', '4:42–5:13', 'https://www.youtube.com/watch?v=UDxKpYNJUyk&t=282s'),
('UDxKpYNJUyk', 708, 726, 'UDxKpYNJUyk__chunk_0003__000600-000833.json', 468, 486, 'UDxKpYNJUyk:468:486', '7:48–8:06', 'https://www.youtube.com/watch?v=UDxKpYNJUyk&t=468s'),
('VghtMPTKvuI', 374, 393, 'VghtMPTKvuI__chunk_0002__000300-000600.json', 254, 273, 'VghtMPTKvuI:254:273', '4:14–4:33', 'https://www.youtube.com/watch?v=VghtMPTKvuI&t=254s'),
('VghtMPTKvuI', 469, 482, 'VghtMPTKvuI__chunk_0002__000300-000600.json', 349, 362, 'VghtMPTKvuI:349:362', '5:49–6:02', 'https://www.youtube.com/watch?v=VghtMPTKvuI&t=349s'),
('ZNxKJcSdMsU', 666, 706, 'ZNxKJcSdMsU__chunk_0003__000600-000900.json', 426, 466, 'ZNxKJcSdMsU:426:466', '7:06–7:46', 'https://www.youtube.com/watch?v=ZNxKJcSdMsU&t=426s'),
('aICv2fgoNg0', 343, 389, 'aICv2fgoNg0__chunk_0002__000300-000600.json', 223, 269, 'aICv2fgoNg0:223:269', '3:43–4:29', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=223s'),
('aICv2fgoNg0', 384, 414, 'aICv2fgoNg0__chunk_0002__000300-000600.json', 264, 294, 'aICv2fgoNg0:264:294', '4:24–4:54', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=264s'),
('aICv2fgoNg0', 427, 468, 'aICv2fgoNg0__chunk_0002__000300-000600.json', 307, 348, 'aICv2fgoNg0:307:348', '5:07–5:48', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=307s'),
('aICv2fgoNg0', 609, 629, 'aICv2fgoNg0__chunk_0003__000600-000900.json', 369, 389, 'aICv2fgoNg0:369:389', '6:09–6:29', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=369s'),
('aICv2fgoNg0', 647, 683, 'aICv2fgoNg0__chunk_0003__000600-000900.json', 407, 443, 'aICv2fgoNg0:407:443', '6:47–7:23', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=407s'),
('aICv2fgoNg0', 696, 744, 'aICv2fgoNg0__chunk_0003__000600-000900.json', 456, 504, 'aICv2fgoNg0:456:504', '7:36–8:24', 'https://www.youtube.com/watch?v=aICv2fgoNg0&t=456s'),
('ajbxxs-4SMk', 330, 353, 'ajbxxs-4SMk__chunk_0002__000300-000600.json', 210, 233, 'ajbxxs-4SMk:210:233', '3:30–3:53', 'https://www.youtube.com/watch?v=ajbxxs-4SMk&t=210s'),
('ajbxxs-4SMk', 399, 440, 'ajbxxs-4SMk__chunk_0002__000300-000600.json', 279, 320, 'ajbxxs-4SMk:279:320', '4:39–5:20', 'https://www.youtube.com/watch?v=ajbxxs-4SMk&t=279s'),
('c2GafXagxmk', 300, 316, 'c2GafXagxmk__chunk_0002__000300-000501.json', 180, 196, 'c2GafXagxmk:180:196', '3:00–3:16', 'https://www.youtube.com/watch?v=c2GafXagxmk&t=180s'),
('c2GafXagxmk', 365, 401, 'c2GafXagxmk__chunk_0002__000300-000501.json', 245, 281, 'c2GafXagxmk:245:281', '4:05–4:41', 'https://www.youtube.com/watch?v=c2GafXagxmk&t=245s'),
('dEVFN71MEGU', 354, 383, 'dEVFN71MEGU__chunk_0002__000300-000600.json', 234, 263, 'dEVFN71MEGU:234:263', '3:54–4:23', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=234s'),
('dEVFN71MEGU', 423, 460, 'dEVFN71MEGU__chunk_0002__000300-000600.json', 303, 340, 'dEVFN71MEGU:303:340', '5:03–5:40', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=303s'),
('dEVFN71MEGU', 465, 480, 'dEVFN71MEGU__chunk_0002__000300-000600.json', 345, 360, 'dEVFN71MEGU:345:360', '5:45–6:00', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=345s'),
('dEVFN71MEGU', 600, 629, 'dEVFN71MEGU__chunk_0003__000600-000852.json', 360, 389, 'dEVFN71MEGU:360:389', '6:00–6:29', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=360s'),
('dEVFN71MEGU', 652, 667, 'dEVFN71MEGU__chunk_0003__000600-000852.json', 412, 427, 'dEVFN71MEGU:412:427', '6:52–7:07', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=412s'),
('dEVFN71MEGU', 673, 693, 'dEVFN71MEGU__chunk_0003__000600-000852.json', 433, 453, 'dEVFN71MEGU:433:453', '7:13–7:33', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=433s'),
('dEVFN71MEGU', 700, 714, 'dEVFN71MEGU__chunk_0003__000600-000852.json', 460, 474, 'dEVFN71MEGU:460:474', '7:40–7:54', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=460s'),
('dEVFN71MEGU', 719, 741, 'dEVFN71MEGU__chunk_0003__000600-000852.json', 479, 501, 'dEVFN71MEGU:479:501', '7:59–8:21', 'https://www.youtube.com/watch?v=dEVFN71MEGU&t=479s'),
('eh_5PwiFJoU', 333, 360, 'eh_5PwiFJoU__chunk_0002__000300-000433.json', 213, 240, 'eh_5PwiFJoU:213:240', '3:33–4:00', 'https://www.youtube.com/watch?v=eh_5PwiFJoU&t=213s'),
('eh_5PwiFJoU', 365, 392, 'eh_5PwiFJoU__chunk_0002__000300-000433.json', 245, 272, 'eh_5PwiFJoU:245:272', '4:05–4:32', 'https://www.youtube.com/watch?v=eh_5PwiFJoU&t=245s'),
('ewKUCf-ANlo', 300, 318, 'ewKUCf-ANlo__chunk_0002__000300-000600.json', 180, 198, 'ewKUCf-ANlo:180:198', '3:00–3:18', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=180s'),
('ewKUCf-ANlo', 358, 414, 'ewKUCf-ANlo__chunk_0002__000300-000600.json', 238, 294, 'ewKUCf-ANlo:238:294', '3:58–4:54', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=238s'),
('ewKUCf-ANlo', 419, 438, 'ewKUCf-ANlo__chunk_0002__000300-000600.json', 299, 318, 'ewKUCf-ANlo:299:318', '4:59–5:18', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=299s'),
('ewKUCf-ANlo', 916, 940, 'ewKUCf-ANlo__chunk_0004__000900-001200.json', 556, 580, 'ewKUCf-ANlo:556:580', '9:16–9:40', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=556s'),
('ewKUCf-ANlo', 953, 978, 'ewKUCf-ANlo__chunk_0004__000900-001200.json', 593, 618, 'ewKUCf-ANlo:593:618', '9:53–10:18', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=593s'),
('ewKUCf-ANlo', 1013, 1042, 'ewKUCf-ANlo__chunk_0004__000900-001200.json', 653, 682, 'ewKUCf-ANlo:653:682', '10:53–11:22', 'https://www.youtube.com/watch?v=ewKUCf-ANlo&t=653s'),
('g-Df8xaScUM', 470, 480, 'g-Df8xaScUM__chunk_0002__000300-000600.json', 350, 360, 'g-Df8xaScUM:350:360', '5:50–6:00', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=350s'),
('g-Df8xaScUM', 624, 641, 'g-Df8xaScUM__chunk_0003__000600-000900.json', 384, 401, 'g-Df8xaScUM:384:401', '6:24–6:41', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=384s'),
('g-Df8xaScUM', 647, 675, 'g-Df8xaScUM__chunk_0003__000600-000900.json', 407, 435, 'g-Df8xaScUM:407:435', '6:47–7:15', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=407s'),
('g-Df8xaScUM', 678, 714, 'g-Df8xaScUM__chunk_0003__000600-000900.json', 438, 474, 'g-Df8xaScUM:438:474', '7:18–7:54', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=438s'),
('g-Df8xaScUM', 916, 955, 'g-Df8xaScUM__chunk_0004__000900-001042.json', 556, 595, 'g-Df8xaScUM:556:595', '9:16–9:55', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=556s'),
('g-Df8xaScUM', 955, 1002, 'g-Df8xaScUM__chunk_0004__000900-001042.json', 595, 642, 'g-Df8xaScUM:595:642', '9:55–10:42', 'https://www.youtube.com/watch?v=g-Df8xaScUM&t=595s'),
('jrzuLv0ZT0w', 300, 319, 'jrzuLv0ZT0w__chunk_0002__000300-000331.json', 180, 199, 'jrzuLv0ZT0w:180:199', '3:00–3:19', 'https://www.youtube.com/watch?v=jrzuLv0ZT0w&t=180s'),
('kN1KNvbnL7Q', 418, 446, 'kN1KNvbnL7Q__chunk_0002__000300-000600.json', 298, 326, 'kN1KNvbnL7Q:298:326', '4:58–5:26', 'https://www.youtube.com/watch?v=kN1KNvbnL7Q&t=298s'),
('kp4eS5hMI24', 731, 780, 'kp4eS5hMI24__chunk_0003__000600-000900.json', 491, 540, 'kp4eS5hMI24:491:540', '8:11–9:00', 'https://www.youtube.com/watch?v=kp4eS5hMI24&t=491s'),
('mK47Hd4X0sM', 601, 631, 'mK47Hd4X0sM__chunk_0003__000600-000747.json', 361, 391, 'mK47Hd4X0sM:361:391', '6:01–6:31', 'https://www.youtube.com/watch?v=mK47Hd4X0sM&t=361s'),
('mjTr6fKPgBM', 344, 393, 'mjTr6fKPgBM__chunk_0002__000300-000600.json', 224, 273, 'mjTr6fKPgBM:224:273', '3:44–4:33', 'https://www.youtube.com/watch?v=mjTr6fKPgBM&t=224s'),
('mjTr6fKPgBM', 425, 461, 'mjTr6fKPgBM__chunk_0002__000300-000600.json', 305, 341, 'mjTr6fKPgBM:305:341', '5:05–5:41', 'https://www.youtube.com/watch?v=mjTr6fKPgBM&t=305s'),
('neMlvsSMNEI', 334, 354, 'neMlvsSMNEI__chunk_0002__000300-000355.json', 214, 234, 'neMlvsSMNEI:214:234', '3:34–3:54', 'https://www.youtube.com/watch?v=neMlvsSMNEI&t=214s'),
('o-5jCSWJKwc', 323, 358, 'o-5jCSWJKwc__chunk_0002__000300-000600.json', 203, 238, 'o-5jCSWJKwc:203:238', '3:23–3:58', 'https://www.youtube.com/watch?v=o-5jCSWJKwc&t=203s'),
('opNpw5mOowo', 459, 479, 'opNpw5mOowo__chunk_0002__000300-000600.json', 339, 359, 'opNpw5mOowo:339:359', '5:39–5:59', 'https://www.youtube.com/watch?v=opNpw5mOowo&t=339s'),
('opNpw5mOowo', 600, 640, 'opNpw5mOowo__chunk_0003__000600-000900.json', 360, 400, 'opNpw5mOowo:360:400', '6:00–6:40', 'https://www.youtube.com/watch?v=opNpw5mOowo&t=360s'),
('opNpw5mOowo', 633, 681, 'opNpw5mOowo__chunk_0003__000600-000900.json', 393, 441, 'opNpw5mOowo:393:441', '6:33–7:21', 'https://www.youtube.com/watch?v=opNpw5mOowo&t=393s'),
('opNpw5mOowo', 714, 740, 'opNpw5mOowo__chunk_0003__000600-000900.json', 474, 500, 'opNpw5mOowo:474:500', '7:54–8:20', 'https://www.youtube.com/watch?v=opNpw5mOowo&t=474s'),
('opNpw5mOowo', 747, 780, 'opNpw5mOowo__chunk_0003__000600-000900.json', 507, 540, 'opNpw5mOowo:507:540', '8:27–9:00', 'https://www.youtube.com/watch?v=opNpw5mOowo&t=507s'),
('qdHbioZui2E', 360, 380, 'qdHbioZui2E__chunk_0002__000300-000600.json', 240, 260, 'qdHbioZui2E:240:260', '4:00–4:20', 'https://www.youtube.com/watch?v=qdHbioZui2E&t=240s'),
('qdHbioZui2E', 477, 479, 'qdHbioZui2E__chunk_0002__000300-000600.json', 357, 359, 'qdHbioZui2E:357:359', '5:57–5:59', 'https://www.youtube.com/watch?v=qdHbioZui2E&t=357s'),
('qdHbioZui2E', 959, 965, 'qdHbioZui2E__chunk_0004__000900-001007.json', 599, 605, 'qdHbioZui2E:599:605', '9:59–10:05', 'https://www.youtube.com/watch?v=qdHbioZui2E&t=599s'),
('rQKX8Rl5O3w', 337, 354, 'rQKX8Rl5O3w__chunk_0002__000300-000354.json', 217, 234, 'rQKX8Rl5O3w:217:234', '3:37–3:54', 'https://www.youtube.com/watch?v=rQKX8Rl5O3w&t=217s'),
('rgmXFfudqUY', 387, 412, 'rgmXFfudqUY__chunk_0002__000300-000600.json', 267, 292, 'rgmXFfudqUY:267:292', '4:27–4:52', 'https://www.youtube.com/watch?v=rgmXFfudqUY&t=267s'),
('t8CQXKgPNmc', 325, 343, 't8CQXKgPNmc__chunk_0002__000300-000600.json', 205, 223, 't8CQXKgPNmc:205:223', '3:25–3:43', 'https://www.youtube.com/watch?v=t8CQXKgPNmc&t=205s'),
('t8CQXKgPNmc', 346, 405, 't8CQXKgPNmc__chunk_0002__000300-000600.json', 226, 285, 't8CQXKgPNmc:226:285', '3:46–4:45', 'https://www.youtube.com/watch?v=t8CQXKgPNmc&t=226s'),
('t8CQXKgPNmc', 414, 459, 't8CQXKgPNmc__chunk_0002__000300-000600.json', 294, 339, 't8CQXKgPNmc:294:339', '4:54–5:39', 'https://www.youtube.com/watch?v=t8CQXKgPNmc&t=294s'),
('t8CQXKgPNmc', 615, 658, 't8CQXKgPNmc__chunk_0003__000600-000849.json', 375, 418, 't8CQXKgPNmc:375:418', '6:15–6:58', 'https://www.youtube.com/watch?v=t8CQXKgPNmc&t=375s'),
('t8CQXKgPNmc', 685, 703, 't8CQXKgPNmc__chunk_0003__000600-000849.json', 445, 463, 't8CQXKgPNmc:445:463', '7:25–7:43', 'https://www.youtube.com/watch?v=t8CQXKgPNmc&t=445s'),
('tHVk9XfXUC4', 320, 356, 'tHVk9XfXUC4__chunk_0002__000300-000439.json', 200, 236, 'tHVk9XfXUC4:200:236', '3:20–3:56', 'https://www.youtube.com/watch?v=tHVk9XfXUC4&t=200s'),
('tHVk9XfXUC4', 356, 381, 'tHVk9XfXUC4__chunk_0002__000300-000439.json', 236, 261, 'tHVk9XfXUC4:236:261', '3:56–4:21', 'https://www.youtube.com/watch?v=tHVk9XfXUC4&t=236s'),
('tOcpr1ZiYgo', 300, 329, 'tOcpr1ZiYgo__chunk_0002__000300-000600.json', 180, 209, 'tOcpr1ZiYgo:180:209', '3:00–3:29', 'https://www.youtube.com/watch?v=tOcpr1ZiYgo&t=180s'),
('wLTDCW5Rv8o', 410, 469, 'wLTDCW5Rv8o__chunk_0002__000300-000600.json', 290, 349, 'wLTDCW5Rv8o:290:349', '4:50–5:49', 'https://www.youtube.com/watch?v=wLTDCW5Rv8o&t=290s'),
('wLTDCW5Rv8o', 452, 480, 'wLTDCW5Rv8o__chunk_0002__000300-000600.json', 332, 360, 'wLTDCW5Rv8o:332:360', '5:32–6:00', 'https://www.youtube.com/watch?v=wLTDCW5Rv8o&t=332s'),
('wLTDCW5Rv8o', 610, 636, 'wLTDCW5Rv8o__chunk_0003__000600-000730.json', 370, 396, 'wLTDCW5Rv8o:370:396', '6:10–6:36', 'https://www.youtube.com/watch?v=wLTDCW5Rv8o&t=370s'),
('wd13P0yZpuU', 331, 347, 'wd13P0yZpuU__chunk_0002__000300-000600.json', 211, 227, 'wd13P0yZpuU:211:227', '3:31–3:47', 'https://www.youtube.com/watch?v=wd13P0yZpuU&t=211s'),
('wd13P0yZpuU', 350, 408, 'wd13P0yZpuU__chunk_0002__000300-000600.json', 230, 288, 'wd13P0yZpuU:230:288', '3:50–4:48', 'https://www.youtube.com/watch?v=wd13P0yZpuU&t=230s'),
('wd13P0yZpuU', 429, 444, 'wd13P0yZpuU__chunk_0002__000300-000600.json', 309, 324, 'wd13P0yZpuU:309:324', '5:09–5:24', 'https://www.youtube.com/watch?v=wd13P0yZpuU&t=309s'),
('wd13P0yZpuU', 468, 480, 'wd13P0yZpuU__chunk_0002__000300-000600.json', 348, 360, 'wd13P0yZpuU:348:360', '5:48–6:00', 'https://www.youtube.com/watch?v=wd13P0yZpuU&t=348s');

-- Guardrail 1: fail before changing anything if the database is not in the expected pre-009 state.
do $$
declare
  expected_count integer := 198;
  matched_count integer;
begin
  select count(*) into matched_count
  from _chunk_time_fix f
  join videos v on v.youtube_video_id = f.youtube_video_id
  join segments s on s.video_id = v.id
                 and s.start_seconds = f.old_start_seconds
                 and s.end_seconds = f.old_end_seconds
                 and s.transcript_source_file = f.transcript_source_file;
  if matched_count <> expected_count then
    raise exception
      '009 aborted: expected % pre-correction rows but found %. Do not continue; inspect prior migration state.',
      expected_count, matched_count;
  end if;
end $$;

-- The update changes time-derived values only. Segment IDs and tag assignments remain intact.
with corrected as (
  update segments s
  set
    start_seconds = f.new_start_seconds,
    end_seconds = f.new_end_seconds,
    segment_key = f.new_segment_key,
    timestamp_label = f.new_timestamp_label,
    start_url = f.new_start_url,
    notes = case
      when position('Timing corrected from original filename offset to confirmed 180-second chunk cadence.' in s.notes) > 0 then s.notes
      else trim(s.notes || ' Timing corrected from original filename offset to confirmed 180-second chunk cadence.')
    end
  from _chunk_time_fix f
  join videos v on v.youtube_video_id = f.youtube_video_id
  where s.video_id = v.id
    and s.start_seconds = f.old_start_seconds
    and s.end_seconds = f.old_end_seconds
    and s.transcript_source_file = f.transcript_source_file
  returning s.id
)
select count(*) as corrected_segment_rows from corrected;

-- Guardrail 2: no corrected segment should exceed the known parent video duration.
do $$
declare invalid_count integer;
begin
  select count(*) into invalid_count
  from segments s
  join videos v on v.id = s.video_id
  where v.duration_seconds is not null
    and s.end_seconds > v.duration_seconds;
  if invalid_count <> 0 then
    raise exception
      '009 aborted after update: % segment(s) exceed known parent duration. Transaction will roll back.',
      invalid_count;
  end if;
end $$;

-- Final audit result. Expect 198 corrected rows and zero duration violations.
select
  (select count(*) from _chunk_time_fix) as mapped_rows,
  (select count(*)
     from segments s join videos v on v.id = s.video_id
    where v.duration_seconds is not null and s.end_seconds > v.duration_seconds
  ) as rows_exceeding_parent_duration;

commit;
