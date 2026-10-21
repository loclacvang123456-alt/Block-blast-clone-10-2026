import os
import zipfile

zip_filename = 'pixel-blast-gamedistribution.zip'
dist_dir = 'dist'

if os.path.exists(zip_filename):
    os.remove(zip_filename)

print(f"Creating {zip_filename} with POSIX forward-slash paths for GameDistribution...")

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            full_path = os.path.join(root, file)
            # Ensure UNIX / POSIX forward-slash path format inside the zip
            archive_name = os.path.relpath(full_path, dist_dir).replace('\\', '/')
            zipf.write(full_path, archive_name)
            print(f"  + {archive_name}")

print(f"[OK] Successfully generated {zip_filename} ({os.path.getsize(zip_filename)} bytes)")
