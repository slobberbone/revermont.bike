<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
    {% include "parts/rss_meta.swig" %}

    {% for obj in collections[exportCollection] %}
        {% include "parts/rss_item.swig" %}
    {% endfor %}
    </channel>
</rss>
