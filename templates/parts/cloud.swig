{% set tags = tagsList|sort %}
{% set totalPosts = collections.posts.length + collections.treks.length + collections.tracks.length + collections.photos.length %}
<ul class="tag-cloud">
{% for keyword in tags -%}
    {% set info = tagsList[keyword] %}
    <li class="tag" style="font-size: {{ (1 + info.weight/totalPosts)|round(2) }}em"><a href="{{ info.path|url }}">{{ keyword }}</a></li>
{%- endfor %}
</ul>
