import json
import re
import urllib.request
import urllib.error
import concurrent.futures
import os

CDN_BASE = "https://pub-2b4562c758ed440ab047fe9523a2d99c.r2.dev"
MANIFEST_JSON = "/Users/user1/wenu-frontend/public/kodex-content/manifest.json"

def check_asset_url(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'KODEX-CDN-Verifier/1.0')
        with urllib.request.urlopen(req, timeout=5) as resp:
            return url, resp.status == 200, resp.status
    except urllib.error.HTTPError as e:
        return url, False, e.code
    except Exception as e:
        return url, False, str(e)

def verify_r2_cdn():
    print("=======================================================")
    print("RECOMENDACIÓN 1: VERIFICACIÓN DE ASSETS EN CDN CLOUDFLARE R2")
    print("=======================================================")
    
    with open(MANIFEST_JSON, 'r', encoding='utf8') as f:
        manifest = json.load(f)
        
    volumes = manifest.get('volumes', [])
    art_volumes = [v for v in volumes if v.get('assembly_os')]
    
    print(f"Total Obras Canónicas con Assembly OS en Manifiesto: {len(art_volumes)}")
    
    urls_to_test = []
    for v in art_volumes:
        assets = v.get('assets', [])
        for a in assets:
            src = a.get('src') if isinstance(a, dict) else a
            if src:
                clean_src = re.sub(r'^\.?\/', '', src)
                full_url = f"{CDN_BASE}/kodex-content/{clean_src}"
                urls_to_test.append((v['id'], full_url))
                
    print(f"Probando {len(urls_to_test)} URLs en la CDN R2 (Cloudflare)...\n")
    
    success_count = 0
    failed_urls = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(check_asset_url, u[1]): u for u in urls_to_test}
        for future in concurrent.futures.as_completed(futures):
            spec_id, url = futures[future]
            try:
                tested_url, is_ok, status = future.result()
                if is_ok:
                    success_count += 1
                else:
                    failed_urls.append((spec_id, url, status))
            except Exception as e:
                failed_urls.append((spec_id, url, str(e)))

    print(f"Resultados de Verificación CDN R2:")
    print(f"  - URLs Exitosas en CDN (HTTP 200 OK): {success_count}/{len(urls_to_test)} ({success_count/len(urls_to_test)*100:.1f}%)")
    print(f"  - URLs Fallidas/Pendientes en CDN: {len(failed_urls)}")

    if failed_urls:
        print("\nNote: Assets no encontrados en R2 son servidos por el fallback local del servidor SSG.")
    else:
        print("\n🎉 100% DE ASSETS VERIFICADOS EN LA CDN R2 DE CLOUDFLARE!")

if __name__ == '__main__':
    verify_r2_cdn()
