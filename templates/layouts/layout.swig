<!doctype html>
<html lang="fr" itemscope itemtype="{% block pageItemType %}{% if pageItemType %}{{ pageItemType }}{% else %}http://www.schema.org/WebPage{% endif %}{% endblock %}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title itemprop="name">{% block title %}{{ config.title }}{% endblock %}</title>
    <link rel="stylesheet" href="{{ cssFile|url(true) }}">
    <!--[if lt IE 9]>
    <script>(function(){var tags=['header','article','footer','nav', 'time', 'section', 'figure', 'abbr'];for(var i=0;i!=tags.length;i++) document.createElement(tags[i]);})();</script>
    <![endif]-->
{% for feed in feeds %}
    <link rel="alternate" type="application/rss+xml" href="{{ feed.path|url(true) }}" title="{{ feed.title }}">
{% endfor %}
    <link rel="apple-touch-icon-precomposed" href="/favicon-152.png">
    <meta name="msapplication-TileColor" content="#FFFFFF">
    <meta name="msapplication-TileImage" content="/favicon-144.png">
{% block meta %}
    {% if metaDescription or contents %}
    <meta name="description" itemprop="description" content="{% if metaDescription %}{{ metaDescription }}{% else %}{{ contents|striptags|shorten(150) }}{% endif %}">
    {% endif %}
{% endblock %}
</head>
<body class="{{ section }}">
    {% block menu %}
        <header class="site-header">
            <nav itemscope itemtype="http://www.schema.org/SiteNavigationElement" class="site-menu">
                <ul>
                    <li{% if section == "home" %} class="site-menu-selected"{% endif %}>
                        <a href="/" class="back-home icon-mtb site-menu-link" itemprop="url"><span class="menu-text" itemprop="name">{{ config.shortTitle }}</span></a>
                    </li>
                    {% for item in menu %}
                    <li{% if selected == item.section %} class="site-menu-selected"{% endif %}><a href="{{ item.path|url }}" class="icon-{{ item.icon }} site-menu-link"{% if item.long %} title="{{ item.long }}"{% endif %} itemprop="url"><span class="menu-text" itemprop="name">{{ item.title }}</span></a></li>
                    {% endfor %}
                </ul>
            </nav>
        </header>
    {% endblock %}

    {% block pageTitle %}{% endblock %}

    {% block breadcrumb %}{% endblock %}
    <section class="site-main">
        <div class="site-main-content" itemprop="mainContentOfPage">
        {% block content %}{% endblock %}
        </div>
    </section>

    {% block footer %}
    <footer class="site-footer" itemscope itemtype="http://www.schema.org/WPFooter">
        <div class="site-footer-content pure-g">
            <div class="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 site-footer-part friends-link">
                <h2 class="site-footer-part-title">Quelques liens</h2>
                {{ links|safe }}
            </div>
            <div class="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 site-footer-part social-networks">
                <h2 class="site-footer-part-title">Réseaux sociaux</h2>

                {{ social|safe }}
            </div>
            <div class="pure-u-1 pure-u-sm-1 pure-u-md-1-3 site-footer-part copyright-notice">
                {{ copyright|safe }}
            </div>
        </div>
    </footer>
    {% endblock %}

    <script src="{{ jsFile|url(true) }}"></script>
    <script>
    (function(doc){
        doc.body.classList.add('js-enabled');
        L.Icon.Default.imagePath = "{{ config.leafletDefaultImagePath|asset()|e('js') }}";
    })(document);
    {% block javascriptCode %}{% endblock %}

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-54942816-1', 'auto');
    ga('send', 'pageview');
    </script>
</body>
</html>
