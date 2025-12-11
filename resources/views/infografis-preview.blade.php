<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $fileName }} - Preview Infografis</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #1a1a1a;
            padding: 20px;
        }
        
        .image-container {
            max-width: 100%;
            max-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .image-container img {
            max-width: 100%;
            max-height: 100vh;
            width: auto;
            height: auto;
            object-fit: contain;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .error-message {
            color: white;
            text-align: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        .file-name {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .download-btn {
            background-color: rgba(59, 130, 246, 0.9);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background-color 0.2s;
        }
        
        .download-btn:hover {
            background-color: rgba(59, 130, 246, 1);
        }
        
        .download-btn:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <div class="image-container">
        <img 
            id="preview-image"
            src="{{ $imageUrl }}" 
            alt="{{ $fileName }}"
            style="display: block;"
        />
        <div class="error-message" id="error-message" style="display: none;">
            <p>Gagal memuat gambar.</p>
            <p><a href="https://drive.google.com/file/d/{{ $fileId }}/view" target="_blank" style="color: #60a5fa;">Buka gambar di Google Drive</a></p>
        </div>
    </div>
    
    <script>
        const img = document.getElementById('preview-image');
        const errorMsg = document.getElementById('error-message');
        
        img.onerror = function() {
            img.style.display = 'none';
            if (errorMsg) {
                errorMsg.style.display = 'block';
            }
        };
    </script>
    <div class="file-name">
        <span>{{ $fileName }}</span>
        <a href="/infografis/{{ $id }}/download" class="download-btn" download>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
        </a>
    </div>
</body>
</html>

