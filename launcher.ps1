# 1. 進入工作目錄
Set-Location "C:\Users\Lam\Desktop\SzeMan"

# 2. 啟動 Python 網關視窗
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\Lam\Desktop\SzeMan'; python proxy.py"

# 3. 緩衝 3 秒確保 Port 4000 已經綁定
Start-Sleep -Seconds 3

# 4. 啟動 Claude Code 視窗並注入環境變數
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:ANTHROPIC_BASE_URL='http://127.0.0.1:4000'; Set-Location 'C:\Users\Lam\Desktop\SzeMan'; claude"