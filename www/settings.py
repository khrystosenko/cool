import os


def rel(*x):
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), *x)

try:
    from local_settings import *
except ImportError:
    raise Exception('You forgot to create local_settings.py file in www directory.')

DEBUG = DJANGO_DEV_SERVER
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com')
)

MANAGERS = ADMINS

DATABASES = {
    'default': {},
}

# Local time zone for this installation.  Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Los_Angeles'

# Language code for this installation.  All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

LOGGING_CONFIG = None

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = False

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = False

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'a9sd86f^*dga88^(*g(egeg86*^*)^faesg^==sf68hf$&d7aj'

SESSION_EXP_TIME = 60 * 60 * 24 * 365
ROOM_EXP_TIME = 60 * 60 * 24 * 7

STATIC_URL = '/'

STATIC_ROOT = rel('htdocs')

STATICFILES_DIRS = (
    os.path.join(STATIC_ROOT, 'styles/'),
    os.path.join(STATIC_ROOT, 'scripts/'),
    os.path.join(STATIC_ROOT, 'images/')
)

# List of callables that know how to import templates from various sources.

TEMPLATE_LOADERS = (
    'django_jinja.loaders.AppLoader',
    'django_jinja.loaders.FileSystemLoader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
)

ROOT_URLCONF = 'views.urls'

TEMPLATE_DIRS = (
    rel('views/templates'),
)

INSTALLED_APPS = (
    'django_jinja',
)

DATABASES_INFO_PATH = rel('..', 'db')

DEFAULT_JINJA2_TEMPLATE_EXTENSION = '.html'

ALLOWED_HOSTS = ['*']

REGEXP = {
    'username': '^\w+$',
    'email': '([^@|\s]+@[^@]+\.[^@|\s]+)',
    'room_name': '^[\w-]{1,36}$',
    'link': [
        {
          'service': 'twitch', 
          'pattern': r'^(((https?:\/\/)?(www\.)?)?twitch\.tv\/([^\/]+)\/?)?$'
        },
        {
          'service': 'hitbox', 
          'pattern': r'^(((https?:\/\/)?(www\.)?)?hitbox\.tv\/([^\/]+)\/?)?$'
        },
        {
          'service': 'azubu', 
          'pattern': r'^(((https?:\/\/)?(www\.)?)?azubu\.tv\/([^\/]+)\/?)?$'
        },
        {
          'service': 'dailymotion', 
          'pattern': r'^(((https?:\/\/)?games\.)?dailymotion\.com\/(live\/)?([^\/]+)\/?)?$'
        },
        {
          'service': 'douyutv', 
          'pattern': r'^(((https?:\/\/)?(www\.)?)?douyutv\.com\/([^\/]+)\/?)?$'
        },
        {
          'service': 'huomaotv', 
          'pattern': r'^(((https?:\/\/)?(www\.)?)?huomaotv\.com\/live\/([^\/]+)\/?)?$'
        },
        {
          'service': 'youtube',
          'pattern': r'^(((https?:\/\/)?(www\.)?)?youtube\.com\/watch\?v=([^\/]+)\/?)?$'
        },
        {
          'service': 'youtube',
          'pattern': r'^(((https?:\/\/)?(www\.)?)?youtu\.be\/([^\/]+)\/?)?$'
        },
        {
          'service': 'youtube',
          'pattern': r'^(((https?:\/\/)?(www\.)?)?youtube\.com\/watch\?v\=([^\/]+)\/?(\&feature\=youtu\.be))?$'
        },
    ]
}

ROOMIT_LANG_CODE = {u'gv': u'Manx', u'gu': u'Gujarati', u'scn': u'Sicilian', u'rom': u'Romany', u'ron': u'Romanian; Moldavian; Moldovan', u'alg': u'Algonquian languages', u'oss': u'Ossetian; Ossetic', u'ale': u'Aleut', u'alb': u'Albanian', u'sco': u'Scots', u'mni': u'Manipuri', u'gd': u'Gaelic; Scottish Gaelic', u'per': u'Persian', u'ga': u'Irish', u'mno': u'Manobo languages', u'osa': u'Osage', u'gn': u'Guarani', u'alt': u'Southern Altai', u'gl': u'Galician', u'mwr': u'Marwari', u'smn': u'Inari Sami', u'tw': u'Twi', u'tt': u'Tatar', u'tr': u'Turkish', u'ts': u'Tsonga', u'tn': u'Tswana', u'to': u'Tonga (Tonga Islands)', u'aus': u'Australian languages', u'tk': u'Turkmen', u'th': u'Thai', u'roa': u'Romance languages', u'ven': u'Venda', u'tg': u'Tajik', u'te': u'Telugu', u'uga': u'Ugaritic', u'mwl': u'Mirandese', u'ty': u'Tahitian', u'fas': u'Persian', u'fat': u'Fanti', u'qaa-qtz': u'Reserved for local use', u'ay': u'Aymara', u'fan': u'Fang', u'fao': u'Faroese', u'wo': u'Wolof', u'rm': u'Romansh', u'sme': u'Northern Sami', u'din': u'Dinka', u'hye': u'Armenian', u'bla': u'Siksika', u'cmc': u'Chamic languages', u'srd': u'Sardinian', u'mdr': u'Mandar', u'car': u'Galibi Carib', u'div': u'Divehi; Dhivehi; Maldivian', u'zh': u'Chinese', u'tem': u'Timne', u'xho': u'Xhosa', u'nwc': u'Classical Newari; Old Newari; Classical Nepal Bhasa', u'za': u'Zhuang; Chuang', u'mh': u'Marshallese', u'mk': u'Macedonian', u'nbl': u'Ndebele, South; South Ndebele', u'zu': u'Zulu', u'ter': u'Tereno', u'tet': u'Tetum', u'mnc': u'Manchu', u'sun': u'Sundanese', u'abk': u'Abkhazian', u'suk': u'Sukuma', u'kur': u'Kurdish', u'kum': u'Kumyk', u'slo': u'Slovak', u'sus': u'Susu', u'new': u'Nepal Bhasa; Newari', u'kua': u'Kuanyama; Kwanyama', u'sux': u'Sumerian', u'ms': u'Malay', u'men': u'Mende', u'mul': u'Multiple languages', u'lez': u'Lezghian', u'gla': u'Gaelic; Scottish Gaelic', u'bos': u'Bosnian', u'gle': u'Irish', u'eka': u'Ekajuk', u'glg': u'Galician', u'akk': u'Akkadian', u'uzb': u'Uzbek', u'dra': u'Dravidian languages', u'aka': u'Akan', u'bod': u'Tibetan', u'glv': u'Manx', u'jrb': u'Judeo-Arabic', u'vie': u'Vietnamese', u'ipk': u'Inupiaq', u'rum': u'Romanian; Moldavian; Moldovan', u'sgn': u'Sign Languages', u'sga': u'Irish, Old (to 900)', u'afa': u'Afro-Asiatic languages', u'bre': u'Breton', u'apa': u'Apache languages', u'bra': u'Braj', u'aym': u'Aymara', u'cha': u'Chamorro', u'chb': u'Chibcha', u'che': u'Chechen', u'chg': u'Chagatai', u'chi': u'Chinese', u'chk': u'Chuukese', u'chm': u'Mari', u'chn': u'Chinook jargon', u'cho': u'Choctaw', u'chp': u'Chipewyan; Dene Suline', u'chr': u'Cherokee', u'chu': u'Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic', u'chv': u'Chuvash', u'chy': u'Cheyenne', u'msa': u'Malay', u'ti': u'Tigrinya', u'iii': u'Sichuan Yi; Nuosu', u'ml': u'Malayalam', u'vot': u'Votic', u'mg': u'Malagasy', u'ndo': u'Ndonga', u'ibo': u'Igbo', u'iba': u'Iban', u'mn': u'Mongolian', u'mi': u'Maori', u'deu': u'German', u'cau': u'Caucasian languages', u'cat': u'Catalan; Valencian', u'mt': u'Maltese', u'cai': u'Central American Indian languages', u'del': u'Delaware', u'den': u'Slave (Athapascan)', u'mr': u'Marathi', u'ta': u'Tamil', u'my': u'Burmese', u'cad': u'Caddo', u'tat': u'Tatar', u'oc': u'Occitan (post 1500); Proven\xe7al', u'tam': u'Tamil', u'spa': u'Spanish; Castilian', u'tah': u'Tahitian', u'tai': u'Tai languages', u'cze': u'Czech', u'afh': u'Afrihili', u'eng': u'English', u'enm': u'English, Middle (1100-1500)', u'ava': u'Avaric', u'nyn': u'Nyankole', u'nyo': u'Nyoro', u'gez': u'Geez', u'nya': u'Chichewa; Chewa; Nyanja', u'sio': u'Siouan languages', u'sin': u'Sinhala; Sinhalese', u'afr': u'Afrikaans', u'lam': u'Lamba', u'fr': u'French', u'lao': u'Lao', u'lah': u'Lahnda', u'nym': u'Nyamwezi', u'sna': u'Shona', u'lad': u'Ladino', u'fy': u'Western Frisian', u'snk': u'Soninke', u'fa': u'Persian', u'mac': u'Macedonian', u'mad': u'Madurese', u'ff': u'Fulah', u'lat': u'Latin', u'fi': u'Finnish', u'fj': u'Fijian', u'mal': u'Malayalam', u'mao': u'Maori', u'fo': u'Faroese', u'mak': u'Makasar', u'egy': u'Egyptian (Ancient)', u'znd': u'Zande languages', u'ss': u'Swati', u'sr': u'Serbian', u'sq': u'Albanian', u'sit': u'Sino-Tibetan languages', u'sw': u'Swahili', u'sv': u'Swedish', u'su': u'Sundanese', u'st': u'Sotho, Southern', u'sk': u'Slovak', u'si': u'Sinhala; Sinhalese', u'so': u'Somali', u'sn': u'Shona', u'sm': u'Samoan', u'sl': u'Slovenian', u'sc': u'Sardinian', u'sa': u'Sanskrit', u'sg': u'Sango', u'se': u'Northern Sami', u'sd': u'Sindhi', u'zen': u'Zenaga', u'kbd': u'Kabardian', u'ita': u'Italian', u'vai': u'Vai', u'csb': u'Kashubian', u'tsn': u'Tswana', u'lg': u'Ganda', u'pt': u'Portuguese', u'lb': u'Luxembourgish; Letzeburgesch', u'fiu': u'Finno-Ugrian languages', u'ln': u'Lingala', u'geo': u'Georgian', u'li': u'Limburgan; Limburger; Limburgish', u'byn': u'Blin; Bilin', u'lt': u'Lithuanian', u'lu': u'Luba-Katanga', u'gem': u'Germanic languages', u'fij': u'Fijian', u'fin': u'Finnish', u'eus': u'Basque', u'yi': u'Yiddish', u'non': u'Norse, Old', u'ceb': u'Cebuano', u'yo': u'Yoruba', u'dan': u'Danish', u'cel': u'Celtic languages', u'bat': u'Baltic languages', u'nob': u'Bokm\xe5l, Norwegian; Norwegian Bokm\xe5l', u'dak': u'Dakota', u'ces': u'Czech', u'dar': u'Dargwa', u'qu': u'Quechua', u'day': u'Land Dayak languages', u'nor': u'Norwegian', u'gba': u'Gbaya', u'ssa': u'Nilo-Saharan languages', u'kpe': u'Kpelle', u'man': u'Mandingo', u'guj': u'Gujarati', u'wel': u'Welsh', u'el': u'Greek, Modern (1453-)', u'eo': u'Esperanto', u'en': u'English', u'map': u'Austronesian languages', u'ee': u'Ewe', u'tpi': u'Tok Pisin', u'mdf': u'Moksha', u'mas': u'Masai', u'mar': u'Marathi', u'eu': u'Basque', u'et': u'Estonian', u'es': u'Spanish; Castilian', u'ru': u'Russian', u'rw': u'Kinyarwanda', u'goh': u'German, Old High (ca.750-1050)', u'sms': u'Skolt Sami', u'smo': u'Samoan', u'may': u'Malay', u'smj': u'Lule Sami', u'smi': u'Sami languages', u'nic': u'Niger-Kordofanian languages', u'got': u'Gothic', u'rn': u'Rundi', u'ro': u'Romanian; Moldavian; Moldovan', u'dsb': u'Lower Sorbian', u'sma': u'Southern Sami', u'gor': u'Gorontalo', u'ast': u'Asturian; Bable; Leonese; Asturleonese', u'orm': u'Oromo', u'que': u'Quechua', u'ori': u'Oriya', u'crh': u'Crimean Tatar; Crimean Turkish', u'asm': u'Assamese', u'pus': u'Pushto; Pashto', u'dgr': u'Dogrib', u'ltz': u'Luxembourgish; Letzeburgesch', u'ath': u'Athapascan languages', u'wln': u'Walloon', u'isl': u'Icelandic', u'xh': u'Xhosa', u'mag': u'Magahi', u'mai': u'Maithili', u'mah': u'Marshallese', u'tel': u'Telugu', u'lav': u'Latvian', u'zap': u'Zapotec', u'yid': u'Yiddish', u'kok': u'Konkani', u'kom': u'Komi', u'kon': u'Kongo', u'ukr': u'Ukrainian', u'ton': u'Tonga (Tonga Islands)', u'zxx': u'No linguistic content; Not applicable', u'kos': u'Kosraean', u'kor': u'Korean', u'tog': u'Tonga (Nyasa)', u'roh': u'Romansh', u'hun': u'Hungarian', u'hup': u'Hupa', u'lug': u'Ganda', u'cym': u'Welsh', u'udm': u'Udmurt', u'bej': u'Beja; Bedawiyet', u'ben': u'Bengali', u'bel': u'Belarusian', u'bem': u'Bemba', u'tsi': u'Tsimshian', u'ber': u'Berber languages', u'nzi': u'Nzima', u'sai': u'South American Indian (Other)', u'ang': u'English, Old (ca.450-1100)', u'pra': u'Prakrit languages', u'san': u'Sanskrit', u'bho': u'Bhojpuri', u'sal': u'Salishan languages', u'pro': u'Proven\xe7al, Old (to 1500)', u'raj': u'Rajasthani', u'sad': u'Sandawe', u'anp': u'Angika', u'rap': u'Rapanui', u'sas': u'Sasak', u'nqo': u"N'Ko", u'sat': u'Santali', u'min': u'Minangkabau', u'lim': u'Limburgan; Limburger; Limburgish', u'lin': u'Lingala', u'lit': u'Lithuanian', u'bur': u'Burmese', u'srn': u'Sranan Tongo', u'btk': u'Batak languages', u'ypk': u'Yupik languages', u'mis': u'Uncoded languages', u'kac': u'Kachin; Jingpho', u'kab': u'Kabyle', u'kaa': u'Kara-Kalpak', u'kan': u'Kannada', u'kam': u'Kamba', u'kal': u'Kalaallisut; Greenlandic', u'kas': u'Kashmiri', u'kar': u'Karen languages', u'kaw': u'Kawi', u'kau': u'Kanuri', u'kat': u'Georgian', u'kaz': u'Kazakh', u'tyv': u'Tuvinian', u'awa': u'Awadhi', u'urd': u'Urdu', u'ka': u'Georgian', u'doi': u'Dogri', u'kg': u'Kongo', u'kk': u'Kazakh', u'kj': u'Kuanyama; Kwanyama', u'ki': u'Kikuyu; Gikuyu', u'ko': u'Korean', u'kn': u'Kannada', u'km': u'Central Khmer', u'kl': u'Kalaallisut; Greenlandic', u'ks': u'Kashmiri', u'kr': u'Kanuri', u'kw': u'Cornish', u'kv': u'Komi', u'ku': u'Kurdish', u'ky': u'Kirghiz; Kyrgyz', u'kut': u'Kutenai', u'tkl': u'Tokelau', u'nld': u'Dutch; Flemish', u'oji': u'Ojibwa', u'oci': u'Occitan (post 1500); Proven\xe7al', u'bua': u'Buriat', u'wol': u'Wolof', u'jav': u'Javanese', u'hrv': u'Croatian', u'zza': u'Zaza; Dimili; Dimli; Kirdki; Kirmanjki; Zazaki', u'ger': u'German', u'mga': u'Irish, Middle (900-1200)', u'hit': u'Hittite', u'dyu': u'Dyula', u'ssw': u'Swati', u'de': u'German', u'da': u'Danish', u'dz': u'Dzongkha', u'lui': u'Luiseno', u'dv': u'Divehi; Dhivehi; Maldivian', u'hil': u'Hiligaynon', u'him': u'Himachali languages; Western Pahari languages', u'hin': u'Hindi', u'crp': u'Creoles and pidgins ', u'myn': u'Mayan languages', u'bas': u'Basa', u'baq': u'Basque', u'bad': u'Banda languages', u'nep': u'Nepali', u'cre': u'Cree', u'ban': u'Balinese', u'bal': u'Baluchi', u'bam': u'Bambara', u'bak': u'Bashkir', u'shn': u'Shan', u'bai': u'Bamileke languages', u'arp': u'Arapaho', u'art': u'Artificial languages', u'arw': u'Arawak', u'ara': u'Arabic', u'arc': u'Official Aramaic (700-300 BCE); Imperial Aramaic (700-300 BCE)', u'arg': u'Aragonese', u'sem': u'Semitic languages', u'sel': u'Selkup', u'nub': u'Nubian languages', u'arm': u'Armenian', u'arn': u'Mapudungun; Mapuche', u'lus': u'Lushai', u'wa': u'Walloon', u'mus': u'Creek', u'lua': u'Luba-Lulua', u'lub': u'Luba-Katanga', u'iro': u'Iroquoian languages', u'ira': u'Iranian languages', u'mun': u'Munda languages', u'tur': u'Turkish', u'lun': u'Lunda', u'luo': u'Luo (Kenya and Tanzania)', u'iku': u'Inuktitut', u'tso': u'Tsonga', u'tup': u'Tupi languages', u'jv': u'Javanese', u'zbl': u'Blissymbols; Blissymbolics; Bliss', u'tut': u'Altaic languages', u'tuk': u'Turkmen', u'tum': u'Tumbuka', u'ja': u'Japanese', u'cop': u'Coptic', u'cos': u'Corsican', u'cor': u'Cornish', u'ilo': u'Iloko', u'la': u'Latin', u'gwi': u"Gwich'in", u'und': u'Undetermined', u'lo': u'Lao', u'tli': u'Tlingit', u'tlh': u'Klingon; tlhIngan-Hol', u'nno': u'Norwegian Nynorsk; Nynorsk, Norwegian', u'ch': u'Chamorro', u'co': u'Corsican', u'ca': u'Catalan; Valencian', u'por': u'Portuguese', u'ce': u'Chechen', u'pon': u'Pohnpeian', u'pol': u'Polish', u'sah': u'Yakut', u'cs': u'Czech', u'cr': u'Cree', u'bnt': u'Bantu (Other)', u'cv': u'Chuvash', u'cu': u'Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic', u'lv': u'Latvian', u'fra': u'French', u'dum': u'Dutch, Middle (ca.1050-1350)', u'fre': u'French', u'swa': u'Swahili', u'dua': u'Duala', u'fro': u'French, Old (842-ca.1400)', u'yap': u'Yapese', u'frm': u'French, Middle (ca.1400-1600)', u'nb': u'Bokm\xe5l, Norwegian; Norwegian Bokm\xe5l', u'frs': u'Eastern Frisian', u'frr': u'Northern Frisian', u'yao': u'Yao', u'pa': u'Panjabi; Punjabi', u'xal': u'Kalmyk; Oirat', u'fry': u'Western Frisian', u'pi': u'Pali', u'dut': u'Dutch; Flemish', u'pl': u'Polish', u'gay': u'Gayo', u'oto': u'Otomian languages', u'ota': u'Turkish, Ottoman (1500-1928)', u'hmn': u'Hmong; Mong', u'ile': u'Interlingue; Occidental', u'myv': u'Erzya', u'gaa': u'Ga', u'fur': u'Friulian', u'mlg': u'Malagasy', u'slv': u'Slovenian', u'ain': u'Ainu', u'fil': u'Filipino; Pilipino', u'mlt': u'Maltese', u'slk': u'Slovak', u'rar': u'Rarotongan; Cook Islands Maori', u'ful': u'Fulah', u'sla': u'Slavic languages', u've': u'Venda', u'jpn': u'Japanese', u'vol': u'Volap\xfck', u'vi': u'Vietnamese', u'is': u'Icelandic', u'av': u'Avaric', u'iu': u'Inuktitut', u'it': u'Italian', u'vo': u'Volap\xfck', u'ii': u'Sichuan Yi; Nuosu', u'mya': u'Burmese', u'ik': u'Inupiaq', u'io': u'Ido', u'ine': u'Indo-European languages', u'ia': u'Interlingua (International Auxiliary Language Association)', u'ave': u'Avestan', u'jpr': u'Judeo-Persian', u'ie': u'Interlingue; Occidental', u'id': u'Indonesian', u'ig': u'Igbo', u'pap': u'Papiamento', u'ewo': u'Ewondo', u'pau': u'Palauan', u'ewe': u'Ewe', u'zgh': u'Standard Moroccan Tamazight', u'paa': u'Papuan languages', u'pag': u'Pangasinan', u'pal': u'Pahlavi', u'pam': u'Pampanga; Kapampangan', u'pan': u'Panjabi; Punjabi', u'syc': u'Classical Syriac', u'phi': u'Philippine languages', u'nog': u'Nogai', u'phn': u'Phoenician', u'kir': u'Kirghiz; Kyrgyz', u'nia': u'Nias', u'kik': u'Kikuyu; Gikuyu', u'syr': u'Syriac', u'kin': u'Kinyarwanda', u'niu': u'Niuean', u'gsw': u'Swiss German; Alemannic; Alsatian', u'tiv': u'Tiv', u'epo': u'Esperanto', u'jbo': u'Lojban', u'mic': u"Mi'kmaq; Micmac", u'tha': u'Thai', u'sam': u'Samaritan Aramaic', u'hai': u'Haida', u'gmh': u'German, Middle High (ca.1050-1500)', u'cus': u'Cushitic languages', u'ell': u'Greek, Modern (1453-)', u'efi': u'Efik', u'wen': u'Sorbian languages', u'ady': u'Adyghe; Adygei', u'elx': u'Elamite', u'ada': u'Adangme', u'nav': u'Navajo; Navaho', u'hat': u'Haitian; Haitian Creole', u'hau': u'Hausa', u'haw': u'Hawaiian', u'bin': u'Bini; Edo', u'amh': u'Amharic', u'bik': u'Bikol', u'bih': u'Bihari languages', u'mos': u'Mossi', u'moh': u'Mohawk', u'mon': u'Mongolian', u'bis': u'Bislama', u'tl': u'Tagalog', u'cy': u'Welsh', u'tib': u'Tibetan', u'tvl': u'Tuvalu', u'tgk': u'Tajik', u'ijo': u'Ijo languages', u'est': u'Estonian', u'kmb': u'Kimbundu', u'ice': u'Icelandic', u'peo': u'Persian, Old (ca.600-400 B.C.)', u'tgl': u'Tagalog', u'umb': u'Umbundu', u'tmh': u'Tamashek', u'fon': u'Fon', u'hsb': u'Upper Sorbian', u'be': u'Belarusian', u'bg': u'Bulgarian', u'run': u'Rundi', u'ba': u'Bashkir', u'ps': u'Pushto; Pashto', u'bm': u'Bambara', u'bn': u'Bengali', u'bo': u'Tibetan', u'bh': u'Bihari languages', u'bi': u'Bislama', u'sag': u'Sango', u'br': u'Breton', u'bs': u'Bosnian', u'rus': u'Russian', u'rup': u'Aromanian; Arumanian; Macedo-Romanian', u'pli': u'Pali', u'om': u'Oromo', u'oj': u'Ojibwa', u'ace': u'Achinese', u'ach': u'Acoli', u'nde': u'Ndebele, North; North Ndebele', u'dzo': u'Dzongkha', u'kru': u'Kurukh', u'srr': u'Serer', u'ido': u'Ido', u'srp': u'Serbian', u'kro': u'Kru languages', u'krl': u'Karelian', u'krc': u'Karachay-Balkar', u'nds': u'Low German; Low Saxon; German, Low; Saxon, Low', u'os': u'Ossetian; Ossetic', u'or': u'Oriya', u'zul': u'Zulu', u'twi': u'Twi', u'sog': u'Sogdian', u'nso': u'Pedi; Sepedi; Northern Sotho', u'swe': u'Swedish', u'som': u'Somali', u'son': u'Songhai languages', u'snd': u'Sindhi', u'sot': u'Sotho, Southern', u'mkd': u'Macedonian', u'wak': u'Wakashan languages', u'her': u'Herero', u'lol': u'Mongo', u'mkh': u'Mon-Khmer languages', u'heb': u'Hebrew', u'loz': u'Lozi', u'gil': u'Gilbertese', u'was': u'Washo', u'war': u'Waray', u'hz': u'Herero', u'hy': u'Armenian', u'sid': u'Sidamo', u'hr': u'Croatian', u'ht': u'Haitian; Haitian Creole', u'hu': u'Hungarian', u'hi': u'Hindi', u'ho': u'Hiri Motu', u'bul': u'Bulgarian', u'wal': u'Walamo', u'ha': u'Hausa', u'bug': u'Buginese', u'he': u'Hebrew', u'uz': u'Uzbek', u'aze': u'Azerbaijani', u'ur': u'Urdu', u'zha': u'Zhuang; Chuang', u'uk': u'Ukrainian', u'ug': u'Uighur; Uyghur', u'zho': u'Chinese', u'aa': u'Afar', u'ab': u'Abkhazian', u'ae': u'Avestan', u'uig': u'Uighur; Uyghur', u'af': u'Afrikaans', u'ak': u'Akan', u'am': u'Amharic', u'an': u'Aragonese', u'khi': u'Khoisan languages', u'as': u'Assamese', u'ar': u'Arabic', u'inh': u'Ingush', u'khm': u'Central Khmer', u'kho': u'Khotanese; Sakan', u'ind': u'Indonesian', u'kha': u'Khasi', u'az': u'Azerbaijani', u'ina': u'Interlingua (International Auxiliary Language Association)', u'inc': u'Indic languages', u'nl': u'Dutch; Flemish', u'nn': u'Norwegian Nynorsk; Nynorsk, Norwegian', u'no': u'Norwegian', u'na': u'Nauru', u'nah': u'Nahuatl languages', u'nai': u'North American Indian languages', u'nd': u'Ndebele, North; North Ndebele', u'ne': u'Nepali', u'tir': u'Tigrinya', u'ng': u'Ndonga', u'ny': u'Chichewa; Chewa; Nyanja', u'nap': u'Neapolitan', u'gre': u'Greek, Modern (1453-)', u'grb': u'Grebo', u'grc': u'Greek, Ancient (to 1453)', u'nau': u'Nauru', u'grn': u'Guarani', u'nr': u'Ndebele, South; South Ndebele', u'tig': u'Tigre', u'yor': u'Yoruba', u'nv': u'Navajo; Navaho', u'mri': u'Maori', u'zun': u'Zuni', u'sqi': u'Albanian', u'gon': u'Gondi', u'\ufeffaar': u'Afar', u'cpe': u'Creoles and pidgins, English based', u'cpf': u'Creoles and pidgins, French-based ', u'hmo': u'Hiri Motu', u'cpp': u'Creoles and pidgins, Portuguese-based '} 