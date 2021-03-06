{% extends "layouts/layout.swig" %}

{% block title %}{{ title }} - Photos du Revermont, VTT, paysages, ...{% endblock %}

{% block menu %}{% set selected = section %}{% parent %}{% endblock %}

{% block breadcrumb %}
    {% include "parts/breadcrumb.swig" with {
        struct: [
            {path: "/", name: "VTT dans le Revermont"},
            {path: "/photos/", name: "Photos"},
            {path: false, name: title, current: path},
        ]
    } %}
{% endblock %}

{% block content %}
<div itemscope itemtype="http://www.schema.org/ImageObject" >
    <h1 class="icon-photo page-title" itemprop="name">{{ title }}</h1>

    <section class="pure-g">
        <div class="pure-u-1 pure-u-md-3-5 pure-u-lg-3-5 photo-main-column">
            <a href="{{ variations.original.fullpath|url(true) }}" itemprop="contentUrl">
                <img src="{{ variations.full.fullpath|url(true) }}" alt="{{ title }}">
            </a>
            <nav class="pure-g">
                <div class="pure-u-1-2 photo-previous">
                {% if previous %}
                    {% include "parts/photonav.swig" with {photo: previous, variation: "nav"} %}
                {% endif %}
                </div>
                <div class="pure-u-1-2 photo-next">
                {% if next %}
                    {% include "parts/photonav.swig" with {photo: next, variation: "nav"} %}
                {% endif %}
                </div>
            </nav>
        </div>
        <div class="pure-u-1 pure-u-md-2-5 pure-u-lg-2-5">
            {% if latlon %}
            <div itemprop="contentLocation" itemscope itemtype="http://www.schema.org/Place">
                <div class="photo-map"></div>
                <div itemprop="geo" itemscope itemtype="http://www.schema.org/GeoCoordinates">
                    <meta itemprop="latitude" content="{{ latlon[0] }}">
                    <meta itemprop="longitude" content="{{ latlon[1] }}">
                </div>
            </div>
            {% endif %}
            <div class="photo-content">
                <div itemprop="text" class="contents">{{ contents|safe }}</div>

                {% if created %}
                <p>Date&nbsp;: <time datetime="{{ created.format() }}" itemprop="dateCreated">{{ created.format(config.dateTimeFormat) }}</time></p>
                {% endif %}
                {% include "parts/keywords.swig" with {tags: tags} %}

                <h3>Partager sur les réseaux sociaux</h3>
{% include "parts/share.swig" with {url: path, text: "Blog de " + config.shortTitle } %}
            </div>

        </div>
    </section>

    {% include "parts/comments.swig" %}
</div>
{% endblock %}

{% block javascriptCode %}
{% if latlon %}
RB.photoMap({
    'ignApiKey': "{{ config.ignKey }}",
    'map': '.photo-map',
    'latlon': {{ latlon|json|safe }},
    'zoom': 13,
    'photosUrl': "{{ "photos/data.js"|url(true) }}?{{ photos.metadata.maxDate }}",
});
{% endif %}
{% endblock %}

{% block meta %}
{% parent %}
{% include "parts/twitter-card.swig" with {
    type: "photo",
    site: "@" + config.twitter,
    creator: "@dpobel",
    title: title,
    description: contents|striptags|shorten(200),
    src: variations.full.fullpath
} %}
{% endblock %}
