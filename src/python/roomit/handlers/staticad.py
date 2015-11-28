import xml.etree.ElementTree as ET

from django.conf import settings


def get_data(slug):
    tree = ET.parse(settings.STATIC_PAGES_XML)
    root = tree.getroot()

    for child in root:
        if child.attrib['slug'] == slug:
            return child.attrib

    return {}