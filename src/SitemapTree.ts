import { Resource } from '.';

export class SitemapTree {
  private _resource: Resource | null;
  private _parent: SitemapTree | null;
  private _children: SitemapTree[];
  private _url: string | null;
  private _urlPart;
  private urls: Record<string, SitemapTree>;

  constructor(urlPart: string | null, urls?: Record<string, SitemapTree>) {
    this._resource = null;
    this._parent = null;
    this._children = [];
    this._url = null;
    this.urls = urls || {};
    this._urlPart = urlPart;
  }

  /**
   * The attached resource.
   */
  get resource() {
    return this._resource;
  }

  /**
   * The parent of the sitemap tree.
   */
  get parent() {
    return this._parent;
  }

  /**
   * The children of the sitemap tree.
   */
  get children() {
    return this._children;
  }

  /**
   * The URL of the sitemap tree.
   */
  get url() {
    return this._url;
  }

  /**
   * The URL part of the sitemap tree.
   */
  get urlPart() {
    return this._urlPart;
  }

  /**
   * The siblings of the sitemap tree, including itself.
   */
  get siblings() {
    return this._parent?._children || [];
  }

  /**
   * All URLs in the sitemap tree.
   */
  get allUrls() {
    return this.urls;
  }

  /**
   * Add a resource to the sitemap tree.
   *
   * @param resource The resource to add.
   */
  add(resource: Resource) {
    const parts = resource.destination.split('/').filter(Boolean);

    this.addParts(parts, [], resource);
  }

  /**
   * Retrieve a sub-tree in a sitemap tree from a URL.
   *
   * @param url The URL to retrieve the sub-tree from.
   */
  fromUrl(url: string) {
    return this.urls[url];
  }

  private addParts(parts: string[], usedParts: string[], resource: Resource) {
    if (parts.length <= 0) {
      this._resource = resource;

      return;
    }

    const [currentPart, ...otherParts] = parts;
    const newUsedParts = [...usedParts, currentPart];
    const matchingChild = this._children.filter(
      child => child._urlPart === currentPart
    );

    let child = matchingChild.length ? matchingChild[0] : null;

    if (!child) {
      child = new SitemapTree(currentPart, this.urls);
      child._parent = this;
      child._url = newUsedParts.join('/');

      this.urls[child._url] = child;

      this._children.push(child);
    }

    child!.addParts(otherParts, newUsedParts, resource);
  }
}
