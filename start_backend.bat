@echo off
title SkyGuard AI - FastAPI ML Backend Server
cd /d "%~dp0sih-ml-project-main"
echo ============================================================
echo Starting SkyGuard AI FastAPI Streaming Backend on Port 8000...
echo ============================================================
"C:\Users\shrma\AppData\Local\Programs\Python\Python310\python.exe" -m uvicorn src.api.app:app --host 127.0.0.1 --port 8000 --reload
pause
