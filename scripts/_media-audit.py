#!/usr/bin/env python3
"""READ-ONLY audit of the WP media library on wenumapuonline.com (HostGator).
Pages all media via WP REST (Basic auth with the ecm app password), sums the
full-size + every generated thumbnail, and reports where the disk is going.
Writes /tmp/media-audit.json and a human summary to /tmp/media-audit.txt. Deletes nothing."""
import os, json, base64, urllib.request, urllib.parse, ssl, collections, time
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
USER=env("WP_USER"); PW=env("WP_APP_PASSWORD")
tok=base64.b64encode(f"{USER}:{PW}".encode()).decode()
UA={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15","Authorization":"Basic "+tok}
ctx=ssl.create_default_context()
BASE="https://www.wenumapuonline.com/wp-json/wp/v2/media"
def get(page):
    q=urllib.parse.urlencode({"per_page":100,"page":page,"_fields":"id,date,source_url,mime_type,media_details"})
    r=urllib.request.Request(BASE+"?"+q,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x:
        return json.loads(x.read().decode()), x.headers

total_bytes=0; orig_bytes=0; thumb_bytes=0; n=0
by_month=collections.Counter(); by_mime=collections.Counter()
heavy=[]  # (bytes_including_thumbs, id, url, mime)
page=1; pages=None
while True:
    try:
        items,hdr=get(page)
    except Exception as e:
        # retry once
        time.sleep(3)
        try: items,hdr=get(page)
        except Exception as e2:
            open("/tmp/media-audit.txt","a").write(f"\nERROR page {page}: {str(e2)[:120]}\n"); break
    if pages is None:
        pages=int(hdr.get("X-WP-TotalPages","1"))
    if not items: break
    for m in items:
        n+=1
        md=m.get("media_details") or {}
        fs=md.get("filesize") or 0
        sizes=md.get("sizes") or {}
        # unique generated files (each size is a separate file on disk)
        tb=0
        seen=set()
        for s in sizes.values():
            f=s.get("file"); sfs=s.get("filesize") or 0
            if f and f not in seen:
                seen.add(f); tb+=sfs
        item_total=fs+tb
        total_bytes+=item_total; orig_bytes+=fs; thumb_bytes+=tb; n=n
        mon=(m.get("date") or "")[:7]
        by_month[mon]+=item_total
        by_mime[m.get("mime_type","?")]+=item_total
        heavy.append((item_total,m["id"],m.get("source_url","").split("/")[-1],m.get("mime_type","")))
    if page>=pages: break
    page+=1

heavy.sort(reverse=True)
def mb(b): return f"{b/1048576:.1f}MB"
out=[]
out.append(f"MEDIA AUDIT wenumapuonline.com  (READ-ONLY, nothing deleted)")
out.append(f"items counted: {n}")
out.append(f"TOTAL disk in media (orig+thumbs): {mb(total_bytes)} ({total_bytes/1073741824:.2f} GB)")
out.append(f"  originals: {mb(orig_bytes)}   generated thumbnails: {mb(thumb_bytes)}")
out.append("")
out.append("By file type:")
for k,v in by_mime.most_common(): out.append(f"  {k:24} {mb(v)}")
out.append("")
out.append("Heaviest 10 months (upload date):")
for k,v in sorted(by_month.items(),key=lambda x:-x[1])[:10]: out.append(f"  {k or '??'}  {mb(v)}")
out.append("")
out.append("Top 25 heaviest media (incl. their thumbnails):")
for b,i,name,mime in heavy[:25]: out.append(f"  {mb(b):>8}  id={i:<6} {mime:18} {name}")
txt="\n".join(out)
open("/tmp/media-audit.txt","w").write(txt+"\nDONE\n")
json.dump({"n":n,"total":total_bytes,"orig":orig_bytes,"thumb":thumb_bytes,
           "by_mime":dict(by_mime),"by_month":dict(by_month),
           "top":[(b,i,name,mime) for b,i,name,mime in heavy[:60]]},
          open("/tmp/media-audit.json","w"))
print(txt)
