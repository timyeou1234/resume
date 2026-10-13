#!/usr/bin/env python3
"""Render both crawlable locales from the single bilingual portfolio template."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ORIGIN = "https://timyeou.com"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class LocaleRenderer(HTMLParser):
    def __init__(self, language):
        super().__init__(convert_charrefs=False)
        self.language = language
        self.url = ORIGIN + ("/en/" if language == "en" else "/")
        self.output = []
        self.translated_tag = None

    def handle_starttag(self, tag, pairs):
        if self.translated_tag:
            raise ValueError("Localized text must be a leaf element; nested markup would be lost")
        attrs = dict(pairs)
        for target, key in (("aria-label", "aria"), ("href", "href"), ("src", "image"), ("alt", "alt"), ("content", "content"), ("title", "title"), ("poster", "poster")):
            localized = attrs.get(f"data-{key}-{self.language}")
            if localized is not None:
                attrs[target] = localized
        for key, value in list(attrs.items()):
            if value and value.startswith("./") and (key in {"src", "href", "poster"} or key.startswith(("data-image-", "data-href-", "data-src-", "data-mobile-src-", "data-poster-", "data-mobile-poster-"))):
                attrs[key] = value[1:]
        if tag == "html":
            attrs["lang"] = "en" if self.language == "en" else "zh-Hant"
        if (tag == "link" and attrs.get("rel") == "canonical"):
            attrs["href"] = self.url
        if tag == "meta" and attrs.get("property") == "og:url":
            attrs["content"] = self.url
        if "lang-toggle" in attrs.get("class", "").split():
            attrs.update(href="/" if self.language == "en" else "/en/",
                         hreflang="zh-Hant" if self.language == "en" else "en")
            attrs["aria-label"] = "切換為繁體中文" if self.language == "en" else "Switch to English"
        attributes = "".join(f' {key}' if value is None else f' {key}="{escape(value, quote=True)}"' for key, value in attrs.items())
        self.output.append(f"<{tag}{attributes}>")
        translation = attrs.get(f"data-{self.language}")
        if attrs.get("class") == "lang-current":
            translation = "EN" if self.language == "en" else "中"
        if attrs.get("class") == "lang-next":
            translation = "中" if self.language == "en" else "EN"
        if translation is not None and tag not in VOID:
            self.output.append(escape(translation, quote=False))
            self.translated_tag = tag

    def handle_endtag(self, tag):
        if self.translated_tag:
            if self.translated_tag != tag:
                raise ValueError(f"Unexpected close tag in localized text: {tag}")
            self.translated_tag = None
        self.output.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.translated_tag:
            self.output.append(data)

    def handle_entityref(self, name):
        self.handle_data(f"&{name};")

    def handle_charref(self, name):
        self.handle_data(f"&#{name};")

    def handle_decl(self, decl):
        self.output.append(f"<!{decl}>")

    def handle_comment(self, data):
        self.output.append(f"<!--{data}-->")


def main():
    source = (REPO / "site/index.html").read_text()
    dist = REPO / ".portfolio-dist"
    for language, filename in (("zh", "index.html"), ("en", "en/index.html")):
        renderer = LocaleRenderer(language)
        renderer.feed(source)
        renderer.close()
        if renderer.translated_tag:
            raise ValueError("Unclosed translated element")
        target = dist / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("".join(renderer.output))
    (dist / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {ORIGIN}/sitemap.xml\n")
    urls = ""
    for zh_route, en_route in (("/", "/en/"), ("/resume/", "/en/resume/")):
        links = "".join(f'<xhtml:link rel="alternate" hreflang="{lang}" href="{ORIGIN}{route}"/>'
                        for lang, route in (("zh-Hant", zh_route), ("en", en_route), ("x-default", zh_route)))
        urls += "".join(f"<url><loc>{ORIGIN}{route}</loc>{links}</url>" for route in (zh_route, en_route))
    (dist / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
        + urls + "</urlset>\n")


if __name__ == "__main__":
    main()
