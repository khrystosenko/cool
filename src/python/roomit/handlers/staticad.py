import xml.etree.ElementTree as ET

from roomit import config

_config = config.get_config()


def get_data(slug):
    global _config

    tree = ET.parse(_config.get('roomit', 'static_pages'))
    root = tree.getroot()

    for child in root:
        if child.attrib['slug'] == slug:
            return child.attrib

    return {}