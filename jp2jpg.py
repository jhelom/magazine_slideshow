from PIL import Image
import os

# 変換するJP2ファイルが入っているディレクトリ
input_dir = 'dist/jp2'
# 変換後のJPEGファイルを保存するディレクトリ
output_dir = 'dist/img'

# 出力ディレクトリが存在しない場合は作成
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# ディレクトリ内の全てのファイルを処理
for filename in os.listdir(input_dir):
    if filename.endswith('.jp2'):
        jp2_path = os.path.join(input_dir, filename)
        jpeg_path = os.path.join(output_dir, os.path.splitext(filename)[0] + '.jpg')
        
        # 画像を開いてJPEGとして保存
        with Image.open(jp2_path) as img:
            width, height = img.size
            new_height = 1080
            new_width = int((new_height / height) * width)
            resized_image = img.resize((new_width, new_height))
            resized_image.convert('RGB').save(jpeg_path, 'JPEG')
        
        print(f'Converted {filename} to {jpeg_path}')

print("すべてのJP2ファイルをJPEGに変換しました。")
