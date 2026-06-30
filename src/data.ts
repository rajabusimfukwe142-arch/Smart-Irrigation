import { CropConfig } from './types';

export const TANZANIA_REGIONS: Record<string, string[]> = {
  'Arusha': ['Arusha Mjini', 'Monduli', 'Karatu', 'Ngorongoro', 'Meru', 'Longido', 'Arumeru'],
  'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'],
  'Dodoma': ['Dodoma Mjini', 'Bahi', 'Chamwino', 'Kondoa', 'Kongwa', 'Mpwapwa', 'Chemba'],
  'Geita': ['Geita', 'Bukombe', 'Chato', 'Mbogwe', 'Nyang\'hwale'],
  'Iringa': ['Iringa Mjini', 'Kilolo', 'Mufindi', 'Iringa Vijijini'],
  'Kagera': ['Bukoba', 'Biharamulo', 'Karagwe', 'Ngara', 'Muleba', 'Missenyi', 'Kyerwa'],
  'Katavi': ['Mpanda', 'Nsimbo', 'Tanganyika', 'Mlele'],
  'Kigoma': ['Kigoma Mjini', 'Kibondo', 'Kasulu', 'Buhigwe', 'Kakonko', 'Uvinza', 'Kigoma Vijijini'],
  'Kilimanjaro': ['Moshi Mjini', 'Rombo', 'Mwanga', 'Same', 'Hai', 'Siha', 'Moshi Vijijini'],
  'Lindi': ['Lindi Mjini', 'Kilwa', 'Nachingwea', 'Ruangwa', 'Liwale', 'Lindi Vijijini'],
  'Manyara': ['Babati', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro'],
  'Mara': ['Musoma', 'Bunda', 'Tarime', 'Rorya', 'Serengeti', 'Butiama'],
  'Mbeya': ['Mbeya Mjini', 'Chunya', 'Kyela', 'Mbarali', 'Rungwe', 'Busokelo', 'Mbeya Vijijini'],
  'Morogoro': ['Morogoro Mjini', 'Kilosa', 'Mvomero', 'Gairo', 'Malinyi', 'Ulanga', 'Kilombero', 'Morogoro Vijijini'],
  'Mtwara': ['Mtwara Mjini', 'Masasi', 'Nanyumbu', 'Newala', 'Tandahimba', 'Mtwara Vijijini'],
  'Mwanza': ['Nyamagana', 'Ilemela', 'Sengerema', 'Kwimba', 'Magu', 'Misungwi', 'Ukerewe'],
  'Njombe': ['Njombe Mjini', 'Makete', 'Ludewa', 'Wanging\'ombe', 'Njombe Vijijini'],
  'Pwani': ['Kibaha', 'Bagamoyo', 'Mkuranga', 'Rufiji', 'Kisarawe', 'Mafia', 'Chalinze'],
  'Rukwa': ['Sumbawanga', 'Kalambo', 'Nkasi'],
  'Ruvuma': ['Songea Mjini', 'Mbinga', 'Namtumbo', 'Tunduru', 'Nyasa', 'Songea Vijijini'],
  'Shinyanga': ['Shinyanga Mjini', 'Kahama', 'Kishapu', 'Shinyanga Vijijini'],
  'Simiyu': ['Bariadi', 'Busega', 'Maswa', 'Meatu', 'Itilima'],
  'Singida': ['Singida Mjini', 'Iramba', 'Manyoni', 'Mkalama', 'Ikungi', 'Itigi', 'Singida Vijijini'],
  'Songwe': ['Tunduma', 'Mbozi', 'Ileje', 'Songwe Mjini', 'Momba'],
  'Tabora': ['Tabora Mjini', 'Igunga', 'Nzega', 'Sikonge', 'Urambo', 'Uyui', 'Kaliua'],
  'Tanga': ['Tanga Mjini', 'Pangani', 'Mkinga', 'Handeni', 'Korogwe', 'Lushoto', 'Muheza', 'Kilindi', 'Bumbuli'],
  'Zanzibar (Unguja)': ['Mjini', 'Magharibi', 'Kaskazini A', 'Kaskazini B', 'Kati', 'Kusini'],
  'Pemba': ['Chake Chake', 'Mkoani', 'Wete', 'Micheweni']
};

// All major districts mapped to real villages (vijiji)
export const TANZANIA_VILLAGES: Record<string, string[]> = {
  // Arusha
  'Arusha Mjini': ['Sekei', 'Sombetini', 'Elerai', 'Olasiti', 'Kimandolu', 'Kijenge', 'Ungu Salama'],
  'Monduli': ['Mto wa Mbu', 'Meserani', 'Moita', 'Lolkisale', 'Sepeko', 'Monduli Mjini', 'Engaruka'],
  'Karatu': ['Rhotia', 'Endabash', 'Mang\'ola', 'Qurus', 'Karatu Mjini', 'Kambi ya Nyoka'],
  'Ngorongoro': ['Loliondo', 'Nainokanoka', 'Endulen', 'Olbalbal', 'Sale', 'Ngorongoro Mjini'],
  'Meru': ['Usa River', 'Kikatiti', 'King\'ori', 'Leguruki', 'Poli', 'Nkoaranga', 'Majengo'],
  'Longido': ['Namanga', 'Tingatinga', 'Engarenaibor', 'Longido Mjini', 'Kamwanga', 'Kiserian'],
  'Arumeru': ['Ngaramtoni', 'Mwandet', 'Oltrumet', 'Mukulat', 'Kiserian'],

  // Dar es Salaam
  'Ilala': ['Gerezani', 'Kariakoo', 'Upanga', 'Tabata', 'Ukonga', 'Chanika', 'Kinyerezi', 'Majohe'],
  'Kinondoni': ['Mwenge', 'Kijitonyama', 'Mwananyamala', 'Tegeta', 'Bunju', 'Wazo', 'Kunduchi'],
  'Temeke': ['Mbagala', 'Yombo Vituka', 'Chang\'ombe', 'Kurasini', 'Toangoma', 'Chamazi'],
  'Ubungo': ['Mbezi Kimara', 'Msewe', 'Goba', 'Kibamba', 'Mabibo', 'Manzese'],
  'Kigamboni': ['Kibada', 'Mjimwema', 'Somangila', 'Vijibweni', 'Kigamboni Mjini'],

  // Dodoma
  'Dodoma Mjini': ['Kihonda', 'Nzuguni', 'Makulu', 'Mkonze', 'Hazina', 'Kizota', 'Ipagala'],
  'Bahi': ['Mundemu', 'Bahi Mjini', 'Chigongwe', 'Kigwe', 'Lamaiti', 'Mpamantwa'],
  'Chamwino': ['Buigiri', 'Mvumi', 'Chilonwa', 'Msanga', 'Chamwino Ikulu', 'Manzase'],
  'Kondoa': ['Kondoa Mjini', 'Kolo', 'Bereko', 'Pahi', 'Kinyasi', 'Mondo'],
  'Kongwa': ['Kongwa Mjini', 'Kibaigwa', 'Mlali', 'Pandambili', 'Sagara'],
  'Mpwapwa': ['Mpwapwa Mjini', 'Kibakwe', 'Mtera', 'Rudi', 'Godegode'],
  'Chemba': ['Chemba Mjini', 'Farkwa', 'Gozigo', 'Mondo', 'Gwandi'],

  // Morogoro
  'Morogoro Mjini': ['Msamvu', 'Kihonda', 'Kingolwira', 'Mazimbu', 'Mafiga', 'Saba Saba', 'Bigwa'],
  'Kilosa': ['Mhenda', 'Mikumi', 'Chanzulu', 'Kimamba', 'Kidodi', 'Ruaha', 'Magole', 'Zombo'],
  'Mvomero': ['Dakawa', 'Wami', 'Turiani', 'Hembeti', 'Kibaoni', 'Mgeta', 'Melela'],
  'Gairo': ['Gairo Mjini', 'Kibedya', 'Chagongwe', 'Rubeho', 'Iyogwe'],
  'Malinyi': ['Malinyi Mjini', 'Iringa mlimba', 'Ngoheranga', 'Mtimbira', 'Sofi'],
  'Ulanga': ['Mahenge', 'Lupiro', 'Mwaya', 'Vigoi', 'Kichangani'],
  'Kilombero': ['Ifakara', 'Kibaoni', 'Kidatu', 'Mang\'ula', 'Msolwa', 'Ruipa'],
  'Morogoro Vijijini': ['Ngerengere', 'Mvuha', 'Mlali', 'Matombo', 'Kisaki', 'Kinole'],

  // Mbeya
  'Mbeya Mjini': ['Sisimba', 'Mwanjelwa', 'Iyunga', 'Ruanda', 'Forest', 'Sumbawanga', 'Nzovwe'],
  'Chunya': ['Chunya Mjini', 'Lupa Tingatinga', 'Makongolosi', 'Matundasi', 'Saza'],
  'Kyela': ['Kyela Mjini', 'Ipinda', 'Ndobo', 'Ngonga', 'Matema', 'Itungi'],
  'Mbarali': ['Rujewa', 'Madibira', 'Ubaruku', 'Mapogoro', 'Igurusi', 'Mwatenga', 'Chimala'],
  'Rungwe': ['Tukuyu', 'Rungwe Mjini', 'Kiwanja', 'Kandete', 'Lwangwa', 'Masoko'],
  'Busokelo': ['Lupaso', 'Luteba', 'Itete', 'Ntaba', 'Mpombo'],
  'Mbeya Vijijini': ['Inyala', 'Mbalizi', 'Utengule', 'Swaya', 'Isangati'],

  // Tanga
  'Tanga Mjini': ['Chumbageni', 'Ngamiani', 'Mnyanjani', 'Masiwani', 'Tongoni', 'Pongwe'],
  'Pangani': ['Pangani Mjini', 'Mwera', 'Mkwaja', 'Kipumbwi', 'Bushiri'],
  'Mkinga': ['Horohoro', 'Maramba', 'Parachichi', 'Duga', 'Moa'],
  'Handeni': ['Handeni Mjini', 'Mkata', 'Kabuku', 'Kwedizinga', 'Sindeni'],
  'Korogwe': ['Korogwe Mjini', 'Mombo', 'Lwengera', 'Kizara', 'Mazinde'],
  'Lushoto': ['Lushoto Mjini', 'Soni', 'Mlalo', 'Mtae', 'Gare', 'Kwesimu'],
  'Muheza': ['Amani', 'Muheza Mjini', 'Mkuzi', 'Tongwe', 'Kicheba'],
  'Kilindi': ['Songe', 'Kibirashi', 'Masagalu', 'Mvungwe'],
  'Bumbuli': ['Bumbuli Mjini', 'Mayo', 'Funta', 'Mponde', 'Tamota'],

  // Kilimanjaro
  'Moshi Mjini': ['Mawenzi', 'Soweto', 'Pasua', 'Majengo', 'Kiboriloni', 'Njoro'],
  'Rombo': ['Mkuu', 'Tarakea', 'Mengeni', 'Mashati', 'Useri'],
  'Mwanga': ['Mwanga Mjini', 'Nyumba ya Mungu', 'Shighatini', 'Jipe', 'Lembeni'],
  'Same': ['Same Mjini', 'Hedaru', 'Mamba', 'Chome', 'Gonja', 'Vudee'],
  'Hai': ['Bomang\'ombe', 'Machame', 'Masama', 'Weruweru', 'Rundugai'],
  'Siha': ['Sanya Juu', 'Gararagua', 'Kashashi', 'Makiwaru'],
  'Moshi Vijijini': ['Marangu', 'Mamba', 'Kilema', 'Uru', 'Kibosho', 'Old Moshi'],

  // Iringa
  'Iringa Mjini': ['Kihesa', 'Gangilonga', 'Mwangata', 'Mshindo', 'Makorongoni', 'Ruaha'],
  'Kilolo': ['Kilolo Mjini', 'Ilula', 'Ruaha Mbuyuni', 'Kidabaga', 'Mtitu'],
  'Mufindi': ['Mafinga', 'Mtwango', 'Kibengu', 'Sadani', 'Soweto', 'Igowole'],
  'Iringa Vijijini': ['Kalenga', 'Ismani', 'Pawaga', 'Idodi', 'Kihorogota'],

  // Mwanza
  'Nyamagana': ['Mwanza Mjini', 'Butimba', 'Nyegezi', 'Mirongo', 'Mkolani', 'Igogo'],
  'Ilemela': ['Kirumba', 'Kitangiri', 'Nyakato', 'Buswelu', 'Sangabuye', 'Kisesa'],
  'Sengerema': ['Sengerema Mjini', 'Katunguru', 'Buchosa', 'Nyamazugo', 'Kafunzo'],
  'Kwimba': ['Ngudu', 'Mantare', 'Sumve', 'Bhungila', 'Nyambiti'],
  'Magu': ['Magu Mjini', 'Kisesa Vijijini', 'Kahangara', 'Nyanguge', 'Lutale'],
  'Misungwi': ['Misungwi Mjini', 'Usagara', 'Fela', 'Mbarika', 'Kanyelele'],
  'Ukerewe': ['Nansio', 'Murutunguru', 'Kagera', 'Bwisya'],

  // Geita
  'Geita': ['Geita Mjini', 'Katoro', 'Chunya', 'Nyarugusu', 'Kamena', 'Lwamgasa'],
  'Bukombe': ['Ushirombo', 'Uyovu', 'Buseresere', 'Runzewe'],
  'Chato': ['Chato Mjini', 'Buzelasere', 'Kibehe', 'Muganza', 'Nyamirembe'],
  'Mbogwe': ['Masumbwe', 'Mbogwe Mjini', 'Lulembela', 'Nyasenga'],
  'Nyang\'hwale': ['Kharumwa', 'Nyang\'hwale Mjini', 'Bukwimba', 'Mwingiro'],

  // Kagera
  'Bukoba': ['Bukoba Mjini', 'Kashai', 'Hamugembe', 'Kanyigo', 'Katerero', 'Misenyi'],
  'Biharamulo': ['Biharamulo Mjini', 'Nyakanazi', 'Lusahunga', 'Nyamahanga'],
  'Karagwe': ['Kayanga', 'Omurushaka', 'Kitengule', 'Nyakayanja'],
  'Ngara': ['Ngara Mjini', 'Kabanga', 'Rulenge', 'Benaco'],
  'Muleba': ['Muleba Mjini', 'Kamachumu', 'Nshamba', 'Izigo', 'Nyamisingi'],
  'Missenyi': ['Kyaka', 'Mutukula', 'Bunazi', 'Gera'],
  'Kyerwa': ['Rurama', 'Nyakasimbi', 'Kyerwa Mjini', 'Murongo'],

  // Lindi
  'Lindi Mjini': ['Ndanda', 'Mitwero', 'Mikindani', 'Mpilipili', 'Rahaleo'],
  'Kilwa': ['Kilwa Masoko', 'Kilwa Kivinje', 'Kipatimu', 'Somanga', 'Pande'],
  'Nachingwea': ['Nachingwea Mjini', 'Ruponda', 'Naipanga', 'Lionja'],
  'Ruangwa': ['Ruangwa Mjini', 'Mandawa', 'Nkowe', 'Malolo'],
  'Liwale': ['Liwale Mjini', 'Mkutano', 'Kibutuka', 'Mangirikiti'],
  'Lindi Vijijini': ['Rutamba', 'Mnazi Mmoja', 'Nyangao', 'Mtama'],

  // Mtwara
  'Mtwara Mjini': ['Shangani', 'Chuno', 'Likombe', 'Majengo', 'Naliendele'],
  'Masasi': ['Masasi Mjini', 'Ndanda Mjini', 'Lukuledi', 'Mnavira', 'Chiungutwa'],
  'Nanyumbu': ['Mangaka', 'Nanyumbu Mjini', 'Masuguru', 'Maratani'],
  'Newala': ['Newala Mjini', 'Lulu', 'Chihangu', 'Kitangari'],
  'Tandahimba': ['Tandahimba Mjini', 'Mahuta', 'Michenje', 'Kitama'],
  'Mtwara Vijijini': ['Nanyamba', 'Ziwani', 'Mayanga', 'Chawi'],

  // Shinyanga
  'Shinyanga Mjini': ['Kambarage', 'Ngokolo', 'Ibinzamata', 'Ndala', 'Lubaga'],
  'Kahama': ['Kahama Mjini', 'Mlowa', 'Isaka', 'Segese', 'Bugarama', 'Lunguya'],
  'Kishapu': ['Kishapu Mjini', 'Mhunze', 'Songwa', 'Ukenyenge', 'Kolasini'],
  'Shinyanga Vijijini': ['Tinde', 'Didia', 'Samuye', 'Mwantini'],

  // Mara
  'Musoma': ['Musoma Mjini', 'Mshikamano', 'Nyasho', 'Kamunyonge', 'Bweri'],
  'Bunda': ['Bunda Mjini', 'Kibara', 'Nyamuswa', 'Manyamanyama'],
  'Tarime': ['Tarime Mjini', 'Sirari', 'Nyamongo', 'Nyamwaga', 'Kibaso'],
  'Rorya': ['Shirati', 'Utegi', 'Kowak', 'Koryo'],
  'Serengeti': ['Mugumu', 'Natta', 'Fort Ikoma', 'Robanda', 'Machochwe'],
  'Butiama': ['Butiama Mjini', 'Kiabakari', 'Kukirango', 'Buhemba'],

  // Njombe
  'Njombe Mjini': ['Njombe Mjini', 'Mpechi', 'Ramadhani', 'Makambako', 'Kifanya'],
  'Makete': ['Iwawa', 'Lupalilo', 'Bulongwa', 'Mang\'oto', 'Kipagalo'],
  'Ludewa': ['Ludewa Mjini', 'Madope', 'Mlangali', 'Lupangu', 'Manda'],
  'Wanging\'ombe': ['Wanging\'ombe Mjini', 'Ulembwe', 'Igwachanya', 'Kipara', 'Mdandu'],
  'Njombe Vijijini': ['Lugarawa', 'Ibumila', 'Kidegembye', 'Luponde'],

  // Singida
  'Singida Mjini': ['Singida Mjini', 'Mitundu', 'Maji ya Chai', 'Kindai', 'Utemini'],
  'Iramba': ['Kiomboi', 'Shelui', 'Kinampanda', 'Nduguti'],
  'Manyoni': ['Manyoni Mjini', 'Kintinku', 'Saza', 'Chaya', 'Makutupora'],
  'Mkalama': ['Nduguti', 'Mkalama Mjini', 'Kinyangiri', 'Gumanga'],
  'Ikungi': ['Ikungi Mjini', 'Sepuka', 'Puma', 'Mgungia', 'Mungaa'],
  'Itigi': ['Itigi Mjini', 'Mitundu Vijijini', 'Rungwa', 'Kazi'],
  'Singida Vijijini': ['Ilongero', 'Merya', 'Mtinko', 'Mudida'],

  // Tabora
  'Tabora Mjini': ['Chemchem', 'Isevya', 'Ipuli', 'Gongoni', 'Kiloleni', 'Kanyenye'],
  'Igunga': ['Igunga Mjini', 'Nkinga', 'Choma', 'Simbo', 'Mbutu'],
  'Nzega': ['Nzega Mjini', 'Lusu', 'Puge', 'Nkindwabiye', 'Bukene'],
  'Sikonge': ['Sikonge Mjini', 'Tutuo', 'Pangale', 'Kitunda', 'Ipole'],
  'Urambo': ['Urambo Mjini', 'Muungano', 'Songambele', 'Vumilia'],
  'Uyui': ['Igalula', 'Lulanguru', 'Goweko', 'Mambali'],
  'Kaliua': ['Kaliua Mjini', 'Usinge', 'Ushokola', 'Kazaroho'],

  // Rukwa
  'Sumbawanga': ['Sumbawanga Mjini', 'Mazwi', 'Chanji', 'Katandala', 'Laela', 'Mpui'],
  'Kalambo': ['Matai', 'Mwimbi', 'Kasanga', 'Kalambo Falls'],
  'Nkasi': ['Namanyere', 'Kirando', 'Kabwe', 'Wampembe'],

  // Ruvuma
  'Songea Mjini': ['Majengo', 'Ruvuma', 'Mfaranyaki', 'Matogoro', 'Lilambo', 'Subira'],
  'Mbinga': ['Mbinga Mjini', 'Kigonsera', 'Mbamba Bay', 'Litembo', 'Tingi'],
  'Namtumbo': ['Namtumbo Mjini', 'Hanga', 'Lusewa', 'Mkongo', 'Mgombasi'],
  'Tunduru': ['Tunduru Mjini', 'Nakasapula', 'Nalasi', 'Mlingoti', 'Masonya'],
  'Nyasa': ['Kilambo', 'Mbamba Bay Vijijini', 'Liuli', 'Lundo', 'Tingi'],
  'Songea Vijijini': ['Peramiho', 'Maposeni', 'Madaba', 'Gumbiro'],

  // Simiyu
  'Bariadi': ['Bariadi Mjini', 'Somanda', 'Nkololo', 'Dutwa', 'Sapiwi'],
  'Busega': ['Nyashimo', 'Nassa', 'Lamadi', 'Kabita'],
  'Maswa': ['Maswa Mjini', 'Malampaka', 'Lalago', 'Sangamwalugesha'],
  'Meatu': ['Mwanhuzi', 'Kimali', 'Kisesa', 'Bukundi'],
  'Itilima': ['Lagangabilili', 'Chinadi', 'Nkoma', 'Lugulu'],

  // Songwe
  'Tunduma': ['Tunduma Mjini', 'Sogea', 'Chapwa', 'Majengo', 'Chiwezi'],
  'Mbozi': ['Mlowo', 'Vwawa', 'Myunga', 'Kapele', 'Ruanda', 'Igamba'],
  'Ileje': ['Itumba', 'Isongole', 'Ibundu', 'Ndola'],
  'Songwe Mjini': ['Mkwajuni', 'Gua', 'Saza', 'Songwe Vijijini'],
  'Momba': ['Chitete', 'Kamsamba', 'Ndoba', 'Momba Mjini'],

  // Pwani
  'Kibaha': ['Kibaha Mjini', 'Mlandizi', 'Visiga', 'Maili Moja', 'Lulanzi', 'Ruvu'],
  'Bagamoyo': ['Bagamoyo Mjini', 'Kiromo', 'Yombo', 'Zinga', 'Fukayosi', 'Talawanda'],
  'Mkuranga': ['Mkuranga Mjini', 'Vikindu', 'Mwanzise', 'Kimanzichana', 'Kisaju'],
  'Rufiji': ['Utete', 'Ikwiriri', 'Kibiti', 'Bungu', 'Mohoro'],
  'Kisarawe': ['Kisarawe Mjini', 'Chaza', 'Masaki', 'Maneromango', 'Marumbo'],
  'Mafia': ['Kilindoni', 'Baleni', 'Utende', 'Kanga', 'Kiegeani'],
  'Chalinze': ['Chalinze Mjini', 'Msolwa', 'Lugoba', 'Mbwewe', 'Mandera'],

  // Katavi
  'Mpanda': ['Mpanda Mjini', 'Kashaulili', 'Shanwe', 'Kawajense', 'Milala'],
  'Nsimbo': ['Nsimbo Mjini', 'Katumba', 'Kanongola', 'Sitalike'],
  'Tanganyika': ['Maji Moto', 'Karema', 'Kaboyonga', 'Sibwesa'],
  'Mlele': ['Inyonga', 'Utende', 'Nsunga', 'Kamsisi'],

  // Kigoma
  'Kigoma Mjini': ['Bangwe', 'Gungu', 'Mwanga', 'Kibirizi', 'Katubuka', 'Kizuka'],
  'Kibondo': ['Kibondo Mjini', 'Mabamba', 'Nyamvi', 'Murungu', 'Kagezi'],
  'Kasulu': ['Kasulu Mjini', 'Heru Juu', 'Kanyani', 'Makere', 'Rungwe Mpya'],
  'Buhigwe': ['Buhigwe Mjini', 'Munzeze', 'Munyegera', 'Kajana'],
  'Kakonko': ['Kakonko Mjini', 'Gwarama', 'Nyamtukuza', 'Kizazi'],
  'Uvinza': ['Uvinza Mjini', 'Ilunde', 'Nguruka', 'Basanza', 'Malagarasi'],
  'Kigoma Vijijini': ['Mwandiga', 'Kalinzi', 'Mahembe', 'Kagunga', 'Simbo'],

  // Zanzibar (Unguja)
  'Mjini': ['Mkunazini', 'Shangani', 'Kikwajuni', 'Jang\'ombe', 'Mwembeladu', 'Chumbuni'],
  'Magharibi': ['Bububu', 'Fuoni', 'Kama', 'Kiembe Samaki', 'Mtoni', 'Mwanakwerekwe'],
  'Kaskazini A': ['Nungwi', 'Matemwe', 'Kijini', 'Mkokotoni', 'Chaani', 'Kinyasini'],
  'Kaskazini B': ['Mahonda', 'Kianga', 'Donge', 'Bumbwini', 'Fujoni'],
  'Kati': ['Chwaka', 'Dunga', 'Tunguu', 'Uroa', 'Marumbi', 'Koani'],
  'Kusini': ['Makunduchi', 'Jambiani', 'Paje', 'Kizimkazi', 'Bwejuu', 'Unguja Ukuu'],

  // Pemba
  'Chake Chake': ['Chake Chake Mjini', 'Wambaa', 'Pujini', 'Vitongoji', 'Tibirinzi'],
  'Mkoani': ['Mkoani Mjini', 'Kengeja', 'Mtambile', 'Chokocho', 'Shumba'],
  'Wete': ['Wete Mjini', 'Konde', 'Tumbe', 'Gando', 'Kinyasini'],
  'Micheweni': ['Micheweni Mjini', 'Wingwi', 'Kiuyu', 'Shumba Viamboni']
};

export const CROPS_DATA: Record<string, CropConfig> = {
  // 🌽 Nafaka (Cereals)
  'mahindi': {
    kc: { mwanzo: 0.3, katikati: 1.2, mwisho: 0.45 },
    water_needed: 450, days_to_maturity: 90,
    icon: '🌽', swahili: 'Mahindi', category: 'Chakula'
  },
  'mpunga': {
    kc: { mwanzo: 0.5, katikati: 1.35, mwisho: 0.5 },
    water_needed: 550, days_to_maturity: 120,
    icon: '🌾', swahili: 'Mpunga', category: 'Chakula'
  },
  'ngano': {
    kc: { mwanzo: 0.3, katikati: 1.15, mwisho: 0.35 },
    water_needed: 380, days_to_maturity: 100,
    icon: '🌾', swahili: 'Ngano', category: 'Chakula'
  },
  'mtama': {
    kc: { mwanzo: 0.3, katikati: 1.0, mwisho: 0.3 },
    water_needed: 280, days_to_maturity: 85,
    icon: '🌾', swahili: 'Mtama', category: 'Chakula'
  },
  'ulezi': {
    kc: { mwanzo: 0.3, katikati: 0.95, mwisho: 0.3 },
    water_needed: 250, days_to_maturity: 80,
    icon: '🌾', swahili: 'Ulezi', category: 'Chakula'
  },
  'uwele': {
    kc: { mwanzo: 0.3, katikati: 0.9, mwisho: 0.3 },
    water_needed: 240, days_to_maturity: 75,
    icon: '🌾', swahili: 'Uwele', category: 'Chakula'
  },

  // 🫘 Kunde na Maharage (Legumes)
  'maharage': {
    kc: { mwanzo: 0.3, katikati: 1.1, mwisho: 0.4 },
    water_needed: 250, days_to_maturity: 70,
    icon: '🫘', swahili: 'Maharage ya Kawaida', category: 'Chakula'
  },
  'mbaazi': {
    kc: { mwanzo: 0.3, katikati: 1.05, mwisho: 0.45 },
    water_needed: 320, days_to_maturity: 130,
    icon: '🫘', swahili: 'Mbaazi (Pigeon Peas)', category: 'Chakula'
  },
  'soya': {
    kc: { mwanzo: 0.3, katikati: 1.05, mwisho: 0.4 },
    water_needed: 280, days_to_maturity: 85,
    icon: '🫘', swahili: 'Soya', category: 'Chakula'
  },
  'njugu': {
    kc: { mwanzo: 0.3, katikati: 0.95, mwisho: 0.4 },
    water_needed: 220, days_to_maturity: 80,
    icon: '🥜', swahili: 'Njugu Karanga', category: 'Chakula'
  },
  'njugu_mawe': {
    kc: { mwanzo: 0.3, katikati: 0.9, mwisho: 0.35 },
    water_needed: 210, days_to_maturity: 90,
    icon: '🥜', swahili: 'Njugu Mawe (Bambara Groundnuts)', category: 'Chakula'
  },
  'choroko': {
    kc: { mwanzo: 0.3, katikati: 0.9, mwisho: 0.3 },
    water_needed: 190, days_to_maturity: 65,
    icon: '🫘', swahili: 'Choroko', category: 'Chakula'
  },
  'kunde': {
    kc: { mwanzo: 0.3, katikati: 1.0, mwisho: 0.4 },
    water_needed: 220, days_to_maturity: 70,
    icon: '🫘', swahili: 'Kunde', category: 'Chakula'
  },

  // 🍠 Mizizi (Roots and Tubers)
  'muhogo': {
    kc: { mwanzo: 0.3, katikati: 0.8, mwisho: 0.3 },
    water_needed: 320, days_to_maturity: 180,
    icon: '🍠', swahili: 'Muhogo', category: 'Chakula'
  },
  'viazi_vitamu': {
    kc: { mwanzo: 0.3, katikati: 0.9, mwisho: 0.4 },
    water_needed: 270, days_to_maturity: 90,
    icon: '🍠', swahili: 'Viazi Vitamu', category: 'Chakula'
  },
  'viazi_mviringo': {
    kc: { mwanzo: 0.3, katikati: 1.1, mwisho: 0.5 },
    water_needed: 320, days_to_maturity: 80,
    icon: '🥔', swahili: 'Viazi Mviringo', category: 'Chakula'
  },

  // 🍅 Mboga (Vegetables)
  'nyanya': {
    kc: { mwanzo: 0.4, katikati: 1.2, mwisho: 0.6 },
    water_needed: 360, days_to_maturity: 80,
    icon: '🍅', swahili: 'Nyanya', category: 'Mboga'
  },
  'vitunguu': {
    kc: { mwanzo: 0.4, katikati: 1.05, mwisho: 0.6 },
    water_needed: 310, days_to_maturity: 90,
    icon: '🧅', swahili: 'Vitunguu Swaumu/Maji', category: 'Mboga'
  },
  'vitunguu_saumu': {
    kc: { mwanzo: 0.4, katikati: 1.0, mwisho: 0.5 },
    water_needed: 290, days_to_maturity: 110,
    icon: '🧄', swahili: 'Vitunguu Saumu (Garlic)', category: 'Mboga'
  },
  'kabichi': {
    kc: { mwanzo: 0.4, katikati: 1.1, mwisho: 0.5 },
    water_needed: 280, days_to_maturity: 70,
    icon: '🥬', swahili: 'Kabichi', category: 'Mboga'
  },
  'karoti': {
    kc: { mwanzo: 0.3, katikati: 1.0, mwisho: 0.5 },
    water_needed: 240, days_to_maturity: 65,
    icon: '🥕', swahili: 'Karoti', category: 'Mboga'
  },
  'hoho': {
    kc: { mwanzo: 0.3, katikati: 1.1, mwisho: 0.6 },
    water_needed: 300, days_to_maturity: 75,
    icon: '🫑', swahili: 'Pilipili Hoho', category: 'Mboga'
  },
  'pilipili': {
    kc: { mwanzo: 0.3, katikati: 1.0, mwisho: 0.5 },
    water_needed: 270, days_to_maturity: 70,
    icon: '🌶️', swahili: 'Pilipili Kali', category: 'Mboga'
  },
  'bilinganya': {
    kc: { mwanzo: 0.3, katikati: 1.05, mwisho: 0.5 },
    water_needed: 290, days_to_maturity: 85,
    icon: '🍆', swahili: 'Bilinganya', category: 'Mboga'
  },
  'mchicha': {
    kc: { mwanzo: 0.4, katikati: 0.95, mwisho: 0.4 },
    water_needed: 180, days_to_maturity: 30,
    icon: '🥬', swahili: 'Mchicha (Spinach/Amaranth)', category: 'Mboga'
  },
  'matango': {
    kc: { mwanzo: 0.35, katikati: 1.0, mwisho: 0.55 },
    water_needed: 250, days_to_maturity: 60,
    icon: '🥒', swahili: 'Matango (Cucumbers)', category: 'Mboga'
  },
  'maboga': {
    kc: { mwanzo: 0.3, katikati: 0.95, mwisho: 0.5 },
    water_needed: 280, days_to_maturity: 95,
    icon: '🎃', swahili: 'Maboga (Pumpkins)', category: 'Mboga'
  },

  // 🍉 Matunda (Fruits)
  'tikiti_maji': {
    kc: { mwanzo: 0.4, katikati: 1.0, mwisho: 0.6 },
    water_needed: 350, days_to_maturity: 90,
    icon: '🍉', swahili: 'Tikiti Maji', category: 'Matunda'
  },
  'ndizi': {
    kc: { mwanzo: 0.4, katikati: 1.1, mwisho: 0.6 },
    water_needed: 420, days_to_maturity: 120,
    icon: '🍌', swahili: 'Ndizi', category: 'Matunda'
  },
  'embe': {
    kc: { mwanzo: 0.4, katikati: 0.9, mwisho: 0.6 },
    water_needed: 360, days_to_maturity: 180,
    icon: '🥭', swahili: 'Embe', category: 'Matunda'
  },
  'chungwa': {
    kc: { mwanzo: 0.4, katikati: 0.8, mwisho: 0.6 },
    water_needed: 340, days_to_maturity: 200,
    icon: '🍊', swahili: 'Chungwa / Ndimu', category: 'Matunda'
  },
  'parachichi': {
    kc: { mwanzo: 0.4, katikati: 0.9, mwisho: 0.65 },
    water_needed: 410, days_to_maturity: 210,
    icon: '🥑', swahili: 'Parachichi (Avocado)', category: 'Matunda'
  },
  'papai': {
    kc: { mwanzo: 0.4, katikati: 1.0, mwisho: 0.6 },
    water_needed: 310, days_to_maturity: 150,
    icon: '🍈', swahili: 'Papai', category: 'Matunda'
  },
  'nanasi': {
    kc: { mwanzo: 0.3, katikati: 0.8, mwisho: 0.45 },
    water_needed: 260, days_to_maturity: 180,
    icon: '🍍', swahili: 'Nanasi', category: 'Matunda'
  },
  'limao': {
    kc: { mwanzo: 0.4, katikati: 0.8, mwisho: 0.6 },
    water_needed: 330, days_to_maturity: 190,
    icon: '🍋', swahili: 'Limao (Lemon)', category: 'Matunda'
  },
  'chenza': {
    kc: { mwanzo: 0.4, katikati: 0.85, mwisho: 0.6 },
    water_needed: 330, days_to_maturity: 180,
    icon: '🍊', swahili: 'Chenza (Tangerine)', category: 'Matunda'
  },

  // 💼 Mazao ya Biashara (Cash Crops)
  'alizeti': {
    kc: { mwanzo: 0.3, katikati: 1.15, mwisho: 0.4 },
    water_needed: 350, days_to_maturity: 105,
    icon: '🌻', swahili: 'Alizeti (Sunflower)', category: 'Biashara'
  },
  'ufuta': {
    kc: { mwanzo: 0.3, katikati: 1.1, mwisho: 0.35 },
    water_needed: 280, days_to_maturity: 90,
    icon: '🌱', swahili: 'Ufuta (Sesame Seed)', category: 'Biashara'
  },
  'mkonge': {
    kc: { mwanzo: 0.25, katikati: 0.7, mwisho: 0.3 },
    water_needed: 250, days_to_maturity: 365,
    icon: '🎋', swahili: 'Mkonge (Sisal)', category: 'Biashara'
  },
  'tangawizi': {
    kc: { mwanzo: 0.35, katikati: 1.05, mwisho: 0.5 },
    water_needed: 380, days_to_maturity: 180,
    icon: '🫚', swahili: 'Tangawizi (Ginger)', category: 'Biashara'
  },
  'kakao': {
    kc: { mwanzo: 0.4, katikati: 0.95, mwisho: 0.6 },
    water_needed: 420, days_to_maturity: 270,
    icon: '🫘', swahili: 'Kakao (Cocoa)', category: 'Biashara'
  },
  'karafuu': {
    kc: { mwanzo: 0.4, katikati: 0.9, mwisho: 0.6 },
    water_needed: 450, days_to_maturity: 270,
    icon: '🌸', swahili: 'Karafuu (Cloves Zanzibar)', category: 'Biashara'
  },
  'kahawa': {
    kc: { mwanzo: 0.4, katikati: 0.9, mwisho: 0.5 },
    water_needed: 400, days_to_maturity: 270,
    icon: '☕', swahili: 'Kahawa (Coffee)', category: 'Biashara'
  },
  'chai': {
    kc: { mwanzo: 0.4, katikati: 0.9, mwisho: 0.5 },
    water_needed: 380, days_to_maturity: 240,
    icon: '🍵', swahili: 'Chai (Tea)', category: 'Biashara'
  },
  'pamba': {
    kc: { mwanzo: 0.3, katikati: 1.1, mwisho: 0.5 },
    water_needed: 400, days_to_maturity: 120,
    icon: '🧵', swahili: 'Pamba (Cotton)', category: 'Biashara'
  },
  'miwa': {
    kc: { mwanzo: 0.4, katikati: 1.25, mwisho: 0.6 },
    water_needed: 520, days_to_maturity: 365,
    icon: '🎋', swahili: 'Miwa (Sugarcane)', category: 'Biashara'
  },
  'tumbaku': {
    kc: { mwanzo: 0.3, katikati: 1.05, mwisho: 0.55 },
    water_needed: 360, days_to_maturity: 90,
    icon: '🍁', swahili: 'Tumbaku (Tobacco)', category: 'Biashara'
  },
  'korosho': {
    kc: { mwanzo: 0.3, katikati: 0.8, mwisho: 0.4 },
    water_needed: 300, days_to_maturity: 240,
    icon: '🥜', swahili: 'Korosho (Cashew)', category: 'Biashara'
  }
};

export const TANZANIA_SEED_VARIETIES: Record<string, string[]> = {
  'mahindi': ['Seedco 513', 'Pannar 15', 'Pioneer H628', 'SC 627', 'SC 403', 'Tembo H615', 'DK 8031', 'Staha', 'Kito'],
  'mpunga': ['SARO 5 (TXD 306)', 'Komboka', 'Tai', 'SUPA', 'NERICA 1', 'NERICA 4', 'Kahogo'],
  'ngano': ['Juhudi', 'Sifa', 'Meru', 'Kilima', 'Mwamba'],
  'mtama': ['Tegemeo', 'Pato', 'Macia', 'Serena', 'Sila'],
  'ulezi': ['U15', 'P224', 'Kazi', 'ACC 32'],
  'uwele': ['Okoa', 'Shibe'],
  'maharage': ['Lyamungo 90', 'Lyamungo 85', 'Wanja', 'Selian 97', 'Jesca', 'Uyole 96', 'Calima'],
  'mbaazi': ['Mali', 'Tumati', 'Karatu', 'Kiboko'],
  'soya': ['Bossier', 'Uyole Soya 1', 'Uyole Soya 2', 'TGx'],
  'njugu': ['Pendo', 'Mnanje', 'Mangola Red', 'Naliendele', 'Kijani'],
  'njugu_mawe': ['Dodoma Local', 'Morogoro Brown', 'Singida Cream'],
  'choroko': ['Imara', 'Mwanga', 'Green-1', 'Green-2'],
  'kunde': ['Tumaini', 'Fahari', 'Vuli-1', 'Vuli-2'],
  'muhogo': ['Mkuranga', 'Kiroba', 'Mkumba', 'Shibe', 'Tajiri'],
  'viazi_vitamu': ['Kabode (Orange-fleshed)', 'Jewel', 'Kakamega', 'Simama', 'Polista'],
  'viazi_mviringo': ['Shangi', 'Kipano', 'Meru', 'Uyole', 'Asante'],
  'nyanya': ['Assila F1', 'Eden F1', 'Anna F1', 'Tengeru 97', 'Rio Grande', 'Cal J', 'Mwanga F1'],
  'vitunguu': ['Red Coach F1', 'Red Sany', 'Texas Grano', 'Red Pinoy', 'Bombay Red'],
  'vitunguu_saumu': ['Jina la Kienyeji', 'Sangare', 'Egyptian White'],
  'kabichi': ['Gloria F1', 'Copenhagen Market', 'Prize Drumhead', 'Red Acre'],
  'karoti': ['Chantenay', 'Nantes', 'Kuroda'],
  'hoho': ['California Wonder', 'Yolo Wonder', 'Emerald Giant'],
  'pilipili': ['Habanero', 'Cayenne Long Slim', 'Demon F1', 'Jalapeno'],
  'bilinganya': ['Black Beauty', 'Florida High Bush', 'Long Purple'],
  'mchicha': ['Shonako', 'Plainsman', 'Dubia', 'Local Green'],
  'matango': ['Ashley', 'Darina F1', 'Palomar', 'Super Marketer'],
  'maboga': ['Waltham Butternut', 'Sweet Mama', 'Local Round'],
  'tikiti_maji': ['Sukari F1', 'Crimson Sweet', 'Charleston Gray', 'Zebra F1'],
  'ndizi': ['Mshale', 'Malindi', 'Kisukari', 'Bukoba', 'Grand Naine', 'Williams'],
  'embe': ['Kent', 'Keitt', 'Tommy Atkins', 'Apple Mango', 'Ngowe', 'Boribo'],
  'chungwa': ['Valencia Late', 'Washington Navel', 'Hamlin'],
  'parachichi': ['Hass', 'Fuerte', 'Zutano', 'Booth 7'],
  'papai': ['Solo', 'Sunrise', 'Calina IPB9', 'Malkia F1'],
  'nanasi': ['Smooth Cayenne', 'Queen', 'Red Spanish'],
  'limao': ['Eureka', 'Lisbon', 'Meyer'],
  'chenza': ['Clementine', 'Dancy', 'Satsuma'],
  'alizeti': ['Record', 'Hysun 33', 'Super-400', 'Serena'],
  'ufuta': ['Lindi 02', 'Morogoro 90', 'Ziada-94'],
  'mkonge': ['ML 1', 'ML 2', 'Hybrid 11648'],
  'tangawizi': ['Local Ginger', 'Kigoma Blue'],
  'kakao': ['Amelonado', 'Criollo', 'Trinitario'],
  'karafuu': ['Zanzibar Local'],
  'kahawa': ['Kent', 'KP423', 'Bourbon', 'Robusta Bukoba', 'KP532'],
  'chai': ['TRFK 306', 'Clones', 'Local Tea'],
  'pamba': ['UK 91', 'UK M2', 'UK 77'],
  'miwa': ['CO 617', 'CO 421', 'NCo 376'],
  'tumbaku': ['K326', 'McNair 944', 'Virginia Gold'],
  'korosho': ['AC4', 'AC10', 'AC28', 'Naliendele Select']
};
